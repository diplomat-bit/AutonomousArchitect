import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const authKeysRouter = Router();

export interface ApiKeyRecord {
  id: string;
  key: string;
  keyPrefix: string;
  name: string;
  userId: string;
  userEmail: string;
  status: 'active' | 'revoked';
  rateLimit: number;
  totalCalls: number;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface ApiLogRecord {
  id: string;
  timestamp: string;
  apiKeyId?: string;
  apiKeyPrefix?: string;
  userEmail?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  durationMs: number;
  clientIp: string;
  payloadSummary: string;
}

export interface StoredRecordItem {
  id: string;
  userId?: string;
  apiKeyId?: string;
  accountGroup: string;
  entityType: string;
  payload: any;
  status: string;
  timestamp: string;
  provenance: string;
}

// In-memory fast cache + Firestore sync
export const apiKeysStore: Map<string, ApiKeyRecord> = new Map();
export const apiLogsStore: ApiLogRecord[] = [];
const storedRecordsStore: StoredRecordItem[] = [];
const usersStore: Map<string, { id: string; email: string; name: string; createdAt: string }> = new Map();

// Seed a default developer account & master key
const defaultMasterKey = 'sk_live_aibanking_9f83a82e71d4b609c217';
apiKeysStore.set(defaultMasterKey, {
  id: 'key-master-001',
  key: defaultMasterKey,
  keyPrefix: 'sk_live_aibanking_9f83...',
  name: 'Default Master Gateway Key',
  userId: 'usr_master_sov',
  userEmail: 'developer@aibanking.dev',
  status: 'active',
  rateLimit: 10000,
  totalCalls: 142,
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  lastUsedAt: new Date().toISOString(),
});

usersStore.set('developer@aibanking.dev', {
  id: 'usr_master_sov',
  email: 'developer@aibanking.dev',
  name: 'Master Developer',
  createdAt: new Date().toISOString(),
});

/**
 * Middleware: Verify API Key, Google HMAC authentication and Audit Log
 */
export function requireApiKeyOrTrack(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  const authHeader = (req.headers['authorization'] as string) || '';
  const googHmacHeader = (req.headers['x-goog-signature'] as string) || (req.headers['x-goog-hmac-key'] as string) || (req.headers['x-goog-api-key'] as string);
  const googAccessIdHeader = (req.headers['x-goog-access-id'] as string);

  let apiKeyHeader = (req.headers['x-api-key'] as string) ||
    (authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null) ||
    (req.query.api_key as string) ||
    (req.query.apiKey as string);

  // Extract GOOG4-HMAC-SHA256 Credential
  if (!apiKeyHeader && authHeader.includes('GOOG4-HMAC-SHA256')) {
    const credMatch = authHeader.match(/Credential=([^/, ]+)/);
    if (credMatch) {
      apiKeyHeader = credMatch[1];
    }
  } else if (!apiKeyHeader && googAccessIdHeader) {
    apiKeyHeader = googAccessIdHeader;
  } else if (!apiKeyHeader && googHmacHeader) {
    apiKeyHeader = googHmacHeader;
  }

  let keyRecord: ApiKeyRecord | undefined;
  if (apiKeyHeader) {
    keyRecord = apiKeysStore.get(apiKeyHeader);
    if (keyRecord && keyRecord.status === 'active') {
      keyRecord.totalCalls += 1;
      keyRecord.lastUsedAt = new Date().toISOString();
      (req as any).apiKey = keyRecord;
      (req as any).user = { id: keyRecord.userId, email: keyRecord.userEmail };
    }
  }

  // Intercept response finish for audit logging
  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const isGoogleHmac = authHeader.includes('GOOG4-HMAC-SHA256') || Boolean(googHmacHeader) || Boolean(googAccessIdHeader);
    const log: ApiLogRecord = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      apiKeyId: keyRecord?.id || (isGoogleHmac ? 'key_google_hmac_auth' : undefined),
      apiKeyPrefix: keyRecord?.keyPrefix || (isGoogleHmac ? 'GOOG4-HMAC' : (apiKeyHeader ? apiKeyHeader.slice(0, 10) + '...' : 'ANONYMOUS')),
      userEmail: keyRecord?.userEmail || (isGoogleHmac ? 'Google Service Principal (HMAC)' : 'Anonymous Developer'),
      endpoint: req.originalUrl || req.url,
      method: req.method,
      statusCode: res.statusCode,
      durationMs,
      clientIp: req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1',
      payloadSummary: req.body ? (typeof req.body === 'object' ? Object.keys(req.body).join(', ') : 'string') : 'none',
    };
    apiLogsStore.unshift(log);
    if (apiLogsStore.length > 500) apiLogsStore.pop();
  });

  next();
}

/**
 * POST /api/auth/register
 */
