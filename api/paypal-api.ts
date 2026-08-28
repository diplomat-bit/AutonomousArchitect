import { Router, Request, Response } from 'express';
import { lockCallIntoQuickBooks } from './intuit/quickbooks-bridge.js';

export const paypalApiRouter = Router();

export interface PayPalConfigState {
  sandboxEmail: string;
  sandboxUrl: string;
  nvpUsername: string;
  nvpPassword: string;
  nvpSignature: string;
  accountName: string;
  accountPhone: string;
  accountCountry: string;
  accountType: string;
  accountId: string;
  accountStatus: string;
  creditCardsCount: string;
  appName: string;
  clientId: string;
  clientSecret: string;
  oauthEndpoint: string;
  grantType: string;
  sampleScope: string;
  accessToken: string;
  tokenType: string;
  appId: string;
  expiresIn: number;
  nonce: string;
  // Pay Later JS SDK v6 Configuration
  payLaterAmount: string;
  payLaterCurrency: string;
  payLaterLogoType: string;
  payLaterLogoPosition: string;
  payLaterTextColor: string;
  payLaterPresentationMode: string;
  payLaterIntegrationPattern: 'HTML' | 'JAVASCRIPT' | 'HYBRID';
  payLaterLocale: string;
  payLaterFontSize: string;
  payLaterTextAlign: string;
  sdkV6Url: string;
}

export function getDefaultPayPalConfig(): PayPalConfigState {
  return {
    sandboxEmail: (process.env.PAYPAL_SANDBOX_EMAIL || 'sb-4y30a52700589@business.example.com').trim(),
    sandboxUrl: (process.env.PAYPAL_SANDBOX_URL || 'https://sandbox.paypal.com').trim(),
    nvpUsername: (process.env.PAYPAL_NVP_USERNAME || 'sb-4y30a52700589_api1.business.example.com').trim(),
    nvpPassword: (process.env.PAYPAL_NVP_PASSWORD || 'E7SSNXSWXHGRV5LM').trim(),
    nvpSignature: (process.env.PAYPAL_NVP_SIGNATURE || 'AcblsXONzZwsBcCXBm-.oiwMrKkwAS-IWkeeRmybAY0UaJFBwmAG09IZ').trim(),
    accountName: (process.env.PAYPAL_ACCOUNT_NAME || 'John Doe').trim(),
    accountPhone: (process.env.PAYPAL_ACCOUNT_PHONE || '2027553888').trim(),
    accountCountry: (process.env.PAYPAL_ACCOUNT_COUNTRY || 'US').trim(),
    accountType: (process.env.PAYPAL_ACCOUNT_TYPE || 'Business').trim(),
    accountId: (process.env.PAYPAL_ACCOUNT_ID || 'P39FU8PW6AMNW').trim(),
    accountStatus: (process.env.PAYPAL_ACCOUNT_STATUS || 'Verified').trim(),
    creditCardsCount: (process.env.PAYPAL_CREDIT_CARDS_COUNT || '1 added').trim(),
    appName: (process.env.PAYPAL_APP_NAME || 'Default Application').trim(),
    clientId: (process.env.PAYPAL_CLIENT_ID || 'AebUugfXLhryBxMBCyjWa...').trim(),
    clientSecret: (process.env.PAYPAL_CLIENT_SECRET || 'E7SSNXSWXHGRV5LM_SECRET_MOCK').trim(),
    oauthEndpoint: (process.env.PAYPAL_OAUTH_ENDPOINT || 'https://api-m.sandbox.paypal.com/v1/oauth2/token').trim(),
    grantType: (process.env.PAYPAL_GRANT_TYPE || 'client_credentials').trim(),
    sampleScope: (process.env.PAYPAL_SCOPE || 'https://uri.paypal.com/services/invoicing https://uri.paypal.com/services/disputes/read-buyer https://uri.paypal.com/services/payments/realtimepayment https://uri.paypal.com/services/disputes/update-seller https://uri.paypal.com/services/payments/payment/authcapture openid https://uri.paypal.com/services/disputes/read-seller https://uri.paypal.com/services/payments/refund https://api-m.paypal.com/v1/vault/credit-card https://api-m.paypal.com/v1/payments/.* https://uri.paypal.com/payments/payouts https://api-m.paypal.com/v1/vault/credit-card/.* https://uri.paypal.com/services/subscriptions https://uri.paypal.com/services/applications/webhooks').trim(),
    accessToken: (process.env.PAYPAL_ACCESS_TOKEN || 'A21AAFEpH4PsADK7qSS7pSRsgzfENtu-Q1ysgEDVDESseMHBYXVJYE8ovjj68elIDy8nF26AwPhfXTIeWAZHSLIsQkSYz9ifg').trim(),
    tokenType: (process.env.PAYPAL_TOKEN_TYPE || 'Bearer').trim(),
    appId: (process.env.PAYPAL_APP_ID || 'APP-80W284485P519543T').trim(),
    expiresIn: parseInt(process.env.PAYPAL_EXPIRES_IN || '31668', 10) || 31668,
    nonce: (process.env.PAYPAL_NONCE || '2020-04-03T15:35:36ZaYZlGvEkV4yVSz8g6bAKFoGSEzuy3CQcz3ljhibkOHg').trim(),
    // Pay Later Defaults
    payLaterAmount: (process.env.PAYPAL_PAYLATER_AMOUNT || '300.00').trim(),
    payLaterCurrency: (process.env.PAYPAL_PAYLATER_CURRENCY || 'USD').trim(),
    payLaterLogoType: 'MONOGRAM',
    payLaterLogoPosition: 'LEFT',
    payLaterTextColor: 'BLACK',
    payLaterPresentationMode: (process.env.PAYPAL_PAYLATER_PRESENTATION || 'MODAL').trim(),
    payLaterIntegrationPattern: 'HTML',
    payLaterLocale: 'en-US',
    payLaterFontSize: '14px',
    payLaterTextAlign: 'left',
    sdkV6Url: (process.env.PAYPAL_SDK_V6_URL || 'https://www.sandbox.paypal.com/web-sdk/v6/core').trim(),
  };
}

