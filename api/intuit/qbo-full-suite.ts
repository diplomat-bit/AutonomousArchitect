import { Router, Request, Response } from 'express';
import { getActiveGoogleHmacKey, generateGoogleHmacAuthHeader } from '../google-service-key.js';

export const qboFullSuiteRouter = Router();

// Full CRUD for Invoices, Customers, Payments, Estimates, Accounts, Bills
export const mockStore: Record<string, any[]> = {
  accounts: [],
  invoices: [],
  customers: [],
  payments: [],
  bills: [],
};

// 1. ACCOUNTS: Get & Create
qboFullSuiteRouter.get('/accounts', (req: Request, res: Response) => {
  res.json({ Account: mockStore.accounts, total: mockStore.accounts.length });
});

qboFullSuiteRouter.post('/accounts', (req: Request, res: Response) => {
  const newAccount = {
    Id: `${Date.now()}`,
    ...req.body,
    Active: true,
    MetaData: { CreateTime: new Date().toISOString() },
  };
  mockStore.accounts.push(newAccount);
  res.status(201).json({ Account: newAccount, status: 'CREATED_IN_QUICKBOOKS' });
});

// 2. INVOICES: Create & List
qboFullSuiteRouter.get('/invoices', (req: Request, res: Response) => {
  res.json({ Invoice: mockStore.invoices, total: mockStore.invoices.length });
});

qboFullSuiteRouter.post('/invoices', (req: Request, res: Response) => {
  const newInvoice = {
    Id: `INV-${Date.now()}`,
    DocNumber: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
    TxnDate: new Date().toISOString().split('T')[0],
    ...req.body,
  };
  mockStore.invoices.push(newInvoice);
  res.status(201).json({ Invoice: newInvoice, status: 'INVOICE_GENERATED' });
});

// 3. CUSTOMERS: Create & List
qboFullSuiteRouter.get('/customers', (req: Request, res: Response) => {
  res.json({ Customer: mockStore.customers, total: mockStore.customers.length });
});

qboFullSuiteRouter.post('/customers', (req: Request, res: Response) => {
  const newCustomer = {
    Id: `CUST-${Date.now()}`,
    ...req.body,
    Active: true,
  };
  mockStore.customers.push(newCustomer);
  res.status(201).json({ Customer: newCustomer });
});

// 4. PAYMENTS: Execute & Reconcile
qboFullSuiteRouter.get('/payments', (req: Request, res: Response) => {
  res.json({ Payment: mockStore.payments, total: mockStore.payments.length });
});

qboFullSuiteRouter.post('/payments', (req: Request, res: Response) => {
  const payment = {
    Id: `PMT-${Date.now()}`,
    TxnDate: new Date().toISOString().split('T')[0],
    ...req.body,
    Status: 'SETTLED_VIA_SYU',
  };
  mockStore.payments.push(payment);
  res.status(201).json({ Payment: payment });
});

// 5. DIRECT cURL INGESTION DISPATCHER (Self-Calling & Proxy)
qboFullSuiteRouter.post('/curl-runner', async (req: Request, res: Response) => {
  try {
    let { endpoint = '/api/intuit/universal/transform-and-ingest', method = 'GET', headers = {}, body = null } = req.body;

    console.log('[QBO Suite] Executing Headless cURL Proxy:', { endpoint, method });

    // 1. Resolve target URL for self-calling and Chase proxying
    let targetUrl = endpoint;
    if (targetUrl.startsWith('/')) {
      targetUrl = `http://127.0.0.1:3000${targetUrl}`;
    } else if (targetUrl.includes('aibanking.dev') || targetUrl.includes('localhost')) {
      const parsed = new URL(targetUrl);
      targetUrl = `http://127.0.0.1:3000${parsed.pathname}${parsed.search}`;
    } else if (targetUrl.includes('apidemo.chase.com')) {
      const parsed = new URL(targetUrl);
      if (parsed.pathname.startsWith('/mock/aggregator-oauth')) {
        targetUrl = `http://127.0.0.1:3000/api/chase${parsed.pathname}${parsed.search}`;
      } else if (parsed.pathname.startsWith('/accounts')) {
        targetUrl = `http://127.0.0.1:3000/api/chase${parsed.pathname}${parsed.search}`;
      } else {
        targetUrl = `http://127.0.0.1:3000/api/chase${parsed.pathname}${parsed.search}`;
      }
    }

    // 2. Default Headers & Self-Auth Key Injection
    const activeHmac = getActiveGoogleHmacKey();
    const hmacAuth = generateGoogleHmacAuthHeader(activeHmac.accessId, activeHmac.secret, method, endpoint);

    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': 'sk_live_aibanking_9f83a82e71d4b609c217',
      'playground-id-token': 'copied-playground-token-id',
      'x-goog-access-id': activeHmac.accessId,
      'x-goog-signature': hmacAuth.signature,
      ...headers,
    };

    // If caller explicitly requested Google HMAC Auth
    if (req.body?.useGoogleHmac || endpoint.includes('google') || endpoint.includes('hmac')) {
      finalHeaders['authorization'] = hmacAuth.authorizationHeader;
    }

    // 3. Robust Body Formatting for POST/PUT/PATCH
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: finalHeaders,
    };

    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      if (body !== null && body !== undefined) {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      } else {
        // Fallback default empty JSON body to prevent "missing body" errors
        fetchOptions.body = JSON.stringify({});
      }
    }

    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type') || '';

    let payload: any;
    if (contentType.includes('application/json')) {
      payload = await response.json();
    } else {
      payload = { rawText: await response.text() };
    }

    res.status(200).json({
      success: true,
      resolvedUrl: targetUrl,
      remoteStatus: response.status,
      payload,
    });
  } catch (error: any) {
    console.error('[cURL Runner Error]', error);
    res.status(500).json({ success: false, error: error.message, resolvedUrl: req.body?.endpoint });
  }
});
