import { Router, Request, Response } from 'express';
import { lockCallIntoQuickBooks } from './intuit-api.js';

export const finicityApiRouter = Router();

export interface FinicityConfigState {
  baseUrl: string;
  appKey: string;
  partnerId: string;
  partnerSecret: string;
  appToken: string;
  tokenExpiresAt: number | null;
  customerId: string;
  customerUsername: string;
  connectUrl: string;
  environment: 'sandbox' | 'production';
}

export function getFinicityEnvConfig(): FinicityConfigState {
  return {
    baseUrl: (process.env.FINICITY_API_BASE_URL || 'https://api.finicity.com').trim(),
    appKey: (process.env.FINICITY_APP_KEY || process.env.MASTERCARD_APP_KEY || '').trim(),
    partnerId: (process.env.FINICITY_PARTNER_ID || process.env.MASTERCARD_PARTNER_ID || '').trim(),
    partnerSecret: (process.env.FINICITY_PARTNER_SECRET || process.env.MASTERCARD_PARTNER_SECRET || '').trim(),
    appToken: (process.env.FINICITY_APP_TOKEN || '').trim(),
    tokenExpiresAt: null,
    customerId: (process.env.FINICITY_CUSTOMER_ID || '1005061234').trim(),
    customerUsername: (process.env.FINICITY_CUSTOMER_USERNAME || 'finbank_test_user1').trim(),
    connectUrl: '',
    environment: (process.env.FINICITY_ENVIRONMENT === 'production' ? 'production' : 'sandbox'),
  };
}

// In-memory runtime session for Mastercard Open Finance / Finicity
let runtimeFinicityState: FinicityConfigState = getFinicityEnvConfig();

// Cached accounts and transactions store for instant retrieval & syncing
let cachedAccounts: any[] = [];
let cachedTransactions: any[] = [];

/**
 * Generate .env format block for Finicity / Mastercard
 */
export function generateFinicityEnvExport(c: FinicityConfigState): string {
  const maskedSecret = c.partnerSecret ? '••••••••' : '';

  return `# ==============================================================================
# Mastercard Open Finance / Finicity Integration (.env Template)
# NOTE: Partner Secrets are masked to protect credentials against unauthorized export.
# ==============================================================================
FINICITY_API_BASE_URL="${c.baseUrl}"
FINICITY_APP_KEY="${c.appKey}"
FINICITY_PARTNER_ID="${c.partnerId}"
FINICITY_PARTNER_SECRET="${maskedSecret}"
FINICITY_APP_TOKEN="${c.appToken}"
FINICITY_CUSTOMER_ID="${c.customerId}"
FINICITY_CUSTOMER_USERNAME="${c.customerUsername}"
FINICITY_ENVIRONMENT="${c.environment}"`;
}

/**
 * GET /api/finicity/config
 */
finicityApiRouter.get('/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    config: {
      ...runtimeFinicityState,
      partnerSecretMasked: runtimeFinicityState.partnerSecret
        ? `${runtimeFinicityState.partnerSecret.slice(0, 4)}...${runtimeFinicityState.partnerSecret.slice(-3)}`
        : 'NOT_SET',
    },
    cachedAccountsCount: cachedAccounts.length,
    cachedTransactionsCount: cachedTransactions.length,
    envExport: generateFinicityEnvExport(runtimeFinicityState),
  });
});

/**
 * POST /api/finicity/config
 */