let runtimePayPalConfig: Partial<PayPalConfigState> = {};

export function getEffectivePayPalConfig(): PayPalConfigState {
  return {
    ...getDefaultPayPalConfig(),
    ...runtimePayPalConfig,
  };
}

// 1. Get Config
paypalApiRouter.get('/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    config: getEffectivePayPalConfig(),
    timestamp: new Date().toISOString(),
  });
});

// 2. Update Config
paypalApiRouter.post('/config', (req: Request, res: Response) => {
  const updates = req.body || {};
  runtimePayPalConfig = {
    ...runtimePayPalConfig,
    ...updates,
  };
  res.json({
    success: true,
    message: 'PayPal configuration updated successfully',
    config: getEffectivePayPalConfig(),
  });
});

// 3. Request Live / Simulated PayPal OAuth Token
paypalApiRouter.post('/oauth/token', async (req: Request, res: Response) => {
  const currentCfg = getEffectivePayPalConfig();
  const clientId = req.body?.clientId || currentCfg.clientId;
  const clientSecret = req.body?.clientSecret || currentCfg.clientSecret;
  const grantType = req.body?.grantType || currentCfg.grantType || 'client_credentials';
  const endpoint = req.body?.endpoint || currentCfg.oauthEndpoint || 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

  try {
    const authHeader = 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    // Attempt live call if real credentials
    let tokenData: any = null;
    let isLiveCallSuccess = false;

    if (clientId && clientSecret && !clientId.includes('...')) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `grant_type=${encodeURIComponent(grantType)}`,
        });

        if (response.ok) {
          tokenData = await response.json();
          isLiveCallSuccess = true;
        }
      } catch (e) {
        // Fall back gracefully
      }
    }

    if (!isLiveCallSuccess) {
      // Mock / fallback token response using exact user prompt schema
      tokenData = {
        scope: currentCfg.sampleScope,
        access_token: `A21AAFEpH4PsADK7qSS7pSRsgzfENtu-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`,
        token_type: 'Bearer',
        app_id: currentCfg.appId || 'APP-80W284485P519543T',
        expires_in: 31668,
        nonce: new Date().toISOString() + 'ZaYZlGvEkV4yVSz8g6bAKFoGSEzuy3CQcz3ljhibkOHg',
        _simulated: true,
      };
    }

    // Update runtime store
    runtimePayPalConfig.accessToken = tokenData.access_token;
    runtimePayPalConfig.tokenType = tokenData.token_type;
    runtimePayPalConfig.expiresIn = tokenData.expires_in;
    runtimePayPalConfig.nonce = tokenData.nonce;
    runtimePayPalConfig.sampleScope = tokenData.scope || currentCfg.sampleScope;

    // Lock into QuickBooks Autonomous Bridge Ledger
    const bridgeRecord = await lockCallIntoQuickBooks({
      source: 'PAYPAL_PAYMENTS',
      action: 'AUTHENTICATION',
      externalEntityId: currentCfg.accountId || 'P39FU8PW6AMNW',
      amount: 0,
      currency: 'USD',
      summary: `PayPal OAuth Token Granted (${tokenData.access_token.slice(0, 16)}...)`,
      qboLinkedEntityType: 'Account',
      payload: {
        paypal_email: currentCfg.sandboxEmail,
        paypal_account_id: currentCfg.accountId,
        app_id: tokenData.app_id,
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
        is_live: isLiveCallSuccess,
      },
    });

    res.json({
      success: true,
      token: tokenData,
      isLive: isLiveCallSuccess,
      bridgeRecord,
      config: getEffectivePayPalConfig(),
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'PayPal OAuth token exchange failed',
    });
  }
});

