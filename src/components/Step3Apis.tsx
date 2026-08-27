import React, { useState } from 'react';
import { Building2, User, CreditCard, Play, Copy, Check, Terminal, Clock, CheckCircle2, AlertCircle, RefreshCw, Send, Landmark, FileText, Sparkles, Plus, Trash2 } from 'lucide-react';
import { TokenResponse } from '../types';
import { apiFetch } from '../utils/apiClient';

interface Step3ApisProps {
  tokens: TokenResponse | null;
}

type ApiTab = 'accounting' | 'bank-accounts' | 'cards' | 'tokens' | 'echecks' | 'receipts' | 'customers' | 'invoices' | 'payments' | 'openid';
type BankAction = 'list' | 'detail' | 'create' | 'createFromToken' | 'delete';
type CardAction = 'create' | 'list' | 'detail' | 'createFromToken' | 'delete';
type AccountingAction = 'companyInfo' | 'query' | 'read' | 'create' | 'update';

export const Step3Apis: React.FC<Step3ApisProps> = ({ tokens }) => {
  const [activeSubTab, setActiveSubTab] = useState<ApiTab>('accounting');
  
  // Custom states for calls
  const [realmId, setRealmId] = useState(tokens?.realmId || '');
  const [customAccessToken, setCustomAccessToken] = useState('');

  // Accounting Account states
  const [accountingAction, setAccountingAction] = useState<AccountingAction>('create');
  const [accountQuery, setAccountQuery] = useState('SELECT * FROM Account MAXRESULTS 50');
  const [accountId, setAccountId] = useState('');
  const [accountName, setAccountName] = useState('Citi Business Operating Checking');
  const [accountType, setAccountType] = useState('Bank');
  const [accountSubType, setAccountSubType] = useState('Checking');
  const [accountAcctNum, setAccountAcctNum] = useState('1010');
  const [accountDescription, setAccountDescription] = useState('Primary checking account for operating expenses');
  const [accountActive, setAccountActive] = useState(true);
  const [accountSyncToken, setAccountSyncToken] = useState('0');

  // Customer states
  const [customerAction, setCustomerAction] = useState<'create' | 'query'>('create');
  const [customerDisplayName, setCustomerDisplayName] = useState('Acme Corp Client');
  const [customerGivenName, setCustomerGivenName] = useState('Alice');
  const [customerFamilyName, setCustomerFamilyName] = useState('Smith');
  const [customerCompanyName, setCustomerCompanyName] = useState('Acme Corp');
  const [customerEmail, setCustomerEmail] = useState('alice@acmecorp.com');
  const [customerPhone, setCustomerPhone] = useState('555-0199');
  const [customerQuery, setCustomerQuery] = useState('SELECT * FROM Customer MAXRESULTS 50');

  // Invoice states
  const [invoiceCustomerId, setInvoiceCustomerId] = useState('1');
  const [invoiceCustomerName, setInvoiceCustomerName] = useState('Acme Corp Client');
  const [invoiceAmount, setInvoiceAmount] = useState('2500.00');
  const [invoiceDescription, setInvoiceDescription] = useState('Consulting & Financial Engineering Services');
  const [invoiceDocNumber, setInvoiceDocNumber] = useState(`INV-${Date.now().toString().slice(-4)}`);

  // Payments / Charge states
  const [chargeAmount, setChargeAmount] = useState('10.50');
  const [chargeCurrency, setChargeCurrency] = useState('USD');
  const [chargeDescription, setChargeDescription] = useState('Sandbox Test Charge from Scaffold Runner');

  // BankAccounts states
  const [bankAction, setBankAction] = useState<BankAction>('create');
  const [bankCustomerId, setBankCustomerId] = useState(tokens?.realmId || '');
  const [bankAccountId, setBankAccountId] = useState('');
  const [bankName, setBankName] = useState('Richard Jones');
  const [bankAccountNumber, setBankAccountNumber] = useState('4534881023');
  const [bankRoutingNumber, setBankRoutingNumber] = useState('021000021');
  const [bankPhone, setBankPhone] = useState('6047296480');
  const [bankAccountType, setBankAccountType] = useState('PERSONAL_CHECKING');
  const [bankTokenValue, setBankTokenValue] = useState('');

  // Cards states
  const [cardAction, setCardAction] = useState<CardAction>('create');
  const [cardId, setCardId] = useState('');
  const [cardCount, setCardCount] = useState('10');
  const [cardNumber, setCardNumber] = useState('4111222233334444');
  const [cardExpMonth, setCardExpMonth] = useState('12');
  const [cardExpYear, setCardExpYear] = useState('2028');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardName, setCardName] = useState('Test User');
  const [cardDefault, setCardDefault] = useState(false);
  const [cardCommercialCode, setCardCommercialCode] = useState('');
  const [cardTokenValue, setCardTokenValue] = useState('');

  // Tokens states
  const [tokenType, setTokenType] = useState<'card' | 'bankAccount'>('card');
  const [tokenCardNumber, setTokenCardNumber] = useState('4111222233334444');
  const [tokenExpMonth, setTokenExpMonth] = useState('12');
  const [tokenExpYear, setTokenExpYear] = useState('2028');
  const [tokenCvc, setTokenCvc] = useState('123');
  const [tokenCardName, setTokenCardName] = useState('Test User');
  const [tokenRoutingNumber, setTokenRoutingNumber] = useState('123456789');
  const [tokenAccountNumber, setTokenAccountNumber] = useState('4534881023');
  const [tokenIsIE, setTokenIsIE] = useState(false);
  const [tokenAction, setTokenAction] = useState<'create' | 'detail' | 'delete'>('create');
  const [tokenId, setTokenId] = useState('bFy3h7W3D2tmOfYxl2msnLbUirY=');

  // Receipts states
  const [receiptAction, setReceiptAction] = useState<'query' | 'create'>('query');
  const [receiptQuery, setReceiptQuery] = useState('select * from SalesReceipt maxresults 50');
  const [salesReceiptJson, setSalesReceiptJson] = useState(JSON.stringify({
    Line: [
      {
        Amount: 150.00,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: { value: '1', name: 'Consulting Services' }
        }
      }
    ],
    CustomerRef: { value: '1', name: 'Test Customer' }
  }, null, 2));

  // EChecks states
  const [echeckAction, setEcheckAction] = useState<'create' | 'detail' | 'refund' | 'refundDetail'>('create');
  const [echeckId, setEcheckId] = useState('');
  const [echeckRefundId, setEcheckRefundId] = useState('');
  const [echeckAmount, setEcheckAmount] = useState('10.00');
  const [echeckPaymentMode, setEcheckPaymentMode] = useState('WEB');
  const [echeckDescription, setEcheckDescription] = useState('Test eCheck transaction');
  const [echeckCheckNumber, setEcheckCheckNumber] = useState('1001');
  const [echeckSourceType, setEcheckSourceType] = useState<'bank' | 'token' | 'onFile'>('bank');
  const [echeckTokenValue, setEcheckTokenValue] = useState('');
  const [echeckBankAccountOnFile, setEcheckBankAccountOnFile] = useState('');
  const [echeckRoutingNumber, setEcheckRoutingNumber] = useState('123456789');
  const [echeckAccountNumber, setEcheckAccountNumber] = useState('4534881023');
  const [echeckHolderName, setEcheckHolderName] = useState('Fname LName');
  const [echeckAccountType, setEcheckAccountType] = useState('PERSONAL_CHECKING');

  // Live QBO Entities & Generated Tokens/Cards/Accounts
  const [qboCustomers, setQboCustomers] = useState<Array<{ id: string; name: string; email?: string }>>([]);
  const [qboAccounts, setQboAccounts] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [qboItems, setQboItems] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [qboInvoices, setQboInvoices] = useState<Array<{ id: string; docNumber: string; totalAmt: number }>>([]);
  const [qboPayments, setQboPayments] = useState<Array<any>>([]);
  const [qboReceipts, setQboReceipts] = useState<Array<any>>([]);
  const [generatedTokensList, setGeneratedTokensList] = useState<Array<{ value: string; label: string }>>([]);
  const [generatedCardsList, setGeneratedCardsList] = useState<Array<{ id: string; label: string; name?: string }>>([]);
  const [generatedBankAccountsList, setGeneratedBankAccountsList] = useState<Array<{ id: string; label: string; name?: string }>>([]);
  const [generatedEChecksList, setGeneratedEChecksList] = useState<Array<{ id: string; label: string }>>([]);
  const [fetchingLiveData, setFetchingLiveData] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Storage Vault Keys
  const STORAGE_KEYS = {
    TOKENS: 'qbo_tokens_vault_v3',
    CARDS: 'qbo_cards_vault_v3',
    BANKS: 'qbo_banks_vault_v3',
    ECHECKS: 'qbo_echecks_vault_v3',
  };

  const addSavedToken = (val: string, label: string) => {
    setGeneratedTokensList(prev => {
      if (prev.some(t => t.value === val)) return prev;
      const updated = [{ value: val, label }, ...prev];
      try { localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const addSavedCard = (id: string, label: string, name?: string) => {
    setGeneratedCardsList(prev => {
      if (prev.some(c => c.id === id)) return prev;
      const updated = [{ id, label, name }, ...prev];
      try { localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const addSavedBankAccount = (id: string, label: string, name?: string) => {
    setGeneratedBankAccountsList(prev => {
      if (prev.some(b => b.id === id)) return prev;
      const updated = [{ id, label, name }, ...prev];
      try { localStorage.setItem(STORAGE_KEYS.BANKS, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const addSavedECheck = (id: string, label: string) => {
    setGeneratedEChecksList(prev => {
      if (prev.some(e => e.id === id)) return prev;
      const updated = [{ id, label }, ...prev];
      try { localStorage.setItem(STORAGE_KEYS.ECHECKS, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  // Load stored assets on initial mount
  React.useEffect(() => {
    try {
      const storedToks = localStorage.getItem(STORAGE_KEYS.TOKENS);
      if (storedToks) {
        const parsed = JSON.parse(storedToks);
        if (Array.isArray(parsed)) setGeneratedTokensList(parsed);
      }
      const storedCards = localStorage.getItem(STORAGE_KEYS.CARDS);
      if (storedCards) {
        const parsed = JSON.parse(storedCards);
        if (Array.isArray(parsed)) setGeneratedCardsList(parsed);
      }
      const storedBanks = localStorage.getItem(STORAGE_KEYS.BANKS);
      if (storedBanks) {
        const parsed = JSON.parse(storedBanks);
        if (Array.isArray(parsed)) setGeneratedBankAccountsList(parsed);
      }
      const storedEChecks = localStorage.getItem(STORAGE_KEYS.ECHECKS);
      if (storedEChecks) {
        const parsed = JSON.parse(storedEChecks);
        if (Array.isArray(parsed)) setGeneratedEChecksList(parsed);
      }
    } catch (err) {
      console.error('Error loading stored assets', err);
    }
  }, []);

  // Enhanced Charge Source States
  const [chargeSourceType, setChargeSourceType] = useState<'card' | 'token' | 'cardOnFile'>('card');
  const [chargeTokenValue, setChargeTokenValue] = useState('');
  const [chargeCardOnFileId, setChargeCardOnFileId] = useState('');
  const [chargeCustomerId, setChargeCustomerId] = useState('');
  const [chargeCardNumber, setChargeCardNumber] = useState('4111222233334444');
  const [chargeCardExpMonth, setChargeCardExpMonth] = useState('12');
  const [chargeCardExpYear, setChargeCardExpYear] = useState('2028');
  const [chargeCardCvc, setChargeCardCvc] = useState('123');
  const [chargeCardName, setChargeCardName] = useState('Test User');

  // Execution states
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<any | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeEndpointUrl, setActiveEndpointUrl] = useState<string>('');

  const tokenToUse = customAccessToken.trim() || tokens?.access_token || '';
  const finalRealm = realmId.trim() || tokens?.realmId || '';

  const fetchAllQboData = async () => {
    if (!tokenToUse) return;
    const realmToUse = finalRealm || '9341457771341574';
    setFetchingLiveData(true);
    setSyncMessage(null);
    try {
      const res = await apiFetch<any>('/api/intuit/pull-all', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: tokenToUse,
          realmId: realmToUse,
        }),
      });

      if (res.ok && res.data) {
        const d = res.data.data;
        const summary = res.data.summary;

        // 1. Customers
        let fetchedCusts: Array<{ id: string; name: string; email?: string }> = [];
        if (d?.customers) {
          fetchedCusts = d.customers.map((c: any) => ({
            id: String(c.Id),
            name: c.DisplayName || c.CompanyName || `${c.GivenName || ''} ${c.FamilyName || ''}`.trim() || `Customer ${c.Id}`,
            email: c.PrimaryEmailAddr?.Address,
          }));
          setQboCustomers(fetchedCusts);
          if (fetchedCusts.length > 0) {
            const firstId = fetchedCusts[0].id;
            setInvoiceCustomerId(firstId);
            setInvoiceCustomerName(fetchedCusts[0].name);
            setBankCustomerId(firstId);
            setCardId(firstId);
            setChargeCustomerId(firstId);
          }
        }

        // 2. Bank Accounts & Cards
        if (d?.bankAccounts && Array.isArray(d.bankAccounts)) {
          d.bankAccounts.forEach((b: any) => {
            const bId = String(b.id || b.Id || b.accountNumber || b.AcctNum || '');
            const bName = b.name || b.Name || 'Bank Account';
            if (bId) {
              addSavedBankAccount(bId, `${bName} (${bId})`, bName);
            }
          });
        }
        if (d?.cards && Array.isArray(d.cards)) {
          d.cards.forEach((c: any) => {
            const cId = String(c.id || c.Id || c.accountNumber || c.AcctNum || '');
            const cName = c.name || c.Name || 'Credit Card';
            if (cId) {
              addSavedCard(cId, `${cName} (${cId})`, cName);
            }
          });
        }

        // 3. Accounts (Chart of Accounts)
        if (d?.accounts) {
          const fetchedAccts = d.accounts.map((a: any) => ({
            id: String(a.Id),
            name: a.Name,
            type: a.AccountType,
          }));
          setQboAccounts(fetchedAccts);
          if (fetchedAccts.length > 0) {
            setAccountId(fetchedAccts[0].id);
          }
        }

        // 4. Invoices
        if (d?.invoices) {
          setQboInvoices(d.invoices.map((inv: any) => ({
            id: String(inv.Id),
            docNumber: inv.DocNumber || inv.Id,
            totalAmt: inv.TotalAmt || 0,
          })));
        }

        // 5. Payments
        if (d?.payments) {
          setQboPayments(d.payments);
        }

        // 6. Sales Receipts
        if (d?.salesReceipts) {
          setQboReceipts(d.salesReceipts);
        }

        setSyncMessage(`Pulled ${summary?.customersCount || 0} Customers, ${summary?.accountsCount || 0} Accounts, ${summary?.bankAccountsCount || 0} Bank Accounts, ${summary?.cardsCount || 0} Cards, ${summary?.invoicesCount || 0} Invoices, ${summary?.paymentsCount || 0} Payments & ${summary?.salesReceiptsCount || 0} Receipts!`);
      }
    } catch (err: any) {
      console.error('Error fetching QBO live data', err);
    } finally {
      setFetchingLiveData(false);
    }
  };

  React.useEffect(() => {
    if (tokenToUse) {
      fetchAllQboData();
    }
  }, [tokenToUse, finalRealm]);

  const handleRunCompanyInfo = async () => {
    if (!tokenToUse) {
      setError('Missing access token. Please complete Step 2 or enter a bearer token.');
      return;
    }
    if (!finalRealm) {
      setError('Missing realmId. Please enter your sandbox company Realm ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResult(null);
    const endpoint = `https://sandbox-quickbooks.api.intuit.com/v3/company/${finalRealm}/companyinfo/${finalRealm}`;
    setActiveEndpointUrl(endpoint);

    try {
      const res = await apiFetch<{ status: number; data: any }>('/api/intuit/company-info', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: tokenToUse,
          realmId: finalRealm,
        }),
      });

      setHttpStatus(res.status);
      if (!res.ok) {
        setError(res.error || 'Error executing Company Info request');
      } else {
        setApiResult(res.data?.data || res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Error executing Company Info request');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAccountingAction = async () => {
    if (!tokenToUse) {
      setError('Missing access token. Please complete Step 2 or enter a bearer token.');
      return;
    }
    if (!finalRealm) {
      setError('Missing realmId. Please enter your sandbox company Realm ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResult(null);

    let route = '/api/intuit/company-info';
    let endpoint = `https://sandbox-quickbooks.api.intuit.com/v3/company/${finalRealm}/companyinfo/${finalRealm}`;
    let reqBody: any = { accessToken: tokenToUse, realmId: finalRealm };

    if (accountingAction === 'query') {
      route = '/api/intuit/accounts/query';
      endpoint = `https://sandbox-quickbooks.api.intuit.com/v3/company/${finalRealm}/query?query=${encodeURIComponent(accountQuery)}&minorversion=75`;
      reqBody.query = accountQuery;
    } else if (accountingAction === 'read') {
      if (!accountId) {
        setError('Account ID is required to read account detail.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/accounts/read';
      endpoint = `https://sandbox-quickbooks.api.intuit.com/v3/company/${finalRealm}/account/${accountId}?minorversion=75`;
      reqBody.accountId = accountId;
    } else if (accountingAction === 'create') {
      route = '/api/intuit/accounts/create';
      endpoint = `https://sandbox-quickbooks.api.intuit.com/v3/company/${finalRealm}/account?minorversion=75`;
      reqBody = {
        ...reqBody,
        name: accountName,
        accountType,
        accountSubType,
        acctNum: accountAcctNum,
        description: accountDescription,
        active: accountActive,
      };
    } else if (accountingAction === 'update') {
      if (!accountId) {
        setError('Account ID is required for update.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/accounts/update';
      endpoint = `https://sandbox-quickbooks.api.intuit.com/v3/company/${finalRealm}/account?minorversion=75`;
      reqBody = {
        ...reqBody,
        id: accountId,
        syncToken: accountSyncToken,
        name: accountName,
        accountType,
        accountSubType,
        acctNum: accountAcctNum,
        description: accountDescription,
        active: accountActive,
      };
    }

    setActiveEndpointUrl(endpoint);

    try {
      const res = await apiFetch<{ status: number; data: any }>(route, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      });

      setHttpStatus(res.status);
      if (!res.ok) {
        setError(res.error || 'Error executing Accounting API request');
      } else {
        setApiResult(res.data?.data || res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Error executing Accounting API request');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCustomerAction = async () => {
    if (!tokenToUse) {
      setError('Missing access token. Please complete Step 2 or enter a bearer token.');
      return;
    }
    if (!finalRealm) {
      setError('Missing realmId. Please enter your sandbox company Realm ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResult(null);

    let route = '/api/intuit/customers/create';
    let endpoint = `https://sandbox-quickbooks.api.intuit.com/v3/company/${finalRealm}/customer?minorversion=75`;
    let reqBody: any = {
      accessToken: tokenToUse,
      realmId: finalRealm,
      displayName: customerDisplayName,
      givenName: customerGivenName,
      familyName: customerFamilyName,
      companyName: customerCompanyName,
      email: customerEmail,
      phone: customerPhone,
    };

    if (customerAction === 'query') {
      route = '/api/intuit/customers/query';
      endpoint = `https://sandbox-quickbooks.api.intuit.com/v3/company/${finalRealm}/query?query=${encodeURIComponent(customerQuery)}&minorversion=75`;
      reqBody = { accessToken: tokenToUse, realmId: finalRealm, query: customerQuery };
    }

    setActiveEndpointUrl(endpoint);

    try {
      const res = await apiFetch<{ status: number; data: any }>(route, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      });

      setHttpStatus(res.status);
      if (!res.ok) {
        setError(res.error || 'Error executing Customer API request');
      } else {
        setApiResult(res.data?.data || res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Error executing Customer API request');
    } finally {
      setLoading(false);
    }
  };

  const handleRunInvoiceAction = async () => {
    if (!tokenToUse) {
      setError('Missing access token. Please complete Step 2 or enter a bearer token.');
      return;
    }
    if (!finalRealm) {
      setError('Missing realmId. Please enter your sandbox company Realm ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResult(null);

    const endpoint = `https://sandbox-quickbooks.api.intuit.com/v3/company/${finalRealm}/invoice?minorversion=75`;
    setActiveEndpointUrl(endpoint);

    try {
      const res = await apiFetch<{ status: number; data: any }>('/api/intuit/invoices/create', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: tokenToUse,
          realmId: finalRealm,
          customerId: invoiceCustomerId,
          customerName: invoiceCustomerName,
          amount: invoiceAmount,
          description: invoiceDescription,
          docNumber: invoiceDocNumber,
        }),
      });

      setHttpStatus(res.status);
      if (!res.ok) {
        setError(res.error || 'Error creating invoice');
      } else {
        setApiResult(res.data?.data || res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Error creating invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleRunUserInfo = async () => {
    if (!tokenToUse) {
      setError('Missing access token. Please complete Step 2 or enter a bearer token.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResult(null);
    const endpoint = 'https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo';
    setActiveEndpointUrl(endpoint);

    try {
      const res = await apiFetch<{ status: number; data: any }>('/api/intuit/user-info', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: tokenToUse,
        }),
      });

      setHttpStatus(res.status);
      if (!res.ok) {
        setError(res.error || 'Error executing User Info request');
      } else {
        setApiResult(res.data?.data || res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Error executing User Info request');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCreateCharge = async () => {
    if (!tokenToUse) {
      setError('Missing access token. Please complete Step 2 or enter a bearer token.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResult(null);
    const endpoint = 'https://sandbox.api.intuit.com/quickbooks/v4/payments/charges';
    setActiveEndpointUrl(endpoint);

    const reqBody: any = {
      accessToken: tokenToUse,
      amount: chargeAmount,
      currency: chargeCurrency,
      description: chargeDescription,
    };

    if (chargeSourceType === 'token') {
      if (!chargeTokenValue) {
        setError('Token value is required for tokenized charge. Select or generate a token first.');
        setLoading(false);
        return;
      }
      reqBody.tokenValue = chargeTokenValue;
    } else if (chargeSourceType === 'cardOnFile') {
      if (!chargeCardOnFileId) {
        setError('Card on File ID is required.');
        setLoading(false);
        return;
      }
      reqBody.cardOnFileId = chargeCardOnFileId;
    } else {
      reqBody.card = {
        number: chargeCardNumber,
        expMonth: chargeCardExpMonth,
        expYear: chargeCardExpYear,
        cvc: chargeCardCvc,
        name: chargeCardName,
      };
    }

    try {
      const res = await apiFetch<{ status: number; data: any }>('/api/intuit/create-charge', {
        method: 'POST',
        body: JSON.stringify(reqBody),
      });

      setHttpStatus(res.status);
      if (!res.ok) {
        setError(res.error || 'Error executing Payments charge');
      } else {
        setApiResult(res.data?.data || res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Error executing Payments charge');
    } finally {
      setLoading(false);
    }
  };

  const handleRunBankAccounts = async () => {
    const custId = bankCustomerId || finalRealm;
    if (!tokenToUse) {
      setError('Missing access token. Please complete Step 2 or enter a bearer token.');
      return;
    }
    if (!custId) {
      setError('Customer ID / Realm ID is required for BankAccounts API.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResult(null);

    let route = '/api/intuit/bank-accounts/list';
    let endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/customers/${custId}/bank-accounts`;
    let reqBody: any = { accessToken: tokenToUse, customerId: custId };

    if (bankAction === 'detail') {
      if (!bankAccountId) {
        setError('Bank Account ID is required to get details.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/bank-accounts/detail';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/customers/${custId}/bank-accounts/${bankAccountId}`;
      reqBody.bankAccountId = bankAccountId;
    } else if (bankAction === 'create') {
      route = '/api/intuit/bank-accounts/create';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/customers/${custId}/bank-accounts`;
      reqBody = {
        ...reqBody,
        name: bankName,
        accountNumber: bankAccountNumber,
        routingNumber: bankRoutingNumber,
        phone: bankPhone,
        accountType: bankAccountType,
      };
    } else if (bankAction === 'createFromToken') {
      if (!bankTokenValue) {
        setError('Token value is required for createFromToken.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/bank-accounts/create-from-token';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/customers/${custId}/bank-accounts/createFromToken`;
      reqBody.tokenValue = bankTokenValue;
    } else if (bankAction === 'delete') {
      if (!bankAccountId) {
        setError('Bank Account ID is required to delete.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/bank-accounts/delete';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/customers/${custId}/bank-accounts/${bankAccountId}`;
      reqBody.bankAccountId = bankAccountId;
    }

    setActiveEndpointUrl(endpoint);

    try {
      const res = await apiFetch<{ status: number; data: any }>(route, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      });

      setHttpStatus(res.status);
      if (!res.ok) {
        setError(res.error || 'Error executing BankAccounts request');
      } else {
        const dataObj = res.data?.data || res.data;
        setApiResult(dataObj);
        const newBankId = dataObj?.id || dataObj?.bankAccountId;
        if (bankAction === 'create' && newBankId) {
          setBankAccountId(String(newBankId));
          setEcheckBankAccountOnFile(String(newBankId));
          setGeneratedBankAccountsList(prev => [
            { id: String(newBankId), label: `Bank Acc ID ${newBankId} (${bankName})` },
            ...prev
          ]);
        }
      }
    } catch (e: any) {
      setError(e.message || 'Error executing BankAccounts request');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCards = async () => {
    const tokenToUse = customAccessToken.trim() || tokens?.access_token || '';
    const custId = bankCustomerId || realmId.trim() || tokens?.realmId || '';
    if (!tokenToUse) {
      setError('Missing access token. Please authenticate with QuickBooks first.');
      return;
    }
    if (!custId) {
      setError('Customer ID / Realm ID is required for Cards API.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResult(null);

    let route = '/api/intuit/cards/list';
    let endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/customers/${custId}/cards`;
    let reqBody: any = { accessToken: tokenToUse, customerId: custId };

    if (cardAction === 'list') {
      route = '/api/intuit/cards/list';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/customers/${custId}/cards`;
      if (cardCount) reqBody.count = cardCount;
    } else if (cardAction === 'detail') {
      if (!cardId) {
        setError('Card ID is required to get details.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/cards/detail';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/customers/${custId}/cards/${cardId}`;
      reqBody.cardId = cardId;
    } else if (cardAction === 'create') {
      route = '/api/intuit/cards/create';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/customers/${custId}/cards`;
      reqBody = {
        ...reqBody,
        number: cardNumber,
        expMonth: cardExpMonth,
        expYear: cardExpYear,
        cvc: cardCvc,
        name: cardName,
        defaultCard: cardDefault,
        commercialCardCode: cardCommercialCode || undefined,
      };
    } else if (cardAction === 'createFromToken') {
      if (!cardTokenValue) {
        setError('Token value is required for createFromToken.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/cards/create-from-token';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/customers/${custId}/cards/createFromToken`;
      reqBody.tokenValue = cardTokenValue;
    } else if (cardAction === 'delete') {
      if (!cardId) {
        setError('Card ID is required to delete.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/cards/delete';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/customers/${custId}/cards/${cardId}`;
      reqBody.cardId = cardId;
    }

    setActiveEndpointUrl(endpoint);

    try {
      const res = await apiFetch<{ status: number; data: any }>(route, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      });

      setHttpStatus(res.status);
      if (!res.ok) {
        setError(res.error || 'Error executing Cards request');
      } else {
        const dataObj = res.data?.data || res.data;
        setApiResult(dataObj);
        const newCardId = dataObj?.id || dataObj?.cardId;
        if (cardAction === 'create' && newCardId) {
          setCardId(String(newCardId));
          setChargeCardOnFileId(String(newCardId));
          setGeneratedCardsList(prev => [
            { id: String(newCardId), label: `Card ID ${newCardId} (${cardName})` },
            ...prev
          ]);
        }
      }
    } catch (e: any) {
      setError(e.message || 'Error executing Cards request');
    } finally {
      setLoading(false);
    }
  };

  const handleRunTokens = async () => {
    const tokenToUse = customAccessToken.trim() || tokens?.access_token || '';
    if (!tokenToUse) {
      setError('Missing access token. Please authenticate with QuickBooks first.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResult(null);

    let route = '/api/intuit/tokens/create';
    let endpoint = tokenIsIE 
      ? 'https://sandbox.api.intuit.com/quickbooks/v4/payments/tokens/ie'
      : 'https://sandbox.api.intuit.com/quickbooks/v4/payments/tokens';
    let reqBody: any = { accessToken: tokenToUse, isIE: tokenIsIE };

    if (tokenAction === 'create') {
      route = '/api/intuit/tokens/create';
      if (tokenType === 'card') {
        reqBody.card = {
          number: tokenCardNumber,
          expMonth: tokenExpMonth,
          expYear: tokenExpYear,
          cvc: tokenCvc,
          name: tokenCardName,
        };
      } else {
        reqBody.bankAccount = {
          name: tokenCardName,
          routingNumber: tokenRoutingNumber,
          accountNumber: tokenAccountNumber,
          accountType: 'COMMERCIAL_CHECKING',
        };
      }
    } else if (tokenAction === 'detail') {
      if (!tokenId) {
        setError('Token ID is required for reading token details.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/tokens/detail';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/payments/tokens/${tokenId}`;
      reqBody.tokenId = tokenId;
    } else if (tokenAction === 'delete') {
      if (!tokenId) {
        setError('Token ID is required for deleting a token.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/tokens/delete';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/payments/tokens/${tokenId}`;
      reqBody.tokenId = tokenId;
    }

    setActiveEndpointUrl(endpoint);

    try {
      const res = await apiFetch<{ status: number; data: any }>(route, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      });

      setHttpStatus(res.status);
      if (!res.ok) {
        setError(res.error || 'Error executing Tokens request');
      } else {
        const dataObj = res.data?.data || res.data;
        setApiResult(dataObj);
        const tokVal = dataObj?.value || dataObj?.token || dataObj?.id;
        if (tokenAction === 'create' && tokVal && typeof tokVal === 'string') {
          setTokenId(tokVal);
          setChargeTokenValue(tokVal);
          setEcheckTokenValue(tokVal);
          setBankTokenValue(tokVal);
          setCardTokenValue(tokVal);
          setGeneratedTokensList(prev => [
            { value: tokVal, label: `${tokenType === 'card' ? 'Card Token' : 'Bank ACH Token'}: ${tokVal}` },
            ...prev
          ]);
        }
      }
    } catch (e: any) {
      setError(e.message || 'Error executing Tokens request');
    } finally {
      setLoading(false);
    }
  };

  const handleRunReceipts = async () => {
    const tokenToUse = customAccessToken.trim() || tokens?.access_token || '';
    const realmToUse = realmId.trim() || tokens?.realmId || '9341457771341574';
    if (!tokenToUse) {
      setError('Missing access token. Please authenticate with QuickBooks first.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResult(null);

    let route = '/api/intuit/salesreceipts/query';
    let endpoint = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmToUse}/query?query=${encodeURIComponent(receiptQuery)}`;
    let reqBody: any = { accessToken: tokenToUse, realmId: realmToUse };

    if (receiptAction === 'query') {
      route = '/api/intuit/salesreceipts/query';
      reqBody.query = receiptQuery;
    } else if (receiptAction === 'create') {
      route = '/api/intuit/salesreceipts/create';
      endpoint = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmToUse}/salesreceipt`;
      try {
        reqBody.salesReceiptData = JSON.parse(salesReceiptJson);
      } catch (err: any) {
        setError('Invalid JSON for Sales Receipt: ' + err.message);
        setLoading(false);
        return;
      }
    }

    setActiveEndpointUrl(endpoint);

    try {
      const res = await apiFetch<{ status: number; data: any }>(route, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      });

      setHttpStatus(res.status);
      if (!res.ok) {
        setError(res.error || 'Error executing Sales Receipts request');
      } else {
        setApiResult(res.data?.data || res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Error executing Sales Receipts request');
    } finally {
      setLoading(false);
    }
  };

  const handleRunEChecks = async () => {
    const tokenToUse = customAccessToken.trim() || tokens?.access_token || '';
    if (!tokenToUse) {
      setError('Missing access token. Please authenticate with QuickBooks first.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResult(null);

    let route = '/api/intuit/echecks/create';
    let endpoint = 'https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks';
    let reqBody: any = { accessToken: tokenToUse };

    if (echeckAction === 'create') {
      route = '/api/intuit/echecks/create';
      endpoint = 'https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks';
      reqBody.amount = echeckAmount;
      reqBody.paymentMode = echeckPaymentMode;
      reqBody.description = echeckDescription;
      reqBody.checkNumber = echeckCheckNumber;

      if (echeckSourceType === 'token') {
        if (!echeckTokenValue) {
          setError('Token value is required when source is Token.');
          setLoading(false);
          return;
        }
        reqBody.tokenValue = echeckTokenValue;
      } else if (echeckSourceType === 'onFile') {
        if (!echeckBankAccountOnFile) {
          setError('Bank account ID on file is required.');
          setLoading(false);
          return;
        }
        reqBody.bankAccountOnFile = echeckBankAccountOnFile;
      } else {
        reqBody.bankAccount = {
          name: echeckHolderName,
          routingNumber: echeckRoutingNumber,
          accountNumber: echeckAccountNumber,
          accountType: echeckAccountType || 'PERSONAL_CHECKING',
        };
      }
    } else if (echeckAction === 'detail') {
      if (!echeckId) {
        setError('eCheck ID is required for getting details.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/echecks/detail';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks/${echeckId}`;
      reqBody.echeckId = echeckId;
    } else if (echeckAction === 'refund') {
      if (!echeckId) {
        setError('eCheck ID is required for refund.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/echecks/refund';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks/${echeckId}/refunds`;
      reqBody.echeckId = echeckId;
      reqBody.amount = echeckAmount;
      reqBody.description = echeckDescription;
    } else if (echeckAction === 'void') {
      if (!echeckId) {
        setError('eCheck ID is required for void.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/echecks/void';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks/${echeckId}/voids`;
      reqBody.echeckId = echeckId;
    } else if (echeckAction === 'refundDetail') {
      if (!echeckId || !echeckRefundId) {
        setError('Both eCheck ID and Refund ID are required.');
        setLoading(false);
        return;
      }
      route = '/api/intuit/echecks/refund-detail';
      endpoint = `https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks/${echeckId}/refunds/${echeckRefundId}`;
      reqBody.echeckId = echeckId;
      reqBody.refundId = echeckRefundId;
    }

    setActiveEndpointUrl(endpoint);

    try {
      const res = await apiFetch<{ status: number; data: any }>(route, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      });

      setHttpStatus(res.status);
      if (!res.ok) {
        setError(res.error || 'Error executing EChecks request');
      } else {
        const dataObj = res.data?.data || res.data;
        setApiResult(dataObj);
        const createdId = dataObj?.id || dataObj?.echeckId;
        if (echeckAction === 'create' && createdId) {
          setEcheckId(String(createdId));
          addSavedECheck(String(createdId), `eCheck ID ${createdId} ($${echeckAmount})`);
        }
      }
    } catch (e: any) {
      setError(e.message || 'Error executing EChecks request');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (apiResult) {
      navigator.clipboard.writeText(JSON.stringify(apiResult, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#30363D] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[#30363D] flex items-center justify-between bg-[#161B22]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#238636] text-white font-bold text-sm shadow-xs">
            3
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Step 03 — Call Sandbox APIs with Bearer Token</h2>
            <p className="text-xs text-[#8B949E]">Execute verified Intuit Sandbox API requests with 1-click execution buttons</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-[#1f242c] text-[#79C0FF] border border-[#30363D]">
          Live Sandbox Workbench
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Token & Realm ID Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#0d1117] border border-[#30363D] rounded-xl text-xs">
          <div>
            <span className="font-semibold text-[#8B949E] uppercase tracking-wider text-[11px] block mb-1">
              Active Access Token:
            </span>
            <input
              type="password"
              placeholder="Paste Bearer Token or authenticate in Step 2..."
              id="input-step3-custom-token"
              value={customAccessToken || tokens?.access_token || ''}
              onChange={(e) => setCustomAccessToken(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded text-[#C9D1D9] focus:outline-none focus:border-[#79C0FF]"
            />
          </div>

          <div>
            <span className="font-semibold text-[#8B949E] uppercase tracking-wider text-[11px] block mb-1">
              Sandbox Company Realm ID:
            </span>
            <input
              type="text"
              id="input-step3-realm"
              value={realmId}
              onChange={(e) => setRealmId(e.target.value)}
              placeholder="e.g. 4620816365..."
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded text-[#C9D1D9] focus:outline-none focus:border-[#79C0FF]"
            />
          </div>
        </div>

        {/* Sync & Live Entities Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161B22] border border-[#30363D] p-3 rounded-xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#C9D1D9]">
            <Sparkles className="w-4 h-4 text-[#D29922] shrink-0" />
            <span>
              Live QBO Sync: <strong className="text-[#3FB950]">{qboCustomers.length} Customers</strong> | <strong className="text-[#79C0FF]">{qboAccounts.length} Accounts</strong> | <strong className="text-[#D29922]">{generatedBankAccountsList.length} Banks</strong> | <strong className="text-purple-400">{generatedCardsList.length} Cards</strong> | <strong className="text-indigo-400">{qboInvoices.length} Invoices</strong> | <strong className="text-blue-400">{qboPayments.length} Payments</strong> | <strong className="text-teal-400">{qboReceipts.length} Receipts</strong>
            </span>
            {syncMessage && <span className="text-[#3FB950] text-[11px] ml-1">({syncMessage})</span>}
          </div>
          <button
            type="button"
            onClick={fetchAllQboData}
            disabled={fetchingLiveData}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer shadow-xs border border-[#3FB950]/30 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingLiveData ? 'animate-spin' : ''}`} />
            <span>{fetchingLiveData ? 'Pulling All 10 Entities...' : '🔄 Pull All QBO Sandbox Entities'}</span>
          </button>
        </div>

        {/* API Selector Sub-tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { id: 'accounting', label: 'Accounts (QBO)', icon: Building2, desc: 'Chart of Accounts', color: '#3FB950' },
            { id: 'bank-accounts', label: 'Bank Accounts', icon: Landmark, desc: 'ACH & Customer Banks', color: '#79C0FF' },
            { id: 'cards', label: 'Credit Cards', icon: CreditCard, desc: 'Payments Card Entity', color: '#A371F7' },
            { id: 'tokens', label: 'Tokens', icon: Sparkles, desc: 'Secure Token Vault', color: '#D29922' },
            { id: 'echecks', label: 'EChecks', icon: FileText, desc: 'ACH Check Debits', color: '#3FB950' },
            { id: 'receipts', label: 'Receipts', icon: FileText, desc: 'Sales Receipts (QBO)', color: '#3FB950' },
            { id: 'customers', label: 'Customers', icon: User, desc: 'Create & Query', color: '#D29922' },
            { id: 'invoices', label: 'Invoices', icon: FileText, desc: 'Create Invoice', color: '#A371F7' },
            { id: 'payments', label: 'Payments', icon: CreditCard, desc: 'Create Charge', color: '#3FB950' },
            { id: 'openid', label: 'OpenID Profile', icon: User, desc: 'User Claims', color: '#79C0FF' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`subtab-${tab.id}-btn`}
                onClick={() => {
                  setActiveSubTab(tab.id as ApiTab);
                  setApiResult(null);
                  setError(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-[#238636] bg-[#238636]/10 ring-1 ring-[#3FB950]/30'
                    : 'border-[#30363D] bg-[#0d1117] hover:border-[#484f58]'
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1" style={{ color: tab.color }}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="font-semibold text-xs">{tab.label}</span>
                </div>
                <p className="text-[11px] text-[#8B949E] truncate">{tab.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Endpoint Configuration & Action */}
        <div className="p-5 bg-[#0d1117] rounded-xl border border-[#30363D] space-y-4">
          
          {/* Subtab 1: Chart of Accounts */}
          {activeSubTab === 'accounting' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
                    Accounting Operation / Method
                  </label>
                  <select
                    id="select-accounting-action"
                    value={accountingAction}
                    onChange={(e) => setAccountingAction(e.target.value as AccountingAction)}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:border-[#79C0FF]"
                  >
                    <option value="create">POST Create Account (POST /v3/company/:realm/account)</option>
                    <option value="query">GET Query Accounts (SELECT * FROM Account)</option>
                    <option value="companyInfo">GET Company Info (/v3/company/:realm/companyinfo)</option>
                    <option value="read">GET Read Account by ID (/v3/company/:realm/account/:id)</option>
                    <option value="update">POST Update / Deactivate Account (/v3/company/:realm/account)</option>
                  </select>
                </div>
              </div>

              {accountingAction === 'create' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Account Name *</label>
                    <input
                      type="text"
                      id="input-account-name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Account Type *</label>
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    >
                      <option value="Bank">Bank</option>
                      <option value="CreditCard">CreditCard</option>
                      <option value="OtherCurrentAsset">OtherCurrentAsset</option>
                      <option value="OtherCurrentLiability">OtherCurrentLiability</option>
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                      <option value="Equity">Equity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">SubType</label>
                    <input
                      type="text"
                      value={accountSubType}
                      onChange={(e) => setAccountSubType(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Account # (AcctNum)</label>
                    <input
                      type="text"
                      value={accountAcctNum}
                      onChange={(e) => setAccountAcctNum(e.target.value)}
                      placeholder="e.g. 1010"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Description</label>
                    <input
                      type="text"
                      value={accountDescription}
                      onChange={(e) => setAccountDescription(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                </div>
              )}

              {accountingAction === 'query' && (
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">SQL Query</label>
                  <input
                    type="text"
                    value={accountQuery}
                    onChange={(e) => setAccountQuery(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              )}

              {(accountingAction === 'read' || accountingAction === 'update') && (
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Account ID</label>
                  <input
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="e.g. 94"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#30363D]">
                <div className="text-[11px] font-mono text-[#79C0FF]">
                  Endpoint: {accountingAction === 'create' ? 'POST /v3/company/:realm/account' : `GET /v3/company/:realm/${accountingAction}`}
                </div>
                <button
                  id="run-accounting-action-btn"
                  onClick={accountingAction === 'companyInfo' ? handleRunCompanyInfo : handleRunAccountingAction}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors border border-[rgba(240,246,252,0.1)]"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{accountingAction === 'create' ? 'Send: Create Account in QBO' : 'Execute Accounting Request'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Subtab 2: Bank Accounts API */}
          {activeSubTab === 'bank-accounts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
                    Select Customer / Customer ID *
                  </label>
                  {qboCustomers.length > 0 ? (
                    <select
                      value={bankCustomerId}
                      onChange={(e) => {
                        const cid = e.target.value;
                        setBankCustomerId(cid);
                        const found = qboCustomers.find(c => c.id === cid);
                        if (found) setBankName(found.name);
                      }}
                      className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    >
                      {qboCustomers.map(c => (
                        <option key={c.id} value={c.id}>
                          [{c.id}] {c.name} {c.email ? `(${c.email})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={bankCustomerId}
                      onChange={(e) => setBankCustomerId(e.target.value)}
                      placeholder="e.g. 1 or Realm ID"
                      className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
                    Bank Operation
                  </label>
                  <select
                    id="select-bank-action"
                    value={bankAction}
                    onChange={(e) => setBankAction(e.target.value as BankAction)}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  >
                    <option value="create">POST Create Bank Account (POST /customers/:id/bank-accounts)</option>
                    <option value="list">GET List Bank Accounts (GET /customers/:id/bank-accounts)</option>
                    <option value="detail">GET Bank Account Detail (GET /customers/:id/bank-accounts/:id)</option>
                    <option value="delete">DELETE Bank Account (DELETE /customers/:id/bank-accounts/:id)</option>
                  </select>
                </div>
              </div>

              {bankAction === 'create' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Account Holder Name *</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Account Number *</label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Routing Number *</label>
                    <input
                      type="text"
                      value={bankRoutingNumber}
                      onChange={(e) => setBankRoutingNumber(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Account Type</label>
                    <select
                      value={bankAccountType}
                      onChange={(e) => setBankAccountType(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    >
                      <option value="PERSONAL_CHECKING">PERSONAL_CHECKING (Standard Customer Checking)</option>
                      <option value="PERSONAL_SAVINGS">PERSONAL_SAVINGS (Customer Savings)</option>
                      <option value="COMMERCIAL_CHECKING">COMMERCIAL_CHECKING (Business Checking)</option>
                      <option value="COMMERCIAL_SAVINGS">COMMERCIAL_SAVINGS (Business Savings)</option>
                      <option value="CHECKING">CHECKING</option>
                      <option value="SAVINGS">SAVINGS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={bankPhone}
                      onChange={(e) => setBankPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                </div>
              )}

              {(bankAction === 'detail' || bankAction === 'delete') && (
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Bank Account ID</label>
                  <input
                    type="text"
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    placeholder="e.g. 1020"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#30363D]">
                <div className="text-[11px] font-mono text-[#79C0FF]">
                  POST https://sandbox.api.intuit.com/quickbooks/v4/customers/:id/bank-accounts
                </div>
                <button
                  id="run-bank-action-btn"
                  onClick={handleRunBankAccounts}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors border border-[rgba(240,246,252,0.1)]"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{bankAction === 'create' ? 'Send: Create Bank Account' : 'Execute Bank Request'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Subtab: Cards API */}
          {activeSubTab === 'cards' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
                    Select Customer / Customer ID *
                  </label>
                  {qboCustomers.length > 0 ? (
                    <select
                      value={bankCustomerId}
                      onChange={(e) => {
                        const cid = e.target.value;
                        setBankCustomerId(cid);
                        const found = qboCustomers.find(c => c.id === cid);
                        if (found) setCardName(found.name);
                      }}
                      className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    >
                      {qboCustomers.map(c => (
                        <option key={c.id} value={c.id}>
                          [{c.id}] {c.name} {c.email ? `(${c.email})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={bankCustomerId}
                      onChange={(e) => setBankCustomerId(e.target.value)}
                      placeholder="e.g. 1 or Realm ID"
                      className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
                    Card Operation
                  </label>
                  <select
                    id="select-card-action"
                    value={cardAction}
                    onChange={(e) => setCardAction(e.target.value as CardAction)}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  >
                    <option value="create">POST Create Card (POST /customers/:id/cards)</option>
                    <option value="createFromToken">POST Create Card From Token (POST /customers/:id/cards/createFromToken)</option>
                    <option value="list">GET List Cards (GET /customers/:id/cards)</option>
                    <option value="detail">GET Card Detail (GET /customers/:id/cards/:card_id)</option>
                    <option value="delete">DELETE Card (DELETE /customers/:id/cards/:card_id)</option>
                  </select>
                </div>
              </div>

              {cardAction === 'create' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Card Number *</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4111222233334444"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Exp Month (MM) *</label>
                    <input
                      type="text"
                      value={cardExpMonth}
                      onChange={(e) => setCardExpMonth(e.target.value)}
                      placeholder="12"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Exp Year (YYYY) *</label>
                    <input
                      type="text"
                      value={cardExpYear}
                      onChange={(e) => setCardExpYear(e.target.value)}
                      placeholder="2028"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">CVC *</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Test User"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Default Card</label>
                    <select
                      value={cardDefault ? 'true' : 'false'}
                      onChange={(e) => setCardDefault(e.target.value === 'true')}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    >
                      <option value="false">false</option>
                      <option value="true">true</option>
                    </select>
                  </div>
                </div>
              )}

              {cardAction === 'createFromToken' && (
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Token Value *</label>
                  <input
                    type="text"
                    value={cardTokenValue}
                    onChange={(e) => setCardTokenValue(e.target.value)}
                    placeholder="Enter token value..."
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              )}

              {(cardAction === 'detail' || cardAction === 'delete') && (
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Card ID *</label>
                  <input
                    type="text"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    placeholder="e.g. 101101015602106732027893"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              )}

              {cardAction === 'list' && (
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Count (Limit)</label>
                  <input
                    type="text"
                    value={cardCount}
                    onChange={(e) => setCardCount(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#30363D]">
                <div className="text-[11px] font-mono text-[#A371F7]">
                  {cardAction === 'create' && 'POST https://sandbox.api.intuit.com/quickbooks/v4/customers/:id/cards'}
                  {cardAction === 'createFromToken' && 'POST https://sandbox.api.intuit.com/quickbooks/v4/customers/:id/cards/createFromToken'}
                  {cardAction === 'list' && 'GET https://sandbox.api.intuit.com/quickbooks/v4/customers/:id/cards'}
                  {cardAction === 'detail' && 'GET https://sandbox.api.intuit.com/quickbooks/v4/customers/:id/cards/:card_id'}
                  {cardAction === 'delete' && 'DELETE https://sandbox.api.intuit.com/quickbooks/v4/customers/:id/cards/:card_id'}
                </div>
                <button
                  id="run-card-action-btn"
                  onClick={handleRunCards}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors border border-[rgba(240,246,252,0.1)]"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{cardAction === 'create' ? 'Send: Create Card' : 'Execute Cards Request'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Subtab: Tokens */}
          {activeSubTab === 'tokens' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
                    Token Action
                  </label>
                  <select
                    value={tokenAction}
                    onChange={(e) => setTokenAction(e.target.value as 'create' | 'detail' | 'delete')}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  >
                    <option value="create">POST /tokens (Create Token)</option>
                    <option value="detail">GET /tokens/{'{id}'} (Get Details)</option>
                    <option value="delete">DELETE /tokens/{'{id}'} (Delete Token)</option>
                  </select>
                </div>
                {tokenAction === 'create' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
                        Token Source Type
                      </label>
                      <select
                        value={tokenType}
                        onChange={(e) => setTokenType(e.target.value as 'card' | 'bankAccount')}
                        className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                      >
                        <option value="card">Credit Card Tokenization</option>
                        <option value="bankAccount">Bank Account (ACH) Tokenization</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
                        API Endpoint Variant
                      </label>
                      <select
                        value={tokenIsIE ? 'true' : 'false'}
                        onChange={(e) => setTokenIsIE(e.target.value === 'true')}
                        className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                      >
                        <option value="false">Standard (/quickbooks/v4/payments/tokens)</option>
                        <option value="true">Legacy IE8/9 (/quickbooks/v4/payments/tokens/ie)</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {tokenAction === 'create' && tokenType === 'card' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Card Number *</label>
                    <input
                      type="text"
                      value={tokenCardNumber}
                      onChange={(e) => setTokenCardNumber(e.target.value)}
                      placeholder="4111222233334444"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Exp Month (MM)</label>
                    <input
                      type="text"
                      value={tokenExpMonth}
                      onChange={(e) => setTokenExpMonth(e.target.value)}
                      placeholder="12"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Exp Year (YYYY)</label>
                    <input
                      type="text"
                      value={tokenExpYear}
                      onChange={(e) => setTokenExpYear(e.target.value)}
                      placeholder="2028"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">CVC</label>
                    <input
                      type="text"
                      value={tokenCvc}
                      onChange={(e) => setTokenCvc(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={tokenCardName}
                      onChange={(e) => setTokenCardName(e.target.value)}
                      placeholder="Test User"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                </div>
              )}

              {tokenAction === 'create' && tokenType === 'bankAccount' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Account Holder Name *</label>
                    <input
                      type="text"
                      value={tokenCardName}
                      onChange={(e) => setTokenCardName(e.target.value)}
                      placeholder="Fname LName"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Routing Number *</label>
                    <input
                      type="text"
                      value={tokenRoutingNumber}
                      onChange={(e) => setTokenRoutingNumber(e.target.value)}
                      placeholder="123456789"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Account Number *</label>
                    <input
                      type="text"
                      value={tokenAccountNumber}
                      onChange={(e) => setTokenAccountNumber(e.target.value)}
                      placeholder="4534881023"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                </div>
              )}

              {(tokenAction === 'detail' || tokenAction === 'delete') && (
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Token ID *</label>
                  <input
                    type="text"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    placeholder="Enter token ID..."
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#30363D]">
                <div className="text-[11px] font-mono text-[#D29922]">
                  {tokenAction === 'create' && (tokenIsIE ? 'POST /payments/tokens/ie' : 'POST /payments/tokens')}
                  {tokenAction === 'detail' && 'GET /payments/tokens/:id'}
                  {tokenAction === 'delete' && 'DELETE /payments/tokens/:id'}
                </div>
                <button
                  id="run-token-action-btn"
                  onClick={handleRunTokens}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors border border-[rgba(240,246,252,0.1)]"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{tokenAction === 'create' ? 'Generate Secure Token' : tokenAction === 'detail' ? 'Get Token Details' : 'Delete Token'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Subtab: Receipts (Sales Receipts) */}
          {activeSubTab === 'receipts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
                    Receipt Operation
                  </label>
                  <select
                    value={receiptAction}
                    onChange={(e) => setReceiptAction(e.target.value as 'query' | 'create')}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  >
                    <option value="query">Query Sales Receipts (SQL)</option>
                    <option value="create">Create Sales Receipt (POST)</option>
                  </select>
                </div>
              </div>

              {receiptAction === 'query' ? (
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">SQL Query</label>
                  <input
                    type="text"
                    value={receiptQuery}
                    onChange={(e) => setReceiptQuery(e.target.value)}
                    placeholder="select * from SalesReceipt maxresults 50"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Sales Receipt JSON Payload</label>
                  <textarea
                    rows={6}
                    value={salesReceiptJson}
                    onChange={(e) => setSalesReceiptJson(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#30363D]">
                <div className="text-[11px] font-mono text-[#3FB950]">
                  {receiptAction === 'query' ? 'GET /v3/company/:realmId/query?query=...' : 'POST /v3/company/:realmId/salesreceipt'}
                </div>
                <button
                  id="run-receipt-action-btn"
                  onClick={handleRunReceipts}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors border border-[rgba(240,246,252,0.1)]"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{receiptAction === 'query' ? 'Query Sales Receipts' : 'Create Sales Receipt'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Subtab: EChecks */}
          {activeSubTab === 'echecks' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
                    ECheck Operation
                  </label>
                  <select
                    id="select-echeck-action"
                    value={echeckAction}
                    onChange={(e) => setEcheckAction(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  >
                    <option value="create">POST Create ECheck (POST /payments/echecks)</option>
                    <option value="detail">GET ECheck Details (GET /payments/echecks/:id)</option>
                    <option value="refund">POST Refund ECheck (POST /payments/echecks/:id/refunds)</option>
                    <option value="void">POST Void ECheck (POST /payments/echecks/:id/voids)</option>
                    <option value="refundDetail">GET Refund Details (GET /payments/echecks/:id/refunds/:refund_id)</option>
                  </select>
                </div>

                {echeckAction === 'create' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
                      Account Source
                    </label>
                    <select
                      value={echeckSourceType}
                      onChange={(e) => setEcheckSourceType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    >
                      <option value="bank">Explicit Bank Account Details</option>
                      <option value="token">Opaque Token Value</option>
                      <option value="onFile">Bank Account ID On File</option>
                    </select>
                  </div>
                )}
              </div>

              {echeckAction === 'create' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Amount ($) *</label>
                      <input
                        type="text"
                        value={echeckAmount}
                        onChange={(e) => setEcheckAmount(e.target.value)}
                        placeholder="10.00"
                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Payment Mode (SEC Code)</label>
                      <select
                        value={echeckPaymentMode}
                        onChange={(e) => setEcheckPaymentMode(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                      >
                        <option value="WEB">WEB (Internet-initiated)</option>
                        <option value="PPD">PPD (Prearranged Payment)</option>
                        <option value="CCD">CCD (Corporate Cash Disbursement)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Check Number</label>
                      <input
                        type="text"
                        value={echeckCheckNumber}
                        onChange={(e) => setEcheckCheckNumber(e.target.value)}
                        placeholder="1001"
                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                      />
                    </div>
                  </div>

                  {echeckSourceType === 'token' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Token Value *</label>
                      {generatedTokensList.length > 0 ? (
                        <select
                          value={echeckTokenValue}
                          onChange={(e) => setEcheckTokenValue(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                        >
                          <option value="">-- Select Generated Token --</option>
                          {generatedTokensList.map((t, idx) => (
                            <option key={idx} value={t.value}>
                              [{t.type}] Token: {t.value.substring(0, 16)}...
                            </option>
                          ))}
                        </select>
                      ) : null}
                      <input
                        type="text"
                        value={echeckTokenValue}
                        onChange={(e) => setEcheckTokenValue(e.target.value)}
                        placeholder="e.g. bFy3h7W3D2tmOfYxl2msnLbUirY="
                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                      />
                    </div>
                  )}

                  {echeckSourceType === 'onFile' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Bank Account ID On File *</label>
                      {generatedBankAccountsList.length > 0 ? (
                        <select
                          value={echeckBankAccountOnFile}
                          onChange={(e) => setEcheckBankAccountOnFile(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                        >
                          <option value="">-- Select Created Bank Account --</option>
                          {generatedBankAccountsList.map((b) => (
                            <option key={b.id} value={b.id}>
                              [{b.id}] {b.name} ({b.accountType})
                            </option>
                          ))}
                        </select>
                      ) : null}
                      <input
                        type="text"
                        value={echeckBankAccountOnFile}
                        onChange={(e) => setEcheckBankAccountOnFile(e.target.value)}
                        placeholder="e.g. 10208886"
                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                      />
                    </div>
                  )}

                  {echeckSourceType === 'bank' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Holder Name *</label>
                        <input
                          type="text"
                          value={echeckHolderName}
                          onChange={(e) => setEcheckHolderName(e.target.value)}
                          placeholder="Fname LName"
                          className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Routing Number *</label>
                        <input
                          type="text"
                          value={echeckRoutingNumber}
                          onChange={(e) => setEcheckRoutingNumber(e.target.value)}
                          placeholder="123456789"
                          className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Account Number *</label>
                        <input
                          type="text"
                          value={echeckAccountNumber}
                          onChange={(e) => setEcheckAccountNumber(e.target.value)}
                          placeholder="4534881023"
                          className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Account Type</label>
                        <select
                          value={bankAccountType}
                          onChange={(e) => setBankAccountType(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                        >
                          <option value="PERSONAL_CHECKING">PERSONAL_CHECKING</option>
                          <option value="PERSONAL_SAVINGS">PERSONAL_SAVINGS</option>
                          <option value="COMMERCIAL_CHECKING">COMMERCIAL_CHECKING</option>
                          <option value="COMMERCIAL_SAVINGS">COMMERCIAL_SAVINGS</option>
                          <option value="CHECKING">CHECKING</option>
                          <option value="SAVINGS">SAVINGS</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Description</label>
                        <input
                          type="text"
                          value={echeckDescription}
                          onChange={(e) => setEcheckDescription(e.target.value)}
                          placeholder="Test Check Auth"
                          className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {echeckAction === 'detail' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">ECheck ID *</label>
                  {generatedEChecksList.length > 0 ? (
                    <select
                      value={echeckId}
                      onChange={(e) => setEcheckId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    >
                      <option value="">-- Choose created eCheck ID --</option>
                      {generatedEChecksList.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <input
                    type="text"
                    value={echeckId}
                    onChange={(e) => setEcheckId(e.target.value)}
                    placeholder="e.g. 102088863639971869833376"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              )}

              {echeckAction === 'refund' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">ECheck ID *</label>
                    {generatedEChecksList.length > 0 ? (
                      <select
                        value={echeckId}
                        onChange={(e) => setEcheckId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                      >
                        <option value="">-- Choose created eCheck ID --</option>
                        {generatedEChecksList.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.label}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    <input
                      type="text"
                      value={echeckId}
                      onChange={(e) => setEcheckId(e.target.value)}
                      placeholder="e.g. 10208886"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Refund Amount ($) *</label>
                    <input
                      type="text"
                      value={echeckAmount}
                      onChange={(e) => setEcheckAmount(e.target.value)}
                      placeholder="10.00"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                </div>
              )}

              {echeckAction === 'void' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">ECheck ID *</label>
                  {generatedEChecksList.length > 0 ? (
                    <select
                      value={echeckId}
                      onChange={(e) => setEcheckId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    >
                      <option value="">-- Choose created eCheck ID --</option>
                      {generatedEChecksList.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <input
                    type="text"
                    value={echeckId}
                    onChange={(e) => setEcheckId(e.target.value)}
                    placeholder="e.g. 102088863639971869833376"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              )}

              {echeckAction === 'refundDetail' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">ECheck ID *</label>
                    {generatedEChecksList.length > 0 ? (
                      <select
                        value={echeckId}
                        onChange={(e) => setEcheckId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                      >
                        <option value="">-- Choose created eCheck ID --</option>
                        {generatedEChecksList.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.label}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    <input
                      type="text"
                      value={echeckId}
                      onChange={(e) => setEcheckId(e.target.value)}
                      placeholder="e.g. 10208886"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Refund ID *</label>
                    <input
                      type="text"
                      value={echeckRefundId}
                      onChange={(e) => setEcheckRefundId(e.target.value)}
                      placeholder="e.g. 102088892"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#30363D]">
                <div className="text-[11px] font-mono text-[#3FB950]">
                  {echeckAction === 'create' && 'POST https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks'}
                  {echeckAction === 'detail' && 'GET https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks/:id'}
                  {echeckAction === 'refund' && 'POST https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks/:id/refunds'}
                  {echeckAction === 'void' && 'POST https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks/:id/voids'}
                  {echeckAction === 'refundDetail' && 'GET https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks/:id/refunds/:refund_id'}
                </div>
                <button
                  id="run-echeck-action-btn"
                  onClick={handleRunEChecks}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors border border-[rgba(240,246,252,0.1)]"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{echeckAction === 'create' ? 'Send: Create ECheck' : 'Execute ECheck Request'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Subtab 3: Customers */}
          {activeSubTab === 'customers' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">Action</label>
                  <select
                    value={customerAction}
                    onChange={(e) => setCustomerAction(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  >
                    <option value="create">POST Create Customer</option>
                    <option value="query">GET Query Customers</option>
                  </select>
                </div>
              </div>

              {customerAction === 'create' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Display Name *</label>
                    <input
                      type="text"
                      value={customerDisplayName}
                      onChange={(e) => setCustomerDisplayName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Company Name</label>
                    <input
                      type="text"
                      value={customerCompanyName}
                      onChange={(e) => setCustomerCompanyName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">SQL Query</label>
                  <input
                    type="text"
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#30363D]">
                <div className="text-[11px] font-mono text-[#79C0FF]">
                  POST https://sandbox-quickbooks.api.intuit.com/v3/company/:realm/customer
                </div>
                <button
                  id="run-customer-action-btn"
                  onClick={handleRunCustomerAction}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors border border-[rgba(240,246,252,0.1)]"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{customerAction === 'create' ? 'Send: Create Customer' : 'Execute Customer Query'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Subtab 4: Invoices */}
          {activeSubTab === 'invoices' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Select Customer *</label>
                  {qboCustomers.length > 0 ? (
                    <select
                      value={invoiceCustomerId}
                      onChange={(e) => setInvoiceCustomerId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    >
                      {qboCustomers.map(c => (
                        <option key={c.id} value={c.id}>
                          [{c.id}] {c.name} {c.email ? `(${c.email})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={invoiceCustomerId}
                      onChange={(e) => setInvoiceCustomerId(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Invoice Amount (USD) *</label>
                  <input
                    type="text"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Invoice #</label>
                  <input
                    type="text"
                    value={invoiceDocNumber}
                    onChange={(e) => setInvoiceDocNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Line Item Description</label>
                <input
                  type="text"
                  value={invoiceDescription}
                  onChange={(e) => setInvoiceDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#30363D]">
                <div className="text-[11px] font-mono text-[#79C0FF]">
                  POST https://sandbox-quickbooks.api.intuit.com/v3/company/:realm/invoice
                </div>
                <button
                  id="run-invoice-action-btn"
                  onClick={handleRunInvoiceAction}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors border border-[rgba(240,246,252,0.1)]"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Send: Create Invoice in QBO</span>
                </button>
              </div>
            </div>
          )}

          {/* Subtab 5: Payments */}
          {activeSubTab === 'payments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Payment Method / Source Type</label>
                  <select
                    value={chargeSourceType}
                    onChange={(e) => setChargeSourceType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  >
                    <option value="card">Explicit Card Details (Inline Processing)</option>
                    <option value="token">Opaque Token Value (Token Vault)</option>
                    <option value="cardOnFile">Card ID On File (Customer Vault)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Amount ($) *</label>
                  <input
                    type="text"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Currency</label>
                  <input
                    type="text"
                    value={chargeCurrency}
                    onChange={(e) => setChargeCurrency(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              </div>

              {chargeSourceType === 'card' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#010409] p-3 rounded-lg border border-[#30363D]">
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Card Number *</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4111222233334444"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Exp Month (MM) *</label>
                    <input
                      type="text"
                      value={cardExpMonth}
                      onChange={(e) => setCardExpMonth(e.target.value)}
                      placeholder="12"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Exp Year (YYYY) *</label>
                    <input
                      type="text"
                      value={cardExpYear}
                      onChange={(e) => setCardExpYear(e.target.value)}
                      placeholder="2028"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">CVC *</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                </div>
              )}

              {chargeSourceType === 'token' && (
                <div className="space-y-2 bg-[#010409] p-3 rounded-lg border border-[#30363D]">
                  <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Select / Enter Token Value *</label>
                  {generatedTokensList.length > 0 ? (
                    <select
                      value={chargeTokenValue}
                      onChange={(e) => setChargeTokenValue(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    >
                      <option value="">-- Choose generated token --</option>
                      {generatedTokensList.map((t, idx) => (
                        <option key={idx} value={t.value}>
                          [{t.type}] {t.value}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <input
                    type="text"
                    value={chargeTokenValue}
                    onChange={(e) => setChargeTokenValue(e.target.value)}
                    placeholder="e.g. token_value_here"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                  />
                </div>
              )}

              {chargeSourceType === 'cardOnFile' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#010409] p-3 rounded-lg border border-[#30363D]">
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Customer ID *</label>
                    {qboCustomers.length > 0 ? (
                      <select
                        value={bankCustomerId}
                        onChange={(e) => setBankCustomerId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                      >
                        {qboCustomers.map(c => (
                          <option key={c.id} value={c.id}>
                            [{c.id}] {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={bankCustomerId}
                        onChange={(e) => setBankCustomerId(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Card ID On File *</label>
                    {generatedCardsList.length > 0 ? (
                      <select
                        value={chargeCardOnFileId}
                        onChange={(e) => setChargeCardOnFileId(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                      >
                        <option value="">-- Choose card on file --</option>
                        {generatedCardsList.map(c => (
                          <option key={c.id} value={c.id}>
                            [{c.id}] {c.name} (exp {c.expMonth}/{c.expYear})
                          </option>
                        ))}
                      </select>
                    ) : null}
                    <input
                      type="text"
                      value={chargeCardOnFileId}
                      onChange={(e) => setChargeCardOnFileId(e.target.value)}
                      placeholder="e.g. 101101015602106732027893"
                      className="w-full px-3 py-1.5 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Description</label>
                <input
                  type="text"
                  value={chargeDescription}
                  onChange={(e) => setChargeDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#30363D]">
                <div className="text-[11px] font-mono text-[#79C0FF]">
                  POST https://sandbox.api.intuit.com/quickbooks/v4/payments/charges
                </div>
                <button
                  id="run-charge-action-btn"
                  onClick={handleRunCreateCharge}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors border border-[rgba(240,246,252,0.1)]"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Send: Process Test Charge</span>
                </button>
              </div>
            </div>
          )}

          {/* Subtab 6: OpenID */}
          {activeSubTab === 'openid' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-white">OpenID User Claims Profile</h4>
                <p className="text-xs text-[#8B949E]">Retrieves verified user identity claims from Intuit OAuth server</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#30363D]">
                <div className="text-[11px] font-mono text-[#79C0FF]">
                  GET https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo
                </div>
                <button
                  id="run-userinfo-btn"
                  onClick={handleRunUserInfo}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors border border-[rgba(240,246,252,0.1)]"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Execute GET User Info</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Execution Error: </span>
              {error}
            </div>
          </div>
        )}

        {/* Response Box */}
        {apiResult && (
          <div className="bg-[#0d1117] rounded-xl border border-[#30363D] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#3FB950]" />
                <h4 className="text-xs font-semibold text-white">Live QuickBooks API Response</h4>
                {httpStatus && (
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                    httpStatus >= 200 && httpStatus < 300
                      ? 'bg-[#238636]/15 text-[#3FB950] border-[#238636]/30'
                      : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                  }`}>
                    HTTP {httpStatus}
                  </span>
                )}
              </div>
              <button
                onClick={handleCopyJson}
                className="flex items-center space-x-1 px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] text-white text-xs rounded border border-[#30363D]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#3FB950]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy JSON</span>
              </button>
            </div>

            <pre className="p-3.5 bg-[#010409] border border-[#30363D] rounded-lg font-mono text-xs text-[#C9D1D9] overflow-x-auto max-h-96">
              {JSON.stringify(apiResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