finicityApiRouter.post('/config', (req: Request, res: Response) => {
  try {
    const updates = req.body || {};
    runtimeFinicityState = {
      ...runtimeFinicityState,
      ...updates,
    };
    res.json({
      success: true,
      message: 'Finicity configuration updated',
      config: runtimeFinicityState,
      envExport: generateFinicityEnvExport(runtimeFinicityState),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * STEP 1: POST /api/finicity/auth/token
 * Creates a new Finicity-App-Token
 * Target: https://api.finicity.com/aggregation/v2/partners/authentication
 */
finicityApiRouter.post('/auth/token', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const appKey = (req.body.appKey || runtimeFinicityState.appKey || '').trim();
  const partnerId = (req.body.partnerId || runtimeFinicityState.partnerId || '').trim();
  const partnerSecret = (req.body.partnerSecret || runtimeFinicityState.partnerSecret || '').trim();

  if (!appKey || !partnerId || !partnerSecret) {
    return res.status(400).json({
      success: false,
      error: 'Missing required credentials: appKey, partnerId, and partnerSecret are required.',
    });
  }

  const targetUrl = `${runtimeFinicityState.baseUrl}/aggregation/v2/partners/authentication`;
  const requestHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Finicity-App-Key': appKey,
  };
  const requestBody = {
    partnerId,
    partnerSecret,
  };

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    const status = upstreamRes.status;
    let data: any = null;
    try {
      data = await upstreamRes.json();
    } catch {
      data = { rawText: await upstreamRes.text() };
    }

    if (upstreamRes.ok && data?.token) {
      // Valid token received
      const token = data.token;
      runtimeFinicityState.appToken = token;
      runtimeFinicityState.appKey = appKey;
      runtimeFinicityState.partnerId = partnerId;
      runtimeFinicityState.partnerSecret = partnerSecret;
      runtimeFinicityState.tokenExpiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours

      return res.json({
        success: true,
        source: 'live_mastercard_finicity',
        status,
        durationMs: Date.now() - startTime,
        token,
        expiresInSeconds: 7200,
        tokenExpiresAt: runtimeFinicityState.tokenExpiresAt,
        advisoryRefreshMinutes: 90,
        url: targetUrl,
        requestHeaders,
        response: data,
      });
    }

    // If upstream returns 401 or mock test mode is requested
    return res.status(status).json({
      success: false,
      source: 'live_mastercard_finicity',
      status,
      durationMs: Date.now() - startTime,
      url: targetUrl,
      requestHeaders,
      response: data,
      message: data?.message || 'Authentication failed with Mastercard Open Finance upstream.',
    });
  } catch (netErr: any) {
    // Network or Sandbox simulation mode fallback
    const simulatedToken = 'YBh22Sb9Es6e66Q7lWdt_' + Math.random().toString(36).substring(2, 8);
    runtimeFinicityState.appToken = simulatedToken;
    runtimeFinicityState.tokenExpiresAt = Date.now() + 2 * 60 * 60 * 1000;

    return res.json({
      success: true,
      source: 'simulation_fallback',
      status: 200,
      durationMs: Date.now() - startTime,
      token: simulatedToken,
      expiresInSeconds: 7200,
      tokenExpiresAt: runtimeFinicityState.tokenExpiresAt,
      advisoryRefreshMinutes: 90,
      url: targetUrl,
      requestHeaders,
      response: {
        token: simulatedToken,
        _simulationNote: `Connected via simulation fallback due to network condition: ${netErr.message}`,
      },
    });
  }
});

/**
 * STEP 2: POST /api/finicity/customers/testing
 * Creates a testing customer record for FinBank test profiles
 * Target: https://api.finicity.com/aggregation/v2/customers/testing
 */
finicityApiRouter.post('/customers/testing', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const appKey = (req.body.appKey || runtimeFinicityState.appKey || '').trim();
  const appToken = (req.body.appToken || runtimeFinicityState.appToken || '').trim();
  const username = (req.body.username || runtimeFinicityState.customerUsername || `cust_${Date.now().toString(36)}`).trim();

  if (!appKey || !appToken) {
    return res.status(400).json({
      success: false,
      error: 'Finicity-App-Key and Finicity-App-Token are required. Complete Step 1 first.',
    });
  }

  const targetUrl = `${runtimeFinicityState.baseUrl}/aggregation/v2/customers/testing`;
  const requestHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Finicity-App-Key': appKey,
    'Finicity-App-Token': appToken,
  };
  const requestBody = { username };

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    const status = upstreamRes.status;
    let data: any = null;
    try {
      data = await upstreamRes.json();
    } catch {
      data = { rawText: await upstreamRes.text() };
    }

    if (upstreamRes.ok && data?.id) {
      runtimeFinicityState.customerId = String(data.id);
      runtimeFinicityState.customerUsername = data.username || username;

      return res.json({
        success: true,
        source: 'live_mastercard_finicity',
        status,
        durationMs: Date.now() - startTime,
        customer: data,
        customerId: String(data.id),
        url: targetUrl,
        requestHeaders,
        requestBody,
        response: data,
      });
    }

    // If upstream returns error or customer already exists
    return res.status(status).json({
      success: false,
      source: 'live_mastercard_finicity',
      status,
      durationMs: Date.now() - startTime,
      url: targetUrl,
      requestHeaders,
      requestBody,
      response: data,
    });
  } catch (netErr: any) {
    const mockId = '1005' + Math.floor(100000 + Math.random() * 900000);
    const mockCustomer = {
      id: mockId,
      username,
      createdDate: Math.floor(Date.now() / 1000),
    };
    runtimeFinicityState.customerId = mockId;
    runtimeFinicityState.customerUsername = username;

    return res.json({
      success: true,
      source: 'simulation_fallback',
      status: 200,
      durationMs: Date.now() - startTime,
      customer: mockCustomer,
      customerId: mockId,
      url: targetUrl,
      requestHeaders,
      requestBody,
      response: {
        ...mockCustomer,
        _simulationNote: `Simulated customer creation: ${netErr.message}`,
      },
    });
  }
});

/**
 * STEP 3: POST /api/finicity/connect/generate
 * Generates a Mastercard Data Connect URL
 * Target: https://api.finicity.com/connect/v2/generate
 */
finicityApiRouter.post('/connect/generate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const appKey = (req.body.appKey || runtimeFinicityState.appKey || '').trim();
  const appToken = (req.body.appToken || runtimeFinicityState.appToken || '').trim();
  const partnerId = (req.body.partnerId || runtimeFinicityState.partnerId || '').trim();
  const customerId = (req.body.customerId || runtimeFinicityState.customerId || '').trim();

  if (!appKey || !appToken || !partnerId || !customerId) {
    return res.status(400).json({
      success: false,
      error: 'appKey, appToken, partnerId, and customerId are required to generate Data Connect URL.',
    });
  }

  const targetUrl = `${runtimeFinicityState.baseUrl}/connect/v2/generate`;
  const requestHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Finicity-App-Key': appKey,
    'Finicity-App-Token': appToken,
  };
  const requestBody = { partnerId, customerId };

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });

    const status = upstreamRes.status;
    let data: any = null;
    try {
      data = await upstreamRes.json();
    } catch {
      data = { rawText: await upstreamRes.text() };
    }

    if (upstreamRes.ok && data?.link) {
      runtimeFinicityState.connectUrl = data.link;

      return res.json({
        success: true,
        source: 'live_mastercard_finicity',
        status,
        durationMs: Date.now() - startTime,
        link: data.link,
        url: targetUrl,
        requestHeaders,
        requestBody,
        response: data,
      });
    }

    return res.status(status).json({
      success: false,
      source: 'live_mastercard_finicity',
      status,
      durationMs: Date.now() - startTime,
      url: targetUrl,
      requestHeaders,
      requestBody,
      response: data,
    });
  } catch (netErr: any) {
    const mockLink = `https://connect2.finicity.com?customerId=${customerId}&origin=url&partnerId=${partnerId}&signature=91f44ab969a9c7bb2568910d92501eb13aa0b7fd4fd56314ab8ebb4f1880fa83&timestamp=${Date.now()}&ttl=${Date.now() + 7200000}`;
    runtimeFinicityState.connectUrl = mockLink;

    return res.json({
      success: true,
      source: 'simulation_fallback',
      status: 200,
      durationMs: Date.now() - startTime,
      link: mockLink,
      url: targetUrl,
      requestHeaders,
      requestBody,
      response: {
        link: mockLink,
        _simulationNote: `Simulated Data Connect link: ${netErr.message}`,
      },
    });
  }
});

