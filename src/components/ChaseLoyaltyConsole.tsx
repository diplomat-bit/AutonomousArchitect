import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Send,
  RefreshCw,
  Copy,
  Check,
  Code2,
  Terminal,
  Shield,
  Layers,
  FileCode,
  DollarSign,
  Gift,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Zap,
} from 'lucide-react';

export interface ChaseConfig {
  baseUrl: string;
  developerBaseUrl: string;
  playgroundIdToken: string;
  authorization: string;
  authorization2: string;
  traceId: string;
  channelType: string;
  accountReferenceUuid: string;
  externalTransactionIdentifier: string;
  externalAccountIdentifier: string;
  externalOrderNumber: string;
  orderDate: string;
  externalTransactionTypeCode: string;
  usdRewardsTransactionAmount: number;
  rewardsConversionRate: number;
  merchantCategoryCode: string;
  clientId: string;
  clientSecret: string;
}

export const ChaseLoyaltyConsole: React.FC = () => {
  const [config, setConfig] = useState<ChaseConfig>({
    baseUrl: 'https://apidemo.chase.com/mock/card/loyalty/redeem-rewards/transactions/v1/transactions/',
    developerBaseUrl: 'https://developer.chase.com',
    playgroundIdToken: '{copied-playground-token-id}',
    authorization: 'EB3ik8VN9sAV2YjUnZv5UUcAUzFg',
    authorization2:
      'Bearer eyJraWQiOiJrZXkwMSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJwd3B0ZXN0IiwiYXVkIjoiY2hhc2UiLCJpc3MiOiJQV1BURVNUIiwiZXhwIjoxNjE3MjM2OTkwLCJpYXQiOjE2MTcyMDA5OTAsImp0aSI6ImUzY2NmMGU2LWM5MmYtNDI2My04MGM2LTI0ODI1OTdiZmEzMiJ9.dUmOrjpXKAkra1opeuLVAV78MKGaI9kPe0VrH56NEdhseBedqiWB8cPQT6ujzTt2s2sREvdam9p85Vynvn10rYKbMdgShv0lEsYrbG3GcRcieYAW4DlgLZ6VlSbwiaw_DIbvLugOuVrcCR6MFj4qJmW3yz6NM5Us_sW4MJKdkbCuMreg5ciOj_32krJj7AwCBpllz7RFK5G_VjAlbBdoTgIIu0WoPYxhxr3D0BDQavhApQHCsEmti5Bh-okYUucx3YK_ZTPO_MTPwWY7T0_wRelgt6vOCyZPlzdAH_NDOADrk5dO7ajSH4tPL1z-wIuidGMAVWH5FTKPtSgxah1_FQ',
    traceId: '562952952929829',
    channelType: '',
    accountReferenceUuid: 'd383fd33-7be1-4ff8-88b7-f2adca419296',
    externalTransactionIdentifier: 'ETI202007020791',
    externalAccountIdentifier: 'XXXX.XXXX.aerra@jpmchase.com',
    externalOrderNumber: 'I202007020302',
    orderDate: '2021-02-11T22:25:50.52Z',
    externalTransactionTypeCode: '5070',
    usdRewardsTransactionAmount: 7.95,
    rewardsConversionRate: 80,
    merchantCategoryCode: '2020',
    clientId: 'SUNSHINE_WALLET',
    clientSecret: '',
  });

  const [envExport, setEnvExport] = useState<string>('');
  const [snippets, setSnippets] = useState<any>(null);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'es6' | 'es5' | 'curl-post' | 'curl-get' | 'env'>('es6');
  const [activeActionTab, setActiveActionTab] = useState<'redeem' | 'balance' | 'config'>('redeem');

  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const fetchChaseConfig = async () => {
    try {
      const res = await fetch('/api/chase/config');
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setEnvExport(data.envExport || '');
      }
    } catch (err) {
      console.warn('Failed to load Chase config:', err);
    }
  };

  const fetchSnippets = async () => {
    try {
      const res = await fetch('/api/chase/snippets');
      const data = await res.json();
      if (data.success && data.snippets) {
        setSnippets(data.snippets);
      }
    } catch (err) {
      console.warn('Failed to load Chase snippets:', err);
    }
  };

  useEffect(() => {
    fetchChaseConfig();
    fetchSnippets();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveConfig = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch('/api/chase/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setEnvExport(data.envExport || '');
        setSaveNotice('Chase configuration saved to active runtime memory!');
        fetchSnippets();
        setTimeout(() => setSaveNotice(null), 3000);
      }
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleExecuteRedeem = async () => {
    setExecuting(true);
    setExecutionResult(null);
    try {
      const res = await fetch('/api/chase/mock/card/loyalty/redeem-rewards/transactions/v1/transactions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'playground-id-token': config.playgroundIdToken,
          'authorization': config.authorization,
          'authorization2': config.authorization2,
          'trace-id': config.traceId,
          'channel-type': config.channelType,
          'account-reference-universal-unique-identifier': config.accountReferenceUuid,
          'external-transaction-identifier': config.externalTransactionIdentifier,
          'external-account-identifier': config.externalAccountIdentifier,
        },
        body: JSON.stringify({
          externalOrderNumber: config.externalOrderNumber,
          orderDate: config.orderDate,
          externalTransactionTypeCode: config.externalTransactionTypeCode,
          usdRewardsTransactionAmount: Number(config.usdRewardsTransactionAmount),
          rewardsConversionRate: Number(config.rewardsConversionRate),
          merchantCategoryCode: config.merchantCategoryCode,
        }),
      });

      const data = await res.json();
      setExecutionResult({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch (err: any) {
      setExecutionResult({
        status: 500,
        statusText: 'Network / Execution Error',
        error: err.message,
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleExecuteBalance = async () => {
    setExecuting(true);
    setExecutionResult(null);
    try {
      const res = await fetch(
        `/api/chase/merchants/users/${encodeURIComponent(config.accountReferenceUuid)}/rewards-balance`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'playground-id-token': config.playgroundIdToken,
            'authorization': config.authorization,
            'authorization2': config.authorization2,
            'trace-id': config.traceId,
            'external-account-identifier': config.externalTransactionIdentifier,
          },
        }
      );

      const data = await res.json();
      setExecutionResult({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch (err: any) {
      setExecutionResult({
        status: 500,
        statusText: 'Network / Execution Error',
        error: err.message,
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0a192f] via-[#0d2240] to-[#172554] border border-blue-500/30 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30 shadow-inner">
                <CreditCard className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Chase Pay With Points & Loyalty Rewards API
                  </h2>
                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/40">
                    apidemo.chase.com
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Execute live loyalty point redemptions, query member rewards balances, and manage environment variables for all Chase endpoints.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExecuteRedeem}
              disabled={executing}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-600/30"
            >
              {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Execute Redeem (POST)</span>
            </button>
            <button
              onClick={handleExecuteBalance}
              disabled={executing}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-blue-600/30"
            >
              {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
              <span>Check Balance (GET)</span>
            </button>
          </div>
        </div>

        {/* Quick Spec Tags */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-500/20 text-[11px] font-mono">
          <span className="px-2.5 py-1 bg-slate-900/80 rounded-md border border-slate-700 text-slate-300">
            POST: /mock/card/loyalty/redeem-rewards/transactions/v1/transactions/
          </span>
          <span className="px-2.5 py-1 bg-slate-900/80 rounded-md border border-slate-700 text-slate-300">
            GET: /merchants/users/{'{uuid}'}/rewards-balance
          </span>
          <span className="px-2.5 py-1 bg-blue-950/60 rounded-md border border-blue-500/40 text-blue-300">
            Auth: authorization + authorization2 (RS256 JWT)
          </span>
        </div>
      </div>

      {/* Main Mode Navigation */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveActionTab('redeem')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            activeActionTab === 'redeem'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Send className="w-3.5 h-3.5" /> 1. Redeem Points Payload (POST)
        </button>
        <button
          onClick={() => setActiveActionTab('balance')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            activeActionTab === 'balance'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5" /> 2. Check Rewards Balance (GET)
        </button>
        <button
          onClick={() => setActiveActionTab('config')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            activeActionTab === 'config'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> 3. Environment Variables (.env)
        </button>
      </div>

      {/* ACTION TAB 1: REDEEM REWARDS POST */}
      {activeActionTab === 'redeem' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Parameters */}
          <div className="lg:col-span-6 space-y-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" /> Transaction & Header Parameters
              </span>
              <button
                onClick={handleSaveConfig}
                disabled={saveLoading}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
              >
                {saveLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 text-emerald-400" />}
                Save Changes
              </button>
            </div>

            {saveNotice && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {saveNotice}
              </div>
            )}

            {/* Headers Group */}
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Required HTTP Headers</p>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  playground-id-token <span className="text-slate-500">(CHASE_PLAYGROUND_ID_TOKEN)</span>
                </label>
                <input
                  type="text"
                  value={config.playgroundIdToken}
                  onChange={(e) => setConfig({ ...config, playgroundIdToken: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    authorization <span className="text-slate-500">(API Key)</span>
                  </label>
                  <input
                    type="text"
                    value={config.authorization}
                    onChange={(e) => setConfig({ ...config, authorization: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    trace-id <span className="text-slate-500">(Correlation ID)</span>
                  </label>
                  <input
                    type="text"
                    value={config.traceId}
                    onChange={(e) => setConfig({ ...config, traceId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  authorization2 <span className="text-slate-500">(Bearer RS256 JWT)</span>
                </label>
                <textarea
                  rows={2}
                  value={config.authorization2}
                  onChange={(e) => setConfig({ ...config, authorization2: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] font-mono text-slate-300 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    account-reference-uuid
                  </label>
                  <input
                    type="text"
                    value={config.accountReferenceUuid}
                    onChange={(e) => setConfig({ ...config, accountReferenceUuid: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    external-transaction-id
                  </label>
                  <input
                    type="text"
                    value={config.externalTransactionIdentifier}
                    onChange={(e) => setConfig({ ...config, externalTransactionIdentifier: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  external-account-identifier
                </label>
                <input
                  type="text"
                  value={config.externalAccountIdentifier}
                  onChange={(e) => setConfig({ ...config, externalAccountIdentifier: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Body Parameters */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">JSON Request Body Payload</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">externalOrderNumber</label>
                  <input
                    type="text"
                    value={config.externalOrderNumber}
                    onChange={(e) => setConfig({ ...config, externalOrderNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">orderDate (ISO 8601)</label>
                  <input
                    type="text"
                    value={config.orderDate}
                    onChange={(e) => setConfig({ ...config, orderDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">usdAmount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.usdRewardsTransactionAmount}
                    onChange={(e) =>
                      setConfig({ ...config, usdRewardsTransactionAmount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">conversionRate</label>
                  <input
                    type="number"
                    value={config.rewardsConversionRate}
                    onChange={(e) =>
                      setConfig({ ...config, rewardsConversionRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">merchantCode</label>
                  <input
                    type="text"
                    value={config.merchantCategoryCode}
                    onChange={(e) => setConfig({ ...config, merchantCategoryCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleExecuteRedeem}
              disabled={executing}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition"
            >
              {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Send Live Redeem Transaction Request</span>
            </button>
          </div>

          {/* Response & Live Code Preview */}
          <div className="lg:col-span-6 space-y-4">
            {/* Live Response Panel */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" /> Live Response Output
                </span>
                {executionResult && (
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      executionResult.status >= 200 && executionResult.status < 300
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    HTTP {executionResult.status} {executionResult.statusText}
                  </span>
                )}
              </div>

              {executionResult ? (
                <div className="space-y-2">
                  <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[320px] overflow-y-auto">
                    {JSON.stringify(executionResult.data || executionResult, null, 2)}
                  </pre>
                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        copyToClipboard(JSON.stringify(executionResult.data || executionResult, null, 2), 'res_out')
                      }
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'res_out' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copy Response JSON
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs space-y-2">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                  <p>Ready to execute. Click &quot;Send Live Redeem Transaction Request&quot; to test your Chase loyalty endpoint.</p>
                </div>
              )}
            </div>

            {/* Snippets Switcher */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-purple-400" /> Ready-to-Run Code Snippets
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveSnippetTab('es6')}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                      activeSnippetTab === 'es6' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white bg-slate-950'
                    }`}
                  >
                    ES6 fetch
                  </button>
                  <button
                    onClick={() => setActiveSnippetTab('es5')}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                      activeSnippetTab === 'es5' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white bg-slate-950'
                    }`}
                  >
                    ES5 XMLHttpRequest
                  </button>
                  <button
                    onClick={() => setActiveSnippetTab('curl-post')}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                      activeSnippetTab === 'curl-post' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white bg-slate-950'
                    }`}
                  >
                    cURL (POST)
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-purple-300 overflow-x-auto max-h-[240px] overflow-y-auto">
                  {activeSnippetTab === 'es6' && (snippets?.es6 || '// Loading ES6 snippet...')}
                  {activeSnippetTab === 'es5' && (snippets?.es5 || '// Loading ES5 snippet...')}
                  {activeSnippetTab === 'curl-post' && (snippets?.curlRedeem || '# Loading cURL POST snippet...')}
                </pre>
                <button
                  onClick={() => {
                    const text =
                      activeSnippetTab === 'es6'
                        ? snippets?.es6
                        : activeSnippetTab === 'es5'
                        ? snippets?.es5
                        : snippets?.curlRedeem;
                    copyToClipboard(text || '', 'active_code_snip');
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1"
                >
                  {copiedKey === 'active_code_snip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTION TAB 2: REWARDS BALANCE CHECK */}
      {activeActionTab === 'balance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-blue-400" /> Rewards Balance Query (GET)
              </span>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                GET /rewards-balance
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Developer Base URL <span className="text-slate-500">(CHASE_DEVELOPER_BASE_URL)</span>
                </label>
                <input
                  type="text"
                  value={config.developerBaseUrl}
                  onChange={(e) => setConfig({ ...config, developerBaseUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Target User Account Reference UUID (in URL path):
                </label>
                <input
                  type="text"
                  value={config.accountReferenceUuid}
                  onChange={(e) => setConfig({ ...config, accountReferenceUuid: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  external-account-identifier Header:
                </label>
                <input
                  type="text"
                  value={config.externalTransactionIdentifier}
                  onChange={(e) => setConfig({ ...config, externalTransactionIdentifier: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <p className="text-slate-300 font-bold">Resolved Balance URL:</p>
                <p className="text-blue-400 break-all">
                  {config.developerBaseUrl}/merchants/users/{config.accountReferenceUuid}/rewards-balance
                </p>
              </div>

              <button
                onClick={handleExecuteBalance}
                disabled={executing}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition"
              >
                {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                <span>Fetch Live Rewards Balance</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            {/* Live Balance Output */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" /> Balance Output
                </span>
                {executionResult && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    HTTP {executionResult.status}
                  </span>
                )}
              </div>

              {executionResult ? (
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-blue-300 overflow-x-auto max-h-[300px] overflow-y-auto">
                  {JSON.stringify(executionResult.data || executionResult, null, 2)}
                </pre>
              ) : (
                <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs">
                  Click &quot;Fetch Live Rewards Balance&quot; to inspect user points and cash equivalent.
                </div>
              )}
            </div>

            {/* cURL GET Balance Snippet */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">cURL Rewards Balance Command</span>
                <button
                  onClick={() => copyToClipboard(snippets?.curlBalance || '', 'curl_bal')}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {copiedKey === 'curl_bal' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy cURL
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-blue-300 overflow-x-auto">
                {snippets?.curlBalance || '# Loading balance cURL...'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ACTION TAB 3: FULL .ENV EXPORT */}
      {activeActionTab === 'config' && (
        <div className="space-y-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" /> Chase Open Banking & Loyalty Rewards .env Specification
              </h3>
              <p className="text-xs text-slate-400">
                All Chase environment variables required by your container, Vercel, or local `.env` deployment:
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(envExport, 'env_all_chase')}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              {copiedKey === 'env_all_chase' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              Copy All Chase .env Variables
            </button>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto select-all leading-relaxed">
            {envExport || '# Generating Chase .env specification...'}
          </pre>
        </div>
      )}
    </div>
  );
};
export default ChaseLoyaltyConsole;
