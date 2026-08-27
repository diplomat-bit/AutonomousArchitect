import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Users,
  Building2,
  DollarSign,
  ArrowRight,
  Sparkles,
  FileText,
  Clock,
  Send,
  Database,
  Search,
  Code2,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { apiFetch } from '../utils/apiClient';

interface FinicityConfig {
  baseUrl: string;
  appKey: string;
  partnerId: string;
  partnerSecret: string;
  appToken: string;
  tokenExpiresAt: number | null;
  customerId: string;
  customerUsername: string;
  connectUrl: string;
  environment: string;
}

interface FinicityAccount {
  id: string;
  number: string;
  realAccountNumberLast4: string;
  accountNumberDisplay: string;
  name: string;
  balance: number;
  type: string;
  aggregationStatusCode: number;
  status: string;
  customerId: string;
  institutionId: string;
  balanceDate?: number;
  currency: string;
  institutionLoginId?: number;
  detail?: any;
  accountNickname?: string;
  marketSegment?: string;
}

interface FinicityTransaction {
  id: number;
  amount: number;
  accountId: number | string;
  customerId: number | string;
  status: string;
  description: string;
  memo?: string;
  postedDate: number;
  transactionDate: number;
  createdDate: number;
  categorization?: {
    normalizedPayeeName?: string;
    category?: string;
    bestRepresentation?: string;
    country?: string;
  };
}

interface FinicityConsoleProps {
  onSendToAiIngest?: (jsonString: string) => void;
}