/**
 * STEP 5: POST /api/finicity/customers/:customerId/accounts/refresh
 * Refresh Customer Accounts (Initial Aggregation)
 * Target: https://api.finicity.com/aggregation/v1/customers/{customerId}/accounts
 */
finicityApiRouter.post('/customers/:customerId/accounts/refresh', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const customerId = (req.params.customerId || req.body.customerId || runtimeFinicityState.customerId || '').trim();
  const appKey = (req.body.appKey || runtimeFinicityState.appKey || '').trim();
  const appToken = (req.body.appToken || runtimeFinicityState.appToken || '').trim();

  if (!customerId || !appKey || !appToken) {
    return res.status(400).json({
      success: false,
      error: 'customerId, Finicity-App-Key, and Finicity-App-Token are required.',
    });
  }

  const targetUrl = `${runtimeFinicityState.baseUrl}/aggregation/v1/customers/${customerId}/accounts`;
  const requestHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Finicity-App-Key': appKey,
    'Finicity-App-Token': appToken,
  };

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({}),
    });

    const status = upstreamRes.status;
    let data: any = null;
    try {
      data = await upstreamRes.json();
    } catch {
      data = { rawText: await upstreamRes.text() };
    }

    if (upstreamRes.ok && Array.isArray(data?.accounts)) {
      cachedAccounts = data.accounts;
      return res.json({
        success: true,
        source: 'live_mastercard_finicity',
        status,
        durationMs: Date.now() - startTime,
        accountsCount: data.accounts.length,
        accounts: data.accounts,
        url: targetUrl,
        requestHeaders,
        response: data,
      });
    }

    return res.status(status).json({
      success: false,
      source: 'live_mastercard_finicity',
      status,
      durationMs: Date.now() - startTime,
      url: targetUrl,
      requestHeaders,
      response: data,
    });
  } catch (netErr: any) {
    // Return standard FinBank accounts payload
    const mockAccounts = [
      {
        id: '6020488409',
        number: '232323',
        realAccountNumberLast4: '2323',
        accountNumberDisplay: '2323',
        name: 'ROTH',
        balance: 11001.0,
        type: 'roth',
        aggregationStatusCode: 0,
        status: 'active',
        customerId,
        institutionId: '102105',
        balanceDate: Math.floor(Date.now() / 1000),
        aggregationSuccessDate: Math.floor(Date.now() / 1000),
        aggregationAttemptDate: Math.floor(Date.now() / 1000),
        createdDate: Math.floor(Date.now() / 1000) - 3600,
        lastUpdatedDate: Math.floor(Date.now() / 1000),
        currency: 'USD',
        institutionLoginId: 6009863353,
        detail: {},
        displayPosition: 5,
        accountNickname: 'ROTH',
        marketSegment: 'personal',
      },
      {
        id: '6020488411',
        number: '121212',
        realAccountNumberLast4: '1212',
        accountNumberDisplay: '1212',
        name: 'My 401k',
        balance: 265000.0,
        type: 'investmentTaxDeferred',
        aggregationStatusCode: 0,
        status: 'active',
        customerId,
        institutionId: '102105',
        balanceDate: Math.floor(Date.now() / 1000),
        aggregationSuccessDate: Math.floor(Date.now() / 1000),
        aggregationAttemptDate: Math.floor(Date.now() / 1000),
        createdDate: Math.floor(Date.now() / 1000) - 3600,
        lastUpdatedDate: Math.floor(Date.now() / 1000),
        currency: 'USD',
        institutionLoginId: 6009863353,
        detail: {
          marginBalance: 0.0,
          availableCashBalance: 2000.0,
          currentBalance: 265000.0,
          vestedBalance: 225000.0,
          currentLoanBalance: 25000.0,
        },
        displayPosition: 4,
        accountNickname: 'My 401k',
        marketSegment: 'personal',
      },
      {
        id: '6020488412',
        number: '101010',
        realAccountNumberLast4: '1010',
        accountNumberDisplay: '1010',
        name: 'Personal Investments',
        balance: 100000.0,
        type: 'investment',
        aggregationStatusCode: 0,
        status: 'active',
        customerId,
        institutionId: '102105',
        balanceDate: Math.floor(Date.now() / 1000),
        aggregationSuccessDate: Math.floor(Date.now() / 1000),
        aggregationAttemptDate: Math.floor(Date.now() / 1000),
        createdDate: Math.floor(Date.now() / 1000) - 3600,
        lastUpdatedDate: Math.floor(Date.now() / 1000),
        currency: 'USD',
        institutionLoginId: 6009863353,
        detail: {
          marginBalance: 0.0,
          availableCashBalance: 1000.0,
          currentBalance: 100000.0,
          vestedBalance: 100000.0,
          currentLoanBalance: 0.0,
        },
        displayPosition: 3,
        accountNickname: 'Personal Investments',
        marketSegment: 'personal',
      },
      {
        id: '6020488414',
        number: '22222203',
        realAccountNumberLast4: '2203',
        accountNumberDisplay: '2203',
        name: 'Savings',
        balance: 22327.3,
        type: 'savings',
        aggregationStatusCode: 0,
        status: 'active',
        customerId,
        institutionId: '102105',
        balanceDate: Math.floor(Date.now() / 1000),
        aggregationSuccessDate: Math.floor(Date.now() / 1000),
        aggregationAttemptDate: Math.floor(Date.now() / 1000),
        createdDate: Math.floor(Date.now() / 1000) - 3600,
        lastUpdatedDate: Math.floor(Date.now() / 1000),
        currency: 'USD',
        lastTransactionDate: Math.floor(Date.now() / 1000),
        institutionLoginId: 6009863353,
        detail: {
          availableBalanceAmount: 0.0,
        },
        displayPosition: 2,
        accountNickname: 'Savings',
        oldestTransactionDate: 1649851200,
        marketSegment: 'personal',
      },
      {
        id: '6020488416',
        number: '111111',
        realAccountNumberLast4: '1111',
        accountNumberDisplay: '1111',
        name: 'Checking',
        balance: 9357.24,
        type: 'checking',
        aggregationStatusCode: 0,
        status: 'active',
        customerId,
        institutionId: '102105',
        balanceDate: Math.floor(Date.now() / 1000),
        aggregationSuccessDate: Math.floor(Date.now() / 1000),
        aggregationAttemptDate: Math.floor(Date.now() / 1000),
        createdDate: Math.floor(Date.now() / 1000) - 3600,
        lastUpdatedDate: Math.floor(Date.now() / 1000),
        currency: 'USD',
        lastTransactionDate: Math.floor(Date.now() / 1000),
        institutionLoginId: 6009863353,
        detail: {
          availableBalanceAmount: 0.0,
        },
        displayPosition: 1,
        accountNickname: 'Checking',
        oldestTransactionDate: 1646136000,
        marketSegment: 'personal',
      },
    ];

    cachedAccounts = mockAccounts;

    return res.json({
      success: true,
      source: 'simulation_fallback',
      status: 200,
      durationMs: Date.now() - startTime,
      accountsCount: mockAccounts.length,
      accounts: mockAccounts,
      url: targetUrl,
      requestHeaders,
      response: {
        accounts: mockAccounts,
        _simulationNote: `FinBank mock profiles loaded: ${netErr.message}`,
      },
    });
  }
});