// 4. Test NVP/SOAP API Call
paypalApiRouter.post('/nvp/call', async (req: Request, res: Response) => {
  const cfg = getEffectivePayPalConfig();
  const method = req.body?.method || 'GetTransactionDetails';

  const bridgeRecord = await lockCallIntoQuickBooks({
    source: 'PAYPAL_PAYMENTS',
    action: 'TRANSACTION_SYNC',
    externalEntityId: cfg.nvpUsername,
    amount: 250.0,
    currency: 'USD',
    summary: `PayPal NVP API ${method} Call for ${cfg.accountName}`,
    qboLinkedEntityType: 'JournalEntry',
    payload: {
      USER: cfg.nvpUsername,
      METHOD: method,
      SIGNATURE: cfg.nvpSignature ? `${cfg.nvpSignature.slice(0, 8)}...` : undefined,
      ACCOUNT_EMAIL: cfg.sandboxEmail,
      STATUS: 'SUCCESS',
      ACK: 'Success',
      TIMESTAMP: new Date().toISOString(),
    },
  });

  res.json({
    success: true,
    ack: 'Success',
    timestamp: new Date().toISOString(),
    response: {
      ACK: 'Success',
      CORRELATIONID: `pp_nvp_${Math.floor(1000000 + Math.random() * 9000000)}`,
      BUILD: '9981881',
      METHOD: method,
      USER: cfg.nvpUsername,
      STATUS: 'Verified',
      TRANSACTION_ID: `TXN-PP-${Date.now()}`,
      AMOUNT: '250.00',
      CURRENCY: 'USD',
    },
    bridgeRecord,
  });
});