export const FinicityConsole: React.FC<FinicityConsoleProps> = ({ onSendToAiIngest }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  // Configuration State
  const [config, setConfig] = useState<FinicityConfig>({
    baseUrl: 'https://api.finicity.com',
    appKey: '',
    partnerId: '',
    partnerSecret: '',
    appToken: '',
    tokenExpiresAt: null,
    customerId: '1005061234',
    customerUsername: 'customerusername1',
    connectUrl: '',
    environment: 'sandbox',
  });

  const [accounts, setAccounts] = useState<FinicityAccount[]>([]);
  const [transactions, setTransactions] = useState<FinicityTransaction[]>([]);
  const [lastResponse, setLastResponse] = useState<any | null>(null);
  const [snippets, setSnippets] = useState<any | null>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'fetch' | 'curl' | 'env'>('curl');

  // Transactions query state
  const [txLimit, setTxLimit] = useState('25');
  const [txSort, setTxSort] = useState('desc');
  const [txIncludePending, setTxIncludePending] = useState(true);
  const [txSearchFilter, setTxSearchFilter] = useState('');

  // Load existing config on mount
  useEffect(() => {
    loadFinicityConfig();
    loadSnippets();
  }, []);

  const loadFinicityConfig = async () => {
    try {
      const res = await apiFetch<any>('/api/finicity/config');
      const data = res.data;
      if (res.ok && data?.config) {
        setConfig(prev => ({
          ...prev,
          ...data.config,
          baseUrl: 'https://api.finicity.com', // Preprogrammed
        }));
      }
    } catch {
      // ignore
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await apiFetch<any>('/api/finicity/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: 'https://api.finicity.com',
          partnerId: config.partnerId,
          partnerSecret: config.partnerSecret,
          appKey: config.appKey,
          customerId: config.customerId,
        }),
      });
      if (res.ok) {
        setSuccessMessage('Saved credentials to backend server runtime!');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleApplySandboxPresets = () => {
    setConfig(prev => ({
      ...prev,
      baseUrl: 'https://api.finicity.com',
      partnerId: '2423653942467',
      partnerSecret: 'demo_partner_secret_mastercard',
      appKey: '2423653942467',
      customerId: '1005061234',
      customerUsername: 'customerusername1',
    }));
    setSuccessMessage('Applied sandbox preset credentials! Click "Run Complete Open Finance Flow" to synchronize.');
  };

  const loadSnippets = async () => {
    try {
      const res = await apiFetch<any>('/api/finicity/snippets');
      const data = res.data;
      if (res.ok && data?.snippets) {
        setSnippets(data.snippets);
      }
    } catch {
      // ignore
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // Step 1: Create Access Token
  const handleCreateToken = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await apiFetch<any>('/api/finicity/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appKey: config.appKey || undefined,
          partnerId: config.partnerId || undefined,
          partnerSecret: config.partnerSecret || undefined,
        }),
      });

      const data = res.data;
      setLastResponse(data || res);
      if (res.ok && data?.token) {
        setConfig(prev => ({
          ...prev,
          appToken: data.token,
          tokenExpiresAt: data.tokenExpiresAt || Date.now() + 7200000,
        }));
        setSuccessMessage(`Access token created successfully! Valid for 2 hours (Refresh recommended after 90m).`);
        loadSnippets();
      } else {
        setError(res.error || data?.message || 'Failed to obtain access token.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Add Test Customer
  const handleAddTestCustomer = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await apiFetch<any>('/api/finicity/customers/testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appKey: config.appKey,
          appToken: config.appToken,
          username: config.customerUsername,
        }),
      });

      const data = res.data;
      setLastResponse(data || res);
      if (res.ok && data?.customerId) {
        setConfig(prev => ({
          ...prev,
          customerId: data.customerId,
          customerUsername: data.customer?.username || prev.customerUsername,
        }));
        setSuccessMessage(`Test customer created! Customer ID: ${data.customerId}`);
        loadSnippets();
      } else {
        setError(res.error || data?.message || 'Failed to create test customer.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Generate Connect URL
  const handleGenerateConnectUrl = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await apiFetch<any>('/api/finicity/connect/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appKey: config.appKey,
          appToken: config.appToken,
          partnerId: config.partnerId,
          customerId: config.customerId,
        }),
      });

      const data = res.data;
      setLastResponse(data || res);
      if (res.ok && data?.link) {
        setConfig(prev => ({
          ...prev,
          connectUrl: data.link,
        }));
        setSuccessMessage(`Mastercard Data Connect URL generated successfully!`);
        loadSnippets();
      } else {
        setError(res.error || data?.message || 'Failed to generate Data Connect URL.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Refresh Accounts
  const handleRefreshAccounts = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await apiFetch<any>(`/api/finicity/customers/${config.customerId}/accounts/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appKey: config.appKey,
          appToken: config.appToken,
          customerId: config.customerId,
        }),
      });

      const data = res.data;
      setLastResponse(data || res);
      if (res.ok && data?.accounts && Array.isArray(data.accounts)) {
        setAccounts(data.accounts);
        setSuccessMessage(`Successfully refreshed and aggregated ${data.accounts.length} customer accounts!`);
      } else {
        setError(res.error || data?.message || 'Failed to refresh accounts.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Transactions
  const handleFetchTransactions = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const queryParams = new URLSearchParams({
        limit: txLimit,
        sort: txSort,
        includePending: String(txIncludePending),
        appKey: config.appKey,
        appToken: config.appToken,
      });

      const res = await apiFetch<any>(`/api/finicity/customers/${config.customerId}/transactions?${queryParams.toString()}`);
      const data = res.data;
      setLastResponse(data || res);
      if (res.ok && data?.transactions && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
        setSuccessMessage(`Retrieved ${data.transactions.length} customer transactions!`);
      } else {
        setError(res.error || data?.message || 'Failed to fetch transactions.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto Run Complete 5-Step Demo Flow via master server endpoint
  const handleAutoRunDemo = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage('Executing Mastercard Open Finance 1-click automated synchronization...');
    try {
      const res = await apiFetch<any>('/api/finicity/execute-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appKey: config.appKey || '2423653942467',
          partnerId: config.partnerId || '2423653942467',
          partnerSecret: config.partnerSecret || '',
          customerId: config.customerId || '1005061234',
        }),
      });

      const data = res.data;
      setLastResponse(data || res);

      if (res.ok && data) {
        if (data.appToken) {
          setConfig(prev => ({
            ...prev,
            appToken: data.appToken,
            connectUrl: data.connectUrl || prev.connectUrl,
            customerId: data.customerId || prev.customerId,
          }));
        }

        if (Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
        }

        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }

        setSuccessMessage(`🎉 All 5 Open Finance stages synchronized! Loaded ${data.accounts?.length || 0} accounts & ${data.transactions?.length || 0} transactions.`);
        loadSnippets();
        setActiveStep(5);
      } else {
        setError(res.error || data?.message || 'Failed to execute automated flow.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [importingQbo, setImportingQbo] = useState(false);
  const [qboImportResult, setQboImportResult] = useState<any>(null);

  const handleDirectQboImport = async (targetType: 'JournalEntry' | 'Account' = 'JournalEntry') => {
    const payload = targetType === 'Account' ? accounts : transactions;
    if (!payload || payload.length === 0) {
      setError(`No ${targetType === 'Account' ? 'accounts' : 'transactions'} available to import. Please fetch data first.`);
      return;
    }

    setImportingQbo(true);
    setError(null);
    setSuccessMessage(`Importing ${payload.length} ${targetType === 'Account' ? 'accounts' : 'transactions'} directly into QuickBooks Online...`);

    try {
      const res = await apiFetch<any>('/api/bridge/import-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: payload,
          source: 'MASTERCARD_OPEN_FINANCE',
          targetType,
        }),
      });

      const data = res.data;
      setLastResponse(data || res);

      if (res.ok && data?.success) {
        setQboImportResult(data);
        setSuccessMessage(`✓ Successfully imported & locked ${data.totalImported} items into QuickBooks Online (Realm: ${data.realmId}) as ${targetType}s!`);
      } else {
        setError(res.error || data?.error || 'QuickBooks import encountered an issue.');
      }
    } catch (err: any) {
      setError(`Import failed: ${err.message}`);
    } finally {
      setImportingQbo(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (!txSearchFilter) return true;
    const query = txSearchFilter.toLowerCase();
    return (
      t.description.toLowerCase().includes(query) ||
      (t.memo && t.memo.toLowerCase().includes(query)) ||
      (t.categorization?.category && t.categorization.category.toLowerCase().includes(query)) ||
      (t.categorization?.normalizedPayeeName && t.categorization.normalizedPayeeName.toLowerCase().includes(query)) ||
      String(t.amount).includes(query)
    );
  });

  const totalBalance = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-red-500/20 text-red-400 font-mono text-xs px-2.5 py-1 rounded-md border border-red-500/30 flex items-center gap-1.5 font-semibold">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Mastercard Open Finance
              </span>
              <span className="bg-amber-500/20 text-amber-300 font-mono text-xs px-2.5 py-1 rounded-md border border-amber-500/30 font-semibold">
                Finicity v2/v3 Aggregation
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 font-mono text-xs px-2.5 py-1 rounded-md border border-indigo-500/30">
                api.finicity.com
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Mastercard Open Finance & Finicity Gateway
            </h1>
            <p className="text-slate-400 text-sm max-w-3xl">
              End-to-end partner authentication, test customer provisioning, Mastercard Data Connect launcher, FinBank profiles simulation, account aggregation, and real-time transaction ingestion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAutoRunDemo}
              disabled={loading}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Run 5-Step Demo</span>
            </button>
            <button
              onClick={loadFinicityConfig}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all text-xs flex items-center gap-1"
              title="Refresh config"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Token & Status strip */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/60">
            <div className="text-slate-500 mb-1 flex items-center justify-between">
              <span>App Token Status</span>
              {config.appToken ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> NOT GENERATED
                </span>
              )}
            </div>
            <div className="text-slate-300 truncate font-semibold">
              {config.appToken ? `${config.appToken.slice(0, 10)}...${config.appToken.slice(-6)}` : 'Run Step 1 to generate'}
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/60">
            <div className="text-slate-500 mb-1">Customer ID</div>
            <div className="text-slate-200 font-semibold truncate">{config.customerId || 'None'}</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/60">
            <div className="text-slate-500 mb-1">Aggregated Accounts</div>
            <div className="text-indigo-300 font-semibold">{accounts.length} Accounts (${totalBalance.toLocaleString()})</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/60">
            <div className="text-slate-500 mb-1">Loaded Transactions</div>
            <div className="text-emerald-400 font-semibold">{transactions.length} Records</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">✕</button>
        </div>
      )}

      {/* 4-CREDENTIAL MASTER DECK */}
      <div className="bg-slate-900/90 border-2 border-indigo-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 font-mono text-xs px-2.5 py-0.5 rounded border border-indigo-500/30 font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Master Configuration
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Base URL Preprogrammed: https://api.finicity.com
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              4-Field Gateway Credentials — Zero Manual Overhead
            </h2>
            <p className="text-slate-400 text-xs">
              Base URL, token caching, Connect webviews, aggregation headers, and transaction decoders are preprogrammed on the server. Only 4 keys required:
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleApplySandboxPresets}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Sandbox Presets</span>
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Save to Server</span>
            </button>
            <button
              onClick={handleAutoRunDemo}
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Executing...' : 'Run 1-Click Open Finance Flow'}</span>
            </button>
          </div>
        </div>

        {/* 4 Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {/* 1. Partner ID */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5 focus-within:border-indigo-500 transition-all">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-sans font-bold flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] flex items-center justify-center font-bold">1</span>
                Partner ID
              </label>
              <span className="text-[10px] text-slate-500 font-sans">partnerId</span>
            </div>
            <input
              type="text"
              value={config.partnerId}
              onChange={e => setConfig({ ...config, partnerId: e.target.value })}
              placeholder="e.g. 2423653942467"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-hidden focus:border-indigo-500 text-xs"
            />
          </div>

          {/* 2. Partner Secret */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5 focus-within:border-indigo-500 transition-all">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-sans font-bold flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] flex items-center justify-center font-bold">2</span>
                Partner Secret
              </label>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="text-[10px] text-slate-400 hover:text-slate-200 font-sans"
              >
                {showSecret ? 'Hide' : 'Reveal'}
              </button>
            </div>
            <input
              type={showSecret ? 'text' : 'password'}
              value={config.partnerSecret}
              onChange={e => setConfig({ ...config, partnerSecret: e.target.value })}
              placeholder="Enter Partner Secret"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-hidden focus:border-amber-500 text-xs"
            />
          </div>

          {/* 3. App Key */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5 focus-within:border-indigo-500 transition-all">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-sans font-bold flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] flex items-center justify-center font-bold">3</span>
                Finicity App Key
              </label>
              <span className="text-[10px] text-slate-500 font-sans">Finicity-App-Key</span>
            </div>
            <input
              type="text"
              value={config.appKey}
              onChange={e => setConfig({ ...config, appKey: e.target.value })}
              placeholder="e.g. 2423653942467"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-hidden focus:border-red-500 text-xs"
            />
          </div>

          {/* 4. Customer ID */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5 focus-within:border-indigo-500 transition-all">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-sans font-bold flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">4</span>
                Customer ID
              </label>
              <span className="text-[10px] text-slate-500 font-sans">customerId</span>
            </div>
            <input
              type="text"
              value={config.customerId}
              onChange={e => setConfig({ ...config, customerId: e.target.value })}
              placeholder="e.g. 1005061234"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-hidden focus:border-emerald-500 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Step Navigation Pill Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { step: 1, title: '1. Partner Auth', desc: 'Create Access Token', icon: Key },
          { step: 2, title: '2. Test Customer', desc: 'Add Testing Customer', icon: Users },
          { step: 3, title: '3. Data Connect', desc: 'Generate Connect URL', icon: ExternalLink },
          { step: 4, title: '4. FinBank Guide', desc: 'Sign-In Simulator', icon: Building2 },
          { step: 5, title: '5. Accounts & Aggregation', desc: 'Refresh & View Balances', icon: DollarSign },
          { step: 6, title: '6. Transactions Ledger', desc: 'Fetch & Categorize', icon: FileText },
          { step: 7, title: 'Code & .env', desc: 'Snippets & Exporter', icon: Code2 },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeStep === item.step;
          return (
            <button
              key={item.step}
              onClick={() => setActiveStep(item.step)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-red-600 text-white border-red-500 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form / Action Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: CREATE ACCESS TOKEN */}
          {activeStep === 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-400" /> Step 1: Create Access Token
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300">POST /aggregation/v2/partners/authentication</code>
                  </p>
                </div>
                <span className="text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-1 rounded">
                  2 Hour Token TTL
                </span>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Clock className="w-4 h-4 text-amber-400" /> Best Practice Advisory:
                </div>
                <div>
                  Access tokens are valid for 2 hours. Generate a new token when current token is older than 90 minutes to avoid expiration during API calls.
                </div>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-slate-300 block mb-1 font-sans font-semibold">Finicity-App-Key (Header):</label>
                  <input
                    type="text"
                    value={config.appKey}
                    onChange={e => setConfig({ ...config, appKey: e.target.value })}
                    placeholder="Enter Finicity App Key (e.g., 2423653942467)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-sans font-semibold">Partner ID (JSON Body):</label>
                  <input
                    type="text"
                    value={config.partnerId}
                    onChange={e => setConfig({ ...config, partnerId: e.target.value })}
                    placeholder="Enter Partner ID (e.g., 2423653942467)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-sans font-semibold">Partner Secret (JSON Body):</label>
                  <input
                    type="password"
                    value={config.partnerSecret}
                    onChange={e => setConfig({ ...config, partnerSecret: e.target.value })}
                    placeholder="Enter Partner Secret"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleCreateToken}
                  disabled={loading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Create Token</span>
                </button>

                {config.appToken && (
                  <button
                    onClick={() => copyToClipboard(config.appToken, 'token')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 flex items-center gap-1.5"
                  >
                    {copied === 'token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Token</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: ADD TEST CUSTOMER */}
          {activeStep === 2 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" /> Step 2: Add Testing Customer
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300">POST /aggregation/v2/customers/testing</code>
                  </p>
                </div>
                <span className="text-[11px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded">
                  FinBank Compatible
                </span>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed">
                Create a testing customer record you can use with FinBank test profiles. You can omit the applicationId from the request when generating testing customers.
              </p>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-sans font-semibold">Customer Username:</label>
                    <button
                      onClick={() => setConfig({ ...config, customerUsername: `testuser_${Date.now().toString(36)}` })}
                      className="text-indigo-400 hover:text-indigo-300 text-[11px] font-sans flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={config.customerUsername}
                    onChange={e => setConfig({ ...config, customerUsername: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-sans font-semibold">Active Finicity-App-Token:</label>
                  <input
                    type="text"
                    value={config.appToken}
                    readOnly
                    placeholder="Auto-populated from Step 1"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleAddTestCustomer}
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Create Test Customer</span>
                </button>

                {config.customerId && (
                  <div className="text-xs text-slate-300 font-mono bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
                    <span className="text-slate-500">ID:</span>
                    <span className="text-emerald-400 font-bold">{config.customerId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: GENERATE DATA CONNECT URL */}
          {activeStep === 3 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-emerald-400" /> Step 3: Generate Mastercard Data Connect URL
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-300">POST /connect/v2/generate</code>
                  </p>
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed">
                Generate a Data Connect URL which you can present to the customer in your application. This enables the customer to start a Data Connect session and grant Mastercard Open Finance access to their financial data.
              </p>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-slate-300 block mb-1 font-sans font-semibold">Partner ID:</label>
                  <input
                    type="text"
                    value={config.partnerId}
                    onChange={e => setConfig({ ...config, partnerId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-sans font-semibold">Customer ID:</label>
                  <input
                    type="text"
                    value={config.customerId}
                    onChange={e => setConfig({ ...config, customerId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleGenerateConnectUrl}
                  disabled={loading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Generate Connect Link</span>
                </button>

                {config.connectUrl && (
                  <a
                    href={config.connectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2"
                  >
                    <span>Launch Data Connect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {config.connectUrl && (
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-slate-400 text-xs flex items-center justify-between">
                    <span>Generated URL:</span>
                    <button
                      onClick={() => copyToClipboard(config.connectUrl, 'connectUrl')}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                    >
                      {copied === 'connectUrl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy Link
                    </button>
                  </div>
                  <div className="text-emerald-300 text-xs font-mono break-all bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                    {config.connectUrl}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: FINBANK TEST SIGN-IN GUIDE */}
          {activeStep === 4 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" /> Step 4: FinBank Test Sign-In Simulation
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">Interactive guide to link mock bank accounts</p>
                </div>
                <span className="text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-1 rounded">
                  Mock Bank Flow
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-white font-bold text-sm">FinBank Profiles - A (Test Credentials)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-slate-500 text-[11px]">Username</div>
                      <div className="text-amber-300 font-bold text-sm">profile_03</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="text-slate-500 text-[11px]">Password</div>
                      <div className="text-amber-300 font-bold text-sm">profile_03</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold shrink-0">1</div>
                    <div className="text-slate-300 leading-relaxed">
                      Open the Connect URL generated in Step 3 in a browser window or click Launch Data Connect.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold shrink-0">2</div>
                    <div className="text-slate-300 leading-relaxed">
                      Click <strong className="text-white">Next</strong> to agree to the Terms & Conditions and the Privacy Policy.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold shrink-0">3</div>
                    <div className="text-slate-300 leading-relaxed">
                      Search for <strong className="text-amber-300">FinBank Profiles - A</strong> in the search bar.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold shrink-0">4</div>
                    <div className="text-slate-300 leading-relaxed">
                      Type <strong className="text-amber-300">profile_03</strong> for both username and password.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold shrink-0">5</div>
                    <div className="text-slate-300 leading-relaxed">
                      Select all accounts (Checking, Savings, 401k, ROTH), then click <strong className="text-white">Save and Submit</strong>.
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveStep(5)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl flex items-center gap-1.5"
                  >
                    <span>Proceed to Step 5: Refresh Accounts</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REFRESH ACCOUNTS & AGGREGATION */}
          {activeStep === 5 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" /> Step 5: Refresh Customer Accounts
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-300">POST /aggregation/v1/customers/{config.customerId}/accounts</code>
                  </p>
                </div>
                <button
                  onClick={handleRefreshAccounts}
                  disabled={loading}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Accounts</span>
                </button>
              </div>

              {accounts.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
                  <DollarSign className="w-10 h-10 text-slate-600 mx-auto" />
                  <div className="text-slate-300 text-sm font-semibold">No accounts aggregated yet</div>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto">
                    Click Refresh Accounts to trigger an aggregation for customer <span className="font-mono text-slate-400">{config.customerId}</span>.
                  </p>
                  <button
                    onClick={handleRefreshAccounts}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
                  >
                    Refresh Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{accounts.length} Aggregated Financial Accounts</span>
                    <span className="font-mono text-emerald-400 font-bold">Total: ${totalBalance.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {accounts.map(acct => (
                      <div
                        key={acct.id}
                        className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-xl space-y-2.5 transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">{acct.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase font-semibold">
                            {acct.type}
                          </span>
                        </div>

                        <div className="text-xl font-bold text-emerald-400 font-mono">
                          ${(acct.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                          <div>Acct: •••• {acct.realAccountNumberLast4 || acct.accountNumberDisplay}</div>
                          <div className="text-right">ID: {acct.id}</div>
                          <div>Status: <span className="text-emerald-400">{acct.status}</span></div>
                          <div className="text-right">Inst: {acct.institutionId}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => handleDirectQboImport('Account')}
                      disabled={importingQbo}
                      className="flex-1 w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Database className="w-4 h-4" />
                      <span>{importingQbo ? 'Importing Accounts...' : '⚡ 1-Click Direct Import Accounts to QuickBooks'}</span>
                    </button>

                    {onSendToAiIngest && (
                      <button
                        onClick={() => onSendToAiIngest(JSON.stringify(accounts, null, 2))}
                        className="flex-1 w-full py-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>Send to AI Ingest Console</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: TRANSACTIONS LEDGER */}
          {activeStep === 6 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" /> Fetch Customer Transactions
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    <code className="bg-slate-950 px-1.5 py-0.5 rounded text-purple-300">GET /aggregation/v3/customers/{config.customerId}/transactions</code>
                  </p>
                </div>

                <button
                  onClick={handleFetchTransactions}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Fetch Transactions</span>
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={txSearchFilter}
                    onChange={e => setTxSearchFilter(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Limit:</span>
                  <select
                    value={txLimit}
                    onChange={e => setTxLimit(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200 flex-1"
                  >
                    <option value="10">10 records</option>
                    <option value="25">25 records</option>
                    <option value="50">50 records</option>
                    <option value="100">100 records</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={txIncludePending}
                      onChange={e => setTxIncludePending(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-purple-600"
                    />
                    <span>Include Pending</span>
                  </label>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                  <div className="text-slate-300 text-sm font-semibold">No transactions retrieved yet</div>
                  <button
                    onClick={handleFetchTransactions}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl"
                  >
                    Fetch Transactions
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-400">
                    <span>Showing {filteredTransactions.length} of {transactions.length} transactions</span>
                    <button
                      onClick={() => handleDirectQboImport('JournalEntry')}
                      disabled={importingQbo}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow flex items-center gap-1.5 transition-all text-xs cursor-pointer self-start sm:self-auto"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{importingQbo ? 'Importing...' : '⚡ Import All 25 to QuickBooks (Journal Entries)'}</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">Description</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Date</th>
                          <th className="p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                        {filteredTransactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-800/40">
                            <td className="p-3">
                              <div className="font-semibold text-slate-200">{tx.description}</div>
                              {tx.memo && <div className="text-[11px] text-slate-500 font-sans">{tx.memo}</div>}
                            </td>
                            <td className="p-3">
                              <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-purple-300 font-sans">
                                {tx.categorization?.category || 'General'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-400">
                              {new Date(tx.postedDate * 1000).toLocaleDateString()}
                            </td>
                            <td className={`p-3 text-right font-bold ${tx.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => handleDirectQboImport('JournalEntry')}
                      disabled={importingQbo}
                      className="flex-1 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>{importingQbo ? 'Locking into QuickBooks Ledger...' : `⚡ 1-Click Direct Import All (${filteredTransactions.length}) Transactions into QuickBooks`}</span>
                    </button>

                    {onSendToAiIngest && (
                      <button
                        onClick={() => onSendToAiIngest(JSON.stringify(transactions, null, 2))}
                        className="w-full sm:w-auto px-5 py-3 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
                      >
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span>Send to AI Ingest Console</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: CODE & ENV EXPORT */}
          {activeStep === 7 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-400" /> Code Snippets & Environment Exporter
                </h2>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  <button
                    onClick={() => setActiveSnippetTab('curl')}
                    className={`px-3 py-1 rounded-lg ${activeSnippetTab === 'curl' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setActiveSnippetTab('fetch')}
                    className={`px-3 py-1 rounded-lg ${activeSnippetTab === 'fetch' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    ES6 fetch
                  </button>
                  <button
                    onClick={() => setActiveSnippetTab('env')}
                    className={`px-3 py-1 rounded-lg ${activeSnippetTab === 'env' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    .env
                  </button>
                </div>
              </div>

              {activeSnippetTab === 'curl' && snippets && (
                <div className="space-y-4">
                  {Object.entries(snippets).map(([key, item]: [string, any]) => (
                    <div key={key} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        <button
                          onClick={() => copyToClipboard(item.curl, key)}
                          className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
                        >
                          {copied === key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy cURL</span>
                        </button>
                      </div>
                      <pre className="text-[11px] font-mono text-purple-300 overflow-x-auto p-2 bg-slate-900/60 rounded-lg">
                        {item.curl}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {activeSnippetTab === 'fetch' && snippets && (
                <div className="space-y-4">
                  {Object.entries(snippets).map(([key, item]: [string, any]) => (
                    <div key={key} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        <button
                          onClick={() => copyToClipboard(item.fetch, key)}
                          className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
                        >
                          {copied === key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy fetch</span>
                        </button>
                      </div>
                      <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto p-2 bg-slate-900/60 rounded-lg">
                        {item.fetch}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {activeSnippetTab === 'env' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Mastercard Finicity .env Block</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `FINICITY_API_BASE_URL="${config.baseUrl}"\nFINICITY_APP_KEY="${config.appKey}"\nFINICITY_PARTNER_ID="${config.partnerId}"\nFINICITY_PARTNER_SECRET="${config.partnerSecret}"\nFINICITY_APP_TOKEN="${config.appToken}"\nFINICITY_CUSTOMER_ID="${config.customerId}"\nFINICITY_CUSTOMER_USERNAME="${config.customerUsername}"\nFINICITY_ENVIRONMENT="${config.environment}"`,
                          'envBlock'
                        )
                      }
                      className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
                    >
                      {copied === 'envBlock' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy .env Block</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto p-3 bg-slate-900/60 rounded-lg">
{`FINICITY_API_BASE_URL="${config.baseUrl}"
FINICITY_APP_KEY="${config.appKey}"
FINICITY_PARTNER_ID="${config.partnerId}"
FINICITY_PARTNER_SECRET="${config.partnerSecret ? '********' : ''}"
FINICITY_APP_TOKEN="${config.appToken}"
FINICITY_CUSTOMER_ID="${config.customerId}"
FINICITY_CUSTOMER_USERNAME="${config.customerUsername}"
FINICITY_ENVIRONMENT="${config.environment}"`}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Inspector Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" /> Live Response Inspector
              </h3>
              {lastResponse && (
                <button
                  onClick={() => copyToClipboard(JSON.stringify(lastResponse, null, 2), 'lastResponse')}
                  className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 font-mono"
                >
                  {copied === 'lastResponse' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy JSON</span>
                </button>
              )}
            </div>

            {lastResponse ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="bg-slate-950 px-2 py-1 rounded text-slate-300">
                    Status: <strong className={lastResponse.status >= 200 && lastResponse.status < 300 ? 'text-emerald-400' : 'text-amber-400'}>{lastResponse.status || 200}</strong>
                  </span>
                  {lastResponse.durationMs && (
                    <span className="text-slate-500">{lastResponse.durationMs}ms</span>
                  )}
                  {lastResponse.source && (
                    <span className="text-indigo-400">{lastResponse.source}</span>
                  )}
                </div>

                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[500px]">
                  {JSON.stringify(lastResponse, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs font-mono">
                Execute any step or Auto-Run to inspect raw upstream JSON payloads here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