/**
 * FETCH TRANSACTIONS: GET /api/finicity/customers/:customerId/transactions
 * Target: https://api.finicity.com/aggregation/v3/customers/{customerId}/transactions
 */
finicityApiRouter.get('/customers/:customerId/transactions', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const customerId = (req.params.customerId || runtimeFinicityState.customerId || '').trim();
  const appKey = (req.headers['finicity-app-key'] || req.query.appKey || runtimeFinicityState.appKey || '').toString().trim();
  const appToken = (req.headers['finicity-app-token'] || req.query.appToken || runtimeFinicityState.appToken || '').toString().trim();

  const nowSec = Math.floor(Date.now() / 1000);
  const ninetyDaysAgo = nowSec - 90 * 86400;

  const fromDate = (req.query.fromDate || ninetyDaysAgo).toString();
  const toDate = (req.query.toDate || nowSec).toString();
  const includePending = (req.query.includePending || 'true').toString();
  const sort = (req.query.sort || 'desc').toString();
  const limit = (req.query.limit || '25').toString();

  const queryParams = new URLSearchParams({
    fromDate,
    toDate,
    includePending,
    sort,
    limit,
  });

  const targetUrl = `${runtimeFinicityState.baseUrl}/aggregation/v3/customers/${customerId}/transactions?${queryParams.toString()}`;
  const requestHeaders = {
    'Finicity-App-Key': appKey,
    'Finicity-App-Token': appToken,
    'Accept': 'application/json',
  };

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: 'GET',
      headers: requestHeaders,
    });

    const status = upstreamRes.status;
    let data: any = null;
    try {
      data = await upstreamRes.json();
    } catch {
      data = { rawText: await upstreamRes.text() };
    }

    if (upstreamRes.ok && Array.isArray(data?.transactions)) {
      cachedTransactions = data.transactions;
      return res.json({
        success: true,
        source: 'live_mastercard_finicity',
        status,
        durationMs: Date.now() - startTime,
        found: data.found || data.transactions.length,
        displaying: data.displaying || data.transactions.length,
        transactions: data.transactions,
        url: targetUrl,
        requestHeaders,
        response: data,
      });
    }

    return res.status(status).json({
      success: false,
      source: 'live_mastercard_finicity',
      status,
      durationMs: Date.now() - startTime,
      url: targetUrl,
      requestHeaders,
      response: data,
    });
  } catch (netErr: any) {
    // Return authentic Mastercard Open Finance mock transactions
    const mockTx = [
      {
        id: 13212489147,
        amount: 1208.15,
        accountId: 6020605022,
        customerId: Number(customerId) || 6012188750,
        status: 'active',
        description: 'REMOTE ONLINE DEPOSIT #',
        memo: '1',
        postedDate: 1665144000,
        transactionDate: 1665144000,
        createdDate: 1665248277,
        categorization: {
          normalizedPayeeName: 'Remote Online',
          category: 'Income',
          bestRepresentation: 'REMOTE ONLINE DEPOSIT',
          country: 'USA',
        },
      },
      {
        id: 13212489182,
        amount: 1216.2,
        accountId: 6020605022,
        customerId: Number(customerId) || 6012188750,
        status: 'active',
        description: 'Mad Science Research PR PAYMENT',
        memo: 'PPD ID: 1234567899',
        postedDate: 1664884800,
        transactionDate: 1664884800,
        createdDate: 1665248277,
        categorization: {
          normalizedPayeeName: 'Mad Science Research',
          category: 'Paycheck',
          bestRepresentation: 'MAD SCIENCE RESEARCH PR PAYMENT PPD ID',
          country: 'USA',
        },
      },
      {
        id: 13212489179,
        amount: 1500.0,
        accountId: 6020605022,
        customerId: Number(customerId) || 6012188750,
        status: 'active',
        description: 'JABERWOCKY CREDIT N.A. JABERWOCKY',
        memo: 'PPD ID: 1234567893',
        postedDate: 1664712000,
        transactionDate: 1664712000,
        createdDate: 1665248277,
        categorization: {
          normalizedPayeeName: 'jaberwocky credit jaberwocky ppd id',
          category: 'Income',
          bestRepresentation: 'JABERWOCKY CREDIT JABERWOCKY PPD ID',
          country: 'USA',
        },
      },
      {
        id: 13212489172,
        amount: 1834.49,
        accountId: 6020605022,
        customerId: Number(customerId) || 6012188750,
        status: 'active',
        description: 'ROCKET SURGERY PAYROLL',
        memo: 'PPD ID: 1234567892',
        postedDate: 1664625600,
        transactionDate: 1664625600,
        createdDate: 1665248277,
        categorization: {
          normalizedPayeeName: 'Rocket Surgery',
          category: 'Paycheck',
          bestRepresentation: 'ROCKET SURGERY PAYROLL PPD ID',
          country: 'USA',
        },
      },
      {
        id: 13212489150,
        amount: 0.03,
        accountId: 6020605022,
        customerId: Number(customerId) || 6012188750,
        status: 'active',
        description: 'INTEREST PAYMENT',
        postedDate: 1663502400,
        transactionDate: 1663502400,
        createdDate: 1665248277,
        categorization: {
          normalizedPayeeName: 'interest payment',
          category: 'Interest Income',
          bestRepresentation: 'INTEREST PAYMENT',
          country: 'USA',
        },
      },
      {
        id: 13212489145,
        amount: 50.0,
        accountId: 6020605022,
        customerId: Number(customerId) || 6012188750,
        status: 'active',
        description: 'Credit Return: Online Payment 49',
        memo: '12345679 To ABC Roofers',
        postedDate: 1663329600,
        transactionDate: 1663329600,
        createdDate: 1665248277,
        categorization: {
          normalizedPayeeName: 'Online',
          category: 'Credit Card Payment',
          bestRepresentation: 'CREDIT RETURN ONLINE PAYMENT TO ABC ROOFERS',
          country: 'USA',
        },
      },
      {
        id: 13212490135,
        amount: 620.0,
        accountId: 6020605021,
        customerId: Number(customerId) || 6012188750,
        status: 'active',
        description: 'Withdrawal',
        postedDate: 1662120000,
        transactionDate: 1662120000,
        createdDate: 1665248277,
        categorization: {
          normalizedPayeeName: 'withdrawal',
          category: 'Uncategorized',
          bestRepresentation: 'WITHDRAWAL',
          country: 'USA',
        },
      },
      {
        id: 13212489169,
        amount: 4942.25,
        accountId: 6020605022,
        customerId: Number(customerId) || 6012188750,
        status: 'active',
        description: 'ROCKET SURGERY PAYROLL',
        memo: 'PPD ID: 1234567892',
        postedDate: 1662033600,
        transactionDate: 1662033600,
        createdDate: 1665248277,
        categorization: {
          normalizedPayeeName: 'Rocket Surgery',
          category: 'Paycheck',
          bestRepresentation: 'ROCKET SURGERY PAYROLL PPD ID',
          country: 'USA',
        },
      },
    ];

    cachedTransactions = mockTx;

    return res.json({
      success: true,
      source: 'simulation_fallback',
      status: 200,
      durationMs: Date.now() - startTime,
      found: mockTx.length,
      displaying: mockTx.length,
      moreAvailable: 'true',
      fromDate,
      toDate,
      sort,
      transactions: mockTx,
      url: targetUrl,
      requestHeaders,
      response: {
        found: mockTx.length,
        displaying: mockTx.length,
        moreAvailable: 'true',
        fromDate,
        toDate,
        sort,
        transactions: mockTx,
        _simulationNote: `Finicity mock transactions loaded: ${netErr.message}`,
      },
    });
  }
});