// 5. Pay Later Analytics & Interaction Logger
paypalApiRouter.post('/paylater/analytics', async (req: Request, res: Response) => {
  const { eventName, eventData, config } = req.body || {};
  const currentCfg = getEffectivePayPalConfig();

  const bridgeRecord = await lockCallIntoQuickBooks({
    source: 'PAYPAL_PAYMENTS',
    action: 'TRANSACTION_SYNC',
    externalEntityId: currentCfg.accountId || 'P39FU8PW6AMNW',
    amount: parseFloat(eventData?.amount || currentCfg.payLaterAmount) || 300.0,
    currency: currentCfg.payLaterCurrency || 'USD',
    summary: `PayPal Pay Later SDK Event: ${eventName || 'paylater_interaction'}`,
    qboLinkedEntityType: 'JournalEntry',
    payload: {
      event_name: eventName,
      event_data: eventData,
      paylater_config: config || currentCfg,
      sdk_version: 'v6/core',
      timestamp: new Date().toISOString(),
    },
  });

  res.json({
    success: true,
    eventName,
    timestamp: new Date().toISOString(),
    bridgeRecord,
  });
});

// 6. PayPal v1 OAuth Generate Token
paypalApiRouter.post('/v1/oauth2/token', async (req: Request, res: Response) => {
  const cfg = getEffectivePayPalConfig();
  const token = {
    scope: cfg.sampleScope,
    access_token: `A21AAL8A8rAjJjh1e8JcBuom2FEMJeCREs6Be0TY3T3aI610eKpQ93jV0lpJsvHj-${Date.now().toString(36)}`,
    token_type: 'Bearer',
    app_id: cfg.appId || 'APP-80W284485P519543T',
    expires_in: 32400,
    nonce: new Date().toISOString() + 'JFQBVUqWihFGkxmNANbC4ikQt5_CLogQGeDy3lTaiYs',
  };

  await lockCallIntoQuickBooks({
    source: 'PAYPAL_PAYMENTS',
    action: 'AUTHENTICATION',
    externalEntityId: cfg.accountId,
    amount: 0,
    currency: 'USD',
    summary: 'PayPal v1 OAuth Token Generated',
    qboLinkedEntityType: 'Account',
    payload: token,
  });

  res.status(200).json(token);
});

// 7. PayPal v1 OAuth Terminate Token
paypalApiRouter.post('/v1/oauth2/token/terminate', async (req: Request, res: Response) => {
  res.status(200).send();
});

// 8. PayPal v1 Identity User Info
paypalApiRouter.get('/v1/identity/oauth2/userinfo', async (req: Request, res: Response) => {
  res.status(200).json({
    user_id: 'https://www.paypal.com/webapps/auth/identity/user/JkswKSOc6jJ3wtm9cmnmqqvIJJ-MF46WF707PEYTcEs',
    sub: 'https://www.paypal.com/webapps/auth/identity/user/JkswKSOc6jJ3wtm9cmnmqqvIJJ-MF46WF707PEYTcEs',
  });
});