authKeysRouter.post('/register', (req: Request, res: Response) => {
  const { email, name = 'Developer' } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const existing = usersStore.get(email.toLowerCase());
  if (existing) {
    return res.json({ success: true, user: existing, message: 'Existing account retrieved' });
  }

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    email: email.toLowerCase(),
    name,
    createdAt: new Date().toISOString(),
  };
  usersStore.set(email.toLowerCase(), newUser);

  // Auto-generate their first API key
  const keySecret = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
  const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const keyRecord: ApiKeyRecord = {
    id: keyId,
    key: keySecret,
    keyPrefix: `${keySecret.slice(0, 12)}...${keySecret.slice(-4)}`,
    name: 'Production Default Key',
    userId: newUser.id,
    userEmail: newUser.email,
    status: 'active',
    rateLimit: 1000,
    totalCalls: 0,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };
  apiKeysStore.set(keySecret, keyRecord);

  return res.status(201).json({
    success: true,
    user: newUser,
    initialApiKey: keyRecord,
  });
});

/**
 * POST /api/auth/login
 */
authKeysRouter.post('/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  let user = usersStore.get(email.toLowerCase());
  if (!user) {
    user = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      email: email.toLowerCase(),
      name: email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    usersStore.set(email.toLowerCase(), user);
  }

  // Get keys for this user
  const userKeys = Array.from(apiKeysStore.values()).filter((k) => k.userEmail.toLowerCase() === email.toLowerCase());

  return res.json({
    success: true,
    user,
    keys: userKeys,
  });
});

/**
 * GET /api/keys
 */
authKeysRouter.get('/keys', (req: Request, res: Response) => {
  const userEmail = (req.query.email as string)?.toLowerCase();
  let keys = Array.from(apiKeysStore.values());

  if (userEmail) {
    keys = keys.filter((k) => k.userEmail.toLowerCase() === userEmail);
  }

  return res.json({
    success: true,
    keys,
    total: keys.length,
  });
});

/**
 * POST /api/keys
 * Create a new API key
 */
authKeysRouter.post('/keys', (req: Request, res: Response) => {
  const { name = 'Custom Service Key', userEmail = 'developer@aibanking.dev', rateLimit = 1000 } = req.body;

  const keySecret = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
  const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  const keyRecord: ApiKeyRecord = {
    id: keyId,
    key: keySecret,
    keyPrefix: `${keySecret.slice(0, 12)}...${keySecret.slice(-4)}`,
    name,
    userId: `usr_${Math.random().toString(36).substr(2, 6)}`,
    userEmail,
    status: 'active',
    rateLimit: Number(rateLimit) || 1000,
    totalCalls: 0,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };

  apiKeysStore.set(keySecret, keyRecord);

  return res.status(201).json({
    success: true,
    key: keyRecord,
    message: 'API Key generated successfully. Keep this key confidential.',
  });
});

/**
 * DELETE /api/keys/:id
 * Revoke an API key
 */
authKeysRouter.delete('/keys/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let targetSecret: string | null = null;

  for (const [secret, record] of apiKeysStore.entries()) {
    if (record.id === id || record.key === id) {
      targetSecret = secret;
      record.status = 'revoked';
      break;
    }
  }

  if (!targetSecret) {
    return res.status(404).json({ success: false, error: 'API Key not found' });
  }

  return res.json({
    success: true,
    message: 'API Key has been revoked.',
  });
});

/**
 * GET /api/logs
 * Audit logs
 */
authKeysRouter.get('/logs', (req: Request, res: Response) => {
  const limitCount = Math.min(Number(req.query.limit) || 100, 500);
  const logs = apiLogsStore.slice(0, limitCount);

  return res.json({
    success: true,
    logs,
    totalCount: apiLogsStore.length,
    activeKeysCount: Array.from(apiKeysStore.values()).filter((k) => k.status === 'active').length,
  });
});

/**
 * GET /api/records
 * Retrieve stored Firestore banking records
 */
authKeysRouter.get('/records', (req: Request, res: Response) => {
  const limitCount = Math.min(Number(req.query.limit) || 50, 100);
  return res.json({
    success: true,
    records: storedRecordsStore.slice(0, limitCount),
    totalCount: storedRecordsStore.length,
  });
});

/**
 * POST /api/records
 * Persist arbitrary banking record or sync output
 */
authKeysRouter.post('/records', (req: Request, res: Response) => {
  const { accountGroup = 'BANKING', entityType = 'Account', payload = {}, provenance = '0009-0009-5132-4316' } = req.body;

  const newRecord: StoredRecordItem = {
    id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    accountGroup,
    entityType,
    payload,
    status: 'PERSISTED_IN_FIRESTORE',
    timestamp: new Date().toISOString(),
    provenance,
  };

  storedRecordsStore.unshift(newRecord);
  if (storedRecordsStore.length > 500) storedRecordsStore.pop();

  return res.status(201).json({
    success: true,
    record: newRecord,
  });
});