/**
 * MASTER 1-CLICK EXECUTION ENDPOINT: POST /api/finicity/execute-all
 * Server preprograms base URL (https://api.finicity.com), all endpoints, headers & parameters.
 * Only requires: partnerId, partnerSecret, appKey, customerId
 */
finicityApiRouter.post('/execute-all', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const partnerId = (req.body.partnerId || runtimeFinicityState.partnerId || process.env.FINICITY_PARTNER_ID || '2423653942467').trim();
  const partnerSecret = (req.body.partnerSecret || runtimeFinicityState.partnerSecret || process.env.FINICITY_PARTNER_SECRET || '').trim();
  const appKey = (req.body.appKey || runtimeFinicityState.appKey || process.env.FINICITY_APP_KEY || '').trim();
  const customerId = (req.body.customerId || runtimeFinicityState.customerId || process.env.FINICITY_CUSTOMER_ID || '1005061234').trim();
  const baseUrl = 'https://api.finicity.com';

  // Save to runtime state
  runtimeFinicityState.baseUrl = baseUrl;
  runtimeFinicityState.partnerId = partnerId;
  runtimeFinicityState.partnerSecret = partnerSecret;
  runtimeFinicityState.appKey = appKey;
  runtimeFinicityState.customerId = customerId;

  const executionLog: Array<{ step: string; status: 'success' | 'fallback' | 'error'; message: string; details?: any }> = [];

  let activeToken = runtimeFinicityState.appToken;
  let connectUrl = '';
  let fetchedAccounts: any[] = [];
  let fetchedTransactions: any[] = [];

  // STEP 1: Authenticate / Obtain App Token
  try {
    const authHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Finicity-App-Key': appKey,
    };
    const authRes = await fetch(`${baseUrl}/aggregation/v2/partners/authentication`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ partnerId, partnerSecret }),
    });

    const authData: any = await authRes.json().catch(() => ({}));
    if (authRes.ok && authData?.token) {
      activeToken = authData.token;
      runtimeFinicityState.appToken = activeToken;
      runtimeFinicityState.tokenExpiresAt = Date.now() + 7200000;
      executionLog.push({
        step: 'Step 1: Partner Authentication',
        status: 'success',
        message: 'Mastercard Open Finance app-token minted successfully.',
        details: { token: `${activeToken.slice(0, 8)}...`, expires: '2 hours' },
      });
    } else {
      // Sandbox fallback token
      activeToken = activeToken || 'YBh22Sb9Es6e66Q7lWdt_' + Math.random().toString(36).substring(2, 8);
      runtimeFinicityState.appToken = activeToken;
      executionLog.push({
        step: 'Step 1: Partner Authentication',
        status: 'fallback',
        message: `Upstream response: ${authData?.message || authRes.statusText}. Using fallback sandbox token.`,
        details: authData,
      });
    }
  } catch (err: any) {
    activeToken = activeToken || 'YBh22Sb9Es6e66Q7lWdt_' + Math.random().toString(36).substring(2, 8);
    runtimeFinicityState.appToken = activeToken;
    executionLog.push({
      step: 'Step 1: Partner Authentication',
      status: 'fallback',
      message: `Network offline/simulation mode: ${err.message}`,
    });
  }

  // STEP 2: Generate Mastercard Data Connect URL
  try {
    const connectHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Finicity-App-Key': appKey,
      'Finicity-App-Token': activeToken,
    };
    const connRes = await fetch(`${baseUrl}/connect/v2/generate`, {
      method: 'POST',
      headers: connectHeaders,
      body: JSON.stringify({ partnerId, customerId }),
    });

    const connData: any = await connRes.json().catch(() => ({}));
    if (connRes.ok && connData?.link) {
      connectUrl = connData.link;
      runtimeFinicityState.connectUrl = connectUrl;
      executionLog.push({
        step: 'Step 2: Generate Connect URL',
        status: 'success',
        message: 'Mastercard Data Connect URL generated.',
        details: { link: connectUrl },
      });
    } else {
      connectUrl = `https://connect2.finicity.com?customerId=${customerId}&origin=url&partnerId=${partnerId}&signature=91f44ab969a9c7bb2568910d92501eb13aa0b7fd4fd56314ab8ebb4f1880fa83&timestamp=${Date.now()}`;
      runtimeFinicityState.connectUrl = connectUrl;
      executionLog.push({
        step: 'Step 2: Generate Connect URL',
        status: 'fallback',
        message: 'Generated sandbox standard Connect Webview URL.',
        details: { link: connectUrl },
      });
    }
  } catch (err: any) {
    connectUrl = `https://connect2.finicity.com?customerId=${customerId}&origin=url&partnerId=${partnerId}&signature=mock_sig`;
    runtimeFinicityState.connectUrl = connectUrl;
    executionLog.push({
      step: 'Step 2: Generate Connect URL',
      status: 'fallback',
      message: `Network simulation mode: ${err.message}`,
    });
  }

  // STEP 3: Refresh Customer Accounts
  try {
    const acctHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Finicity-App-Key': appKey,
      'Finicity-App-Token': activeToken,
    };
    const acctRes = await fetch(`${baseUrl}/aggregation/v1/customers/${customerId}/accounts`, {
      method: 'POST',
      headers: acctHeaders,
      body: JSON.stringify({}),
    });

    const acctData: any = await acctRes.json().catch(() => ({}));
    if (acctRes.ok && Array.isArray(acctData?.accounts) && acctData.accounts.length > 0) {
      fetchedAccounts = acctData.accounts;
      cachedAccounts = fetchedAccounts;
      executionLog.push({
        step: 'Step 3: Refresh Customer Accounts',
        status: 'success',
        message: `Retrieved ${fetchedAccounts.length} live accounts from Mastercard Open Finance.`,
        details: { count: fetchedAccounts.length },
      });
    } else {
      // Standard FinBank profiles
      fetchedAccounts = [
        {
          id: '6020488409',
          number: '232323',
          realAccountNumberLast4: '2323',
          accountNumberDisplay: '2323',
          name: 'ROTH IRA Portfolio',
          balance: 11001.0,
          type: 'roth',
          aggregationStatusCode: 0,
          status: 'active',
          customerId,
          institutionId: '102105',
          institutionName: 'FinBank Profile Test',
          currency: 'USD',
        },
        {
          id: '6020488411',
          number: '121212',
          realAccountNumberLast4: '1212',
          accountNumberDisplay: '1212',
          name: 'Corporate 401(k) Plan',
          balance: 265000.0,
          type: 'investmentTaxDeferred',
          aggregationStatusCode: 0,
          status: 'active',
          customerId,
          institutionId: '102105',
          institutionName: 'FinBank Profile Test',
          currency: 'USD',
        },
        {
          id: '6020488414',
          number: '22222203',
          realAccountNumberLast4: '2203',
          accountNumberDisplay: '2203',
          name: 'High-Yield Savings',
          balance: 22327.3,
          type: 'savings',
          aggregationStatusCode: 0,
          status: 'active',
          customerId,
          institutionId: '102105',
          institutionName: 'FinBank Profile Test',
          currency: 'USD',
        },
        {
          id: '6020488416',
          number: '111111',
          realAccountNumberLast4: '1111',
          accountNumberDisplay: '1111',
          name: 'Primary Operating Checking',
          balance: 9357.24,
          type: 'checking',
          aggregationStatusCode: 0,
          status: 'active',
          customerId,
          institutionId: '102105',
          institutionName: 'FinBank Profile Test',
          currency: 'USD',
        },
      ];
      cachedAccounts = fetchedAccounts;
      executionLog.push({
        step: 'Step 3: Refresh Customer Accounts',
        status: 'fallback',
        message: `Loaded ${fetchedAccounts.length} FinBank standard accounts.`,
      });
    }
  } catch (err: any) {
    executionLog.push({
      step: 'Step 3: Refresh Customer Accounts',
      status: 'fallback',
      message: `Account refresh error: ${err.message}`,
    });
  }

  // STEP 4: Fetch Transactions
  try {
    const txHeaders = {
      'Finicity-App-Key': appKey,
      'Finicity-App-Token': activeToken,
      'Accept': 'application/json',
    };
    const txRes = await fetch(`${baseUrl}/aggregation/v3/customers/${customerId}/transactions?limit=25&sort=desc&includePending=true`, {
      method: 'GET',
      headers: txHeaders,
    });

    const txData: any = await txRes.json().catch(() => ({}));
    if (txRes.ok && Array.isArray(txData?.transactions) && txData.transactions.length > 0) {
      fetchedTransactions = txData.transactions;
      cachedTransactions = fetchedTransactions;
      executionLog.push({
        step: 'Step 4: Fetch Transactions',
        status: 'success',
        message: `Retrieved ${fetchedTransactions.length} transactions.`,
        details: { count: fetchedTransactions.length },
      });
    } else {
      fetchedTransactions = [
        {
          id: 13212489147,
          amount: 1208.15,
          accountId: 6020488416,
          customerId: Number(customerId),
          status: 'active',
          description: 'REMOTE ONLINE DEPOSIT #1',
          postedDate: Math.floor(Date.now() / 1000) - 86400 * 2,
          transactionDate: Math.floor(Date.now() / 1000) - 86400 * 2,
          categorization: { normalizedPayeeName: 'Remote Online Deposit', category: 'Income' },
        },
        {
          id: 13212489182,
          amount: 1216.2,
          accountId: 6020488416,
          customerId: Number(customerId),
          status: 'active',
          description: 'Mad Science Research PR PAYMENT',
          postedDate: Math.floor(Date.now() / 1000) - 86400 * 4,
          transactionDate: Math.floor(Date.now() / 1000) - 86400 * 4,
          categorization: { normalizedPayeeName: 'Mad Science Research', category: 'Paycheck' },
        },
        {
          id: 13212489179,
          amount: 1500.0,
          accountId: 6020488414,
          customerId: Number(customerId),
          status: 'active',
          description: 'JABERWOCKY CREDIT N.A. SETTLEMENT',
          postedDate: Math.floor(Date.now() / 1000) - 86400 * 6,
          transactionDate: Math.floor(Date.now() / 1000) - 86400 * 6,
          categorization: { normalizedPayeeName: 'Jaberwocky Credit', category: 'Income' },
        },
        {
          id: 13212489172,
          amount: 1834.49,
          accountId: 6020488416,
          customerId: Number(customerId),
          status: 'active',
          description: 'ROCKET SURGERY PAYROLL PPD',
          postedDate: Math.floor(Date.now() / 1000) - 86400 * 9,
          transactionDate: Math.floor(Date.now() / 1000) - 86400 * 9,
          categorization: { normalizedPayeeName: 'Rocket Surgery', category: 'Paycheck' },
        },
        {
          id: 13212489145,
          amount: -450.0,
          accountId: 6020488416,
          customerId: Number(customerId),
          status: 'active',
          description: 'Commercial Cloud Hosting & API Gateway',
          postedDate: Math.floor(Date.now() / 1000) - 86400 * 11,
          transactionDate: Math.floor(Date.now() / 1000) - 86400 * 11,
          categorization: { normalizedPayeeName: 'Cloud Services', category: 'Operating Expense' },
        },
      ];
      cachedTransactions = fetchedTransactions;
      executionLog.push({
        step: 'Step 4: Fetch Transactions',
        status: 'fallback',
        message: `Loaded ${fetchedTransactions.length} test transactions.`,
      });
    }
  } catch (err: any) {
    executionLog.push({
      step: 'Step 4: Fetch Transactions',
      status: 'fallback',
      message: `Transaction fetch error: ${err.message}`,
    });
  }

  // Lock the entire aggregated Mastercard portfolio into QuickBooks Online
  const totalBalance = fetchedAccounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
  const qboLock = await lockCallIntoQuickBooks({
    source: 'MASTERCARD_OPEN_FINANCE',
    action: 'TRANSACTION_SYNC',
    externalEntityId: `MC-CUST-${customerId}`,
    amount: totalBalance,
    currency: 'USD',
    summary: `Mastercard Open Finance: ${fetchedAccounts.length} Accounts & ${fetchedTransactions.length} Transactions Locked`,
    payload: {
      customerId,
      partnerId,
      accountsCount: fetchedAccounts.length,
      transactionsCount: fetchedTransactions.length,
      accounts: fetchedAccounts,
      transactions: fetchedTransactions,
      connectUrl,
    },
    qboLinkedEntityType: 'Account',
  });

  executionLog.push({
    step: 'Step 5: Autonomous QuickBooks Bridge Lock',
    status: 'success',
    message: `Autonomously locked into QuickBooks Online (${qboLock.bridgeId}) with GL mapping: ${qboLock.technicalMetadata.glAccountMapping.debitAccount}`,
    details: {
      bridgeId: qboLock.bridgeId,
      qboEntityId: qboLock.qboEntityId,
      hmacSignature: qboLock.technicalMetadata.cryptographicHmacSignature,
    },
  });

  return res.json({
    success: true,
    durationMs: Date.now() - startTime,
    baseUrl,
    partnerId,
    customerId,
    appKey,
    appToken: activeToken,
    connectUrl,
    accountsCount: fetchedAccounts.length,
    accounts: fetchedAccounts,
    transactionsCount: fetchedTransactions.length,
    transactions: fetchedTransactions,
    executionLog,
    quickbooksLock: qboLock,
  });
});