// 9. PayPal v1 Identity Generate Token
paypalApiRouter.post('/v1/identity/generate-token', async (req: Request, res: Response) => {
  res.status(200).json({
    client_token: `eyJicmFpbnRyZWUiOnsiYXV0aG9yaXphdGlvbkZpbmdlcnByaW50IjoiZjUyZWFhN2QxYjg3YWNiOThlNDNlY2ViNjg1MGNjZGFiMGRiOTFkY2QwNjYyOTVjOTNjMjM4NjVhMDE4NTUzNXxtZXJjaGFudF9pZD1yd3dua3FnMnhnNTZobTJuJnB1YmxpY19rZXk9NjNrdm4zN3Z0MjlxYjRkZiZjcmVhdGVkX2F0PTIwMjItMDItMTdUMTc6NTY6MTQuNDUxWiIsInZlcnNpb24iOiIzLXBheXBhbCJ9LCJwYXlwYWwiOnsiaWRUb2tlbiI6ImV5SnJhV1FpT2lKbE5EQTJOakE0WWpVMFlUazBORGd4WWprMVl6YzFOREkwT0dOak1USXpaaUlzSW5SNWNDSTZJa3BYVkNJc0ltRnNaeUk2SWxKVE1qVTJJbjAuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMkZ3YVM1ellXNWtZbTk0TG5CaGVYQmhiQzVqYjIwaUxDSmhkRjlvWVhOb0lqb2lkRVJLYm1sVWJUWkRTRVIwYWxsNlFrTmtibTFHVVNJc0luSnZiR1VpT2lKTlJWSkRTRUZPVkNJc0luTmxjM05wYjI1ZmFXNWtaWGdpT2lJMGRUbFNMVzFKZFhocGNYSmhVakl4UjJWQ2RFTm5UVFpRUm0waUxDSmpiR2xsYm5SZmFXUWlPaUpCVlVNeFEzZFZTWFExV0VSc05FdGpiemt0YjFoalpYZHJNR3BhWWxCSmVFUnpNVXBYU0VSNlFWUk9VMjVaVlRNMmVHNVVkRk13VkhBdE5HdEViRU53WjBOaWNIVmtXR05UZEdNNFNFRnpWaUlzSW1GamNpSTZXeUpqYkdsbGJuUWlYU3dpWVhWa0lqb2lRVlZETVVOM1ZVbDBOVmhBreEdX..._${Date.now()}`,
    id_token: `eyJraWQiOiJlNDA2NjA4YjU0YTk0NDgxYjk1Yzc1NDI0OGNjMTIzZiIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0..._${Date.now()}`,
    expires_in: 3600,
  });
});

// In-memory orders store
const ordersStore: Record<string, any> = {};

// 10. PayPal v2 Checkout - Create Order
paypalApiRouter.post('/v2/checkout/orders', async (req: Request, res: Response) => {
  const body = req.body || {};
  const orderId = `7NK${Math.floor(10000000000 + Math.random() * 90000000000)}R`;
  const intent = body.intent || 'CAPTURE';
  const purchaseUnits = body.purchase_units || [
    {
      reference_id: 'default',
      amount: { currency_code: 'USD', value: '100.00' },
    },
  ];

  const newOrder = {
    id: orderId,
    intent,
    status: 'PAYER_ACTION_REQUIRED',
    payment_source: body.payment_source || { paypal: {} },
    purchase_units: purchaseUnits,
    links: [
      {
        href: `https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
        rel: 'self',
        method: 'GET',
      },
      {
        href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
        rel: 'payer-action',
        method: 'GET',
      },
    ],
  };

  ordersStore[orderId] = newOrder;

  const totalVal = parseFloat(purchaseUnits[0]?.amount?.value || '100.00');
  await lockCallIntoQuickBooks({
    source: 'PAYPAL_PAYMENTS',
    action: 'TRANSACTION_SYNC',
    externalEntityId: orderId,
    amount: totalVal,
    currency: purchaseUnits[0]?.amount?.currency_code || 'USD',
    summary: `PayPal v2 Order Created: ${orderId}`,
    qboLinkedEntityType: 'JournalEntry',
    payload: newOrder,
  });

  res.status(200).json(newOrder);
});

// 11. PayPal v2 Checkout - Confirm Payment Source
paypalApiRouter.post('/v2/checkout/orders/:order_id/confirm-payment-source', async (req: Request, res: Response) => {
  const orderId = req.params.order_id;
  const body = req.body || {};

  const order = ordersStore[orderId] || {
    id: orderId,
    status: 'APPROVED',
  };

  order.status = 'APPROVED';
  order.payment_source = body.payment_source || order.payment_source;
  order.links = [
    {
      href: `https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
      rel: 'self',
      method: 'GET',
    },
    {
      href: `https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      rel: 'capture',
      method: 'POST',
    },
  ];

  ordersStore[orderId] = order;

  res.status(200).json(order);
});

// 12. PayPal v2 Checkout - Show Order Details
paypalApiRouter.get('/v2/checkout/orders/:order_id', async (req: Request, res: Response) => {
  const orderId = req.params.order_id;
  const order = ordersStore[orderId] || {
    id: orderId,
    intent: 'CAPTURE',
    status: 'APPROVED',
    purchase_units: [
      {
        reference_id: 'default',
        amount: { currency_code: 'USD', value: '1000.00' },
        payee: { email_address: 'etondoze-facilitator@gmail.com', merchant_id: 'ER87FV8ER63HJ' },
      },
    ],
    payer: {
      name: { given_name: 'FooBuyer', surname: 'Jones' },
      email_address: 'foobuyer@gmail.com',
      payer_id: 'QYR5Z8XDVJNXQ',
    },
    create_time: new Date().toISOString(),
    links: [
      { href: `https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}`, rel: 'self', method: 'GET' },
      { href: `https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, rel: 'capture', method: 'POST' },
    ],
  };

  res.status(200).json(order);
});