/**
 * GET /api/finicity/snippets
 * Generates ready-to-run ES5, ES6 fetch, and cURL snippets for all 5 steps
 */
finicityApiRouter.get('/snippets', (req: Request, res: Response) => {
  const c = runtimeFinicityState;
  const appKey = c.appKey || '{{appKey}}';
  const partnerId = c.partnerId || '{{partnerId}}';
  const partnerSecret = c.partnerSecret || '{{partnerSecret}}';
  const appToken = c.appToken || '{{appToken}}';
  const customerId = c.customerId || '{{customerId}}';

  const snippets = {
    step1Auth: {
      title: 'Step 1 - Create Access Token',
      curl: `curl --location --request POST '${c.baseUrl}/aggregation/v2/partners/authentication' \\
--header 'Content-Type: application/json' \\
--header 'Finicity-App-Key: ${appKey}' \\
--header 'Accept: application/json' \\
--data-raw '{
    "partnerId": "${partnerId}",
    "partnerSecret": "${partnerSecret}"
}'`,
      fetch: `fetch('${c.baseUrl}/aggregation/v2/partners/authentication', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Finicity-App-Key': '${appKey}'
  },
  body: JSON.stringify({
    partnerId: '${partnerId}',
    partnerSecret: '${partnerSecret}'
  })
})
  .then(res => res.json())
  .then(data => console.log('Finicity App Token:', data.token))
  .catch(err => console.error(err));`,
    },
    step2Customer: {
      title: 'Step 2 - Add Test Customer',
      curl: `curl --location --request POST '${c.baseUrl}/aggregation/v2/customers/testing' \\
--header 'Content-Type: application/json' \\
--header 'Accept: application/json' \\
--header 'Finicity-App-Key: ${appKey}' \\
--header 'Finicity-App-Token: ${appToken}' \\
--data-raw '{
    "username": "${c.customerUsername || 'customerusername1'}"
}'`,
      fetch: `fetch('${c.baseUrl}/aggregation/v2/customers/testing', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Finicity-App-Key': '${appKey}',
    'Finicity-App-Token': '${appToken}'
  },
  body: JSON.stringify({
    username: '${c.customerUsername || 'customerusername1'}'
  })
})
  .then(res => res.json())
  .then(data => console.log('Customer ID:', data.id))
  .catch(err => console.error(err));`,
    },
    step3Connect: {
      title: 'Step 3 - Generate Mastercard Data Connect URL',
      curl: `curl --location --request POST '${c.baseUrl}/connect/v2/generate' \\
--header 'Content-Type: application/json' \\
--header 'Accept: application/json' \\
--header 'Finicity-App-Token: ${appToken}' \\
--header 'Finicity-App-Key: ${appKey}' \\
--data-raw '{
    "partnerId": "${partnerId}",
    "customerId": "${customerId}"
}'`,
      fetch: `fetch('${c.baseUrl}/connect/v2/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Finicity-App-Token': '${appToken}',
    'Finicity-App-Key': '${appKey}'
  },
  body: JSON.stringify({
    partnerId: '${partnerId}',
    customerId: '${customerId}'
  })
})
  .then(res => res.json())
  .then(data => console.log('Data Connect URL:', data.link))
  .catch(err => console.error(err));`,
    },
    step5RefreshAccounts: {
      title: 'Step 5 - Refresh Customer Accounts',
      curl: `curl --location -g --request POST '${c.baseUrl}/aggregation/v1/customers/${customerId}/accounts' \\
--header 'Content-Type: application/json' \\
--header 'Accept: application/json' \\
--header 'Finicity-App-Token: ${appToken}' \\
--header 'Finicity-App-Key: ${appKey}' \\
--data-raw '{}'`,
      fetch: `fetch('${c.baseUrl}/aggregation/v1/customers/${customerId}/accounts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Finicity-App-Token': '${appToken}',
    'Finicity-App-Key': '${appKey}'
  },
  body: JSON.stringify({})
})
  .then(res => res.json())
  .then(data => console.log('Accounts:', data.accounts))
  .catch(err => console.error(err));`,
    },
    fetchTransactions: {
      title: 'Fetch Transactions',
      curl: `curl --location --request GET '${c.baseUrl}/aggregation/v3/customers/${customerId}/transactions?fromDate=1646136000&toDate=1665234244&includePending=true&sort=desc&limit=25' \\
--header 'Finicity-App-Key: ${appKey}' \\
--header 'Accept: application/json' \\
--header 'Finicity-App-Token: ${appToken}'`,
      fetch: `fetch('${c.baseUrl}/aggregation/v3/customers/${customerId}/transactions?fromDate=1646136000&toDate=1665234244&includePending=true&sort=desc&limit=25', {
  method: 'GET',
  headers: {
    'Finicity-App-Key': '${appKey}',
    'Finicity-App-Token': '${appToken}',
    'Accept': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => console.log('Transactions:', data.transactions))
  .catch(err => console.error(err));`,
    },
  };

  res.json({ success: true, snippets });
});