// 13. PayPal v2 Checkout - Update Order
paypalApiRouter.patch('/v2/checkout/orders/:order_id', async (req: Request, res: Response) => {
  const orderId = req.params.order_id;
  const updates = req.body;
  if (ordersStore[orderId]) {
    ordersStore[orderId]._patches = updates;
  }
  res.status(204).send();
});

// 14. PayPal v2 Checkout - Authorize Payment
paypalApiRouter.post('/v2/checkout/orders/:order_id/authorize', async (req: Request, res: Response) => {
  const orderId = req.params.order_id;
  const authId = `8VF${Math.floor(1000000000 + Math.random() * 9000000000)}P`;

  const order = ordersStore[orderId] || {};
  order.status = 'COMPLETED';
  order.payments = {
    authorizations: [
      {
        status: 'CREATED',
        id: authId,
        amount: { currency_code: 'USD', value: '1000.00' },
        seller_protection: { status: 'ELIGIBLE', dispute_categories: ['ITEM_NOT_RECEIVED', 'UNAUTHORIZED_TRANSACTION'] },
        create_time: new Date().toISOString(),
      },
    ],
  };

  ordersStore[orderId] = order;

  await lockCallIntoQuickBooks({
    source: 'PAYPAL_PAYMENTS',
    action: 'TRANSACTION_SYNC',
    externalEntityId: orderId,
    amount: 1000.0,
    currency: 'USD',
    summary: `PayPal v2 Payment Authorized: ${orderId}`,
    qboLinkedEntityType: 'JournalEntry',
    payload: order,
  });

  res.status(201).json({
    id: orderId,
    status: 'COMPLETED',
    purchase_units: order.purchase_units || [
      {
        reference_id: 'default',
        payments: order.payments,
      },
    ],
    links: [
      { href: `https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}`, rel: 'self', method: 'GET' },
    ],
  });
});

// 15. PayPal v2 Checkout - Capture Payment
paypalApiRouter.post('/v2/checkout/orders/:order_id/capture', async (req: Request, res: Response) => {
  const orderId = req.params.order_id;
  const captureId = `CAP${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  const order = ordersStore[orderId] || {};
  order.status = 'COMPLETED';
  order.payments = {
    captures: [
      {
        id: captureId,
        status: 'COMPLETED',
        amount: { currency_code: 'USD', value: '100.00' },
        seller_protection: { status: 'ELIGIBLE' },
        final_capture: true,
        create_time: new Date().toISOString(),
      },
    ],
  };

  ordersStore[orderId] = order;

  await lockCallIntoQuickBooks({
    source: 'PAYPAL_PAYMENTS',
    action: 'TRANSACTION_SYNC',
    externalEntityId: orderId,
    amount: 100.0,
    currency: 'USD',
    summary: `PayPal v2 Payment Captured: ${orderId}`,
    qboLinkedEntityType: 'JournalEntry',
    payload: order,
  });

  res.status(201).json({
    id: orderId,
    status: 'COMPLETED',
    purchase_units: [
      {
        reference_id: 'default',
        payments: order.payments,
      },
    ],
    links: [
      { href: `https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}`, rel: 'self', method: 'GET' },
    ],
  });
});

