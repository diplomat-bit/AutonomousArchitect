import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Lock,
  Terminal,
  Play,
  Shield,
  User,
  Phone,
  Globe,
  CheckCircle2,
  Key,
  ExternalLink,
  Code2,
  Layers,
  Sparkles,
  Database,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiFetch } from '../utils/apiClient';

export interface PayPalConfig {
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
  // Pay Later JS SDK v6
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

export default function PayPalConsole() {
  const [config, setConfig] = useState<PayPalConfig>({
    sandboxEmail: 'sb-4y30a52700589@business.example.com',
    sandboxUrl: 'https://sandbox.paypal.com',
    nvpUsername: 'sb-4y30a52700589_api1.business.example.com',
    nvpPassword: 'E7SSNXSWXHGRV5LM',
    nvpSignature: 'AcblsXONzZwsBcCXBm-.oiwMrKkwAS-IWkeeRmybAY0UaJFBwmAG09IZ',
    accountName: 'John Doe',
    accountPhone: '2027553888',
    accountCountry: 'US',
    accountType: 'Business',
    accountId: 'P39FU8PW6AMNW',
    accountStatus: 'Verified',
    creditCardsCount: '1 added',
    appName: 'Default Application',
    clientId: 'AebUugfXLhryBxMBCyjWa...',
    clientSecret: 'E7SSNXSWXHGRV5LM_SECRET_MOCK',
    oauthEndpoint: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    grantType: 'client_credentials',
    sampleScope: 'https://uri.paypal.com/services/invoicing https://uri.paypal.com/services/disputes/read-buyer https://uri.paypal.com/services/payments/realtimepayment openid https://uri.paypal.com/services/payments/refund',
    accessToken: 'A21AAFEpH4PsADK7qSS7pSRsgzfENtu-Q1ysgEDVDESseMHBYXVJYE8ovjj68elIDy8nF26AwPhfXTIeWAZHSLIsQkSYz9ifg',
    tokenType: 'Bearer',
    appId: 'APP-80W284485P519543T',
    expiresIn: 31668,
    nonce: '2020-04-03T15:35:36ZaYZlGvEkV4yVSz8g6bAKFoGSEzuy3CQcz3ljhibkOHg',
    payLaterAmount: '300.00',
    payLaterCurrency: 'USD',
    payLaterLogoType: 'MONOGRAM',
    payLaterLogoPosition: 'LEFT',
    payLaterTextColor: 'BLACK',
    payLaterPresentationMode: 'MODAL',
    payLaterIntegrationPattern: 'HTML',
    payLaterLocale: 'en-US',
    payLaterFontSize: '14px',
    payLaterTextAlign: 'left',
    sdkV6Url: 'https://www.sandbox.paypal.com/web-sdk/v6/core',
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [showNvpPass, setShowNvpPass] = useState(false);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [isLoadingNvp, setIsLoadingNvp] = useState(false);
  const [lastTokenResponse, setLastTokenResponse] = useState<any>(null);
  const [lastNvpResponse, setLastNvpResponse] = useState<any>(null);
  const [bridgeLog, setBridgeLog] = useState<any[]>([]);

  // Pay Later Interactive State
  const [isLearnMoreModalOpen, setIsLearnMoreModalOpen] = useState(false);
  const [analyticsEvents, setAnalyticsEvents] = useState<Array<{ id: string; name: string; timestamp: string; details?: any }>>([]);
  const [activeCodeTab, setActiveCodeTab] = useState<'HTML' | 'JAVASCRIPT' | 'HYBRID'>('HTML');

  // Log Analytics Helper
  const trackAnalyticsEvent = async (eventName: string, eventData: any = {}) => {
    const newEvt = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: eventName,
      timestamp: new Date().toLocaleTimeString(),
      details: eventData,
    };
    setAnalyticsEvents((prev) => [newEvt, ...prev.slice(0, 19)]);

    try {
      const res = await apiFetch<{ success: boolean; bridgeRecord: any }>('/api/paypal/paylater/analytics', {
        method: 'POST',
        body: JSON.stringify({
          eventName,
          eventData,
          config,
        }),
      });
      if (res.ok && res.data?.bridgeRecord) {
        setBridgeLog((prev) => [res.data.bridgeRecord, ...prev]);
      }
    } catch (e) {
      console.warn('Analytics log saved locally');
    }
  };

  // Fetch initial config from backend
  const loadConfig = async () => {
    try {
      const res = await apiFetch<{ success: boolean; config: PayPalConfig }>('/api/paypal/config');
      if (res.ok && res.data?.config) {
        setConfig(res.data.config);
      }
    } catch (e) {
      console.warn('Using default PayPal config fallback');
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const updateVar = async (key: keyof PayPalConfig, value: any) => {
    const nextCfg = { ...config, [key]: value };
    setConfig(nextCfg);
    try {
      await apiFetch('/api/paypal/config', {
        method: 'POST',
        body: JSON.stringify({ [key]: value }),
      });
    } catch (e) {
      console.error('Failed to persist PayPal var', e);
    }
  };

  const handleFetchOAuthToken = async () => {
    setIsLoadingToken(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        token: any;
        isLive: boolean;
        bridgeRecord: any;
        config: PayPalConfig;
      }>('/api/paypal/oauth/token', {
        method: 'POST',
        body: JSON.stringify({
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          grantType: config.grantType,
          endpoint: config.oauthEndpoint,
        }),
      });

      if (res.ok && res.data) {
        setLastTokenResponse(res.data.token);
        if (res.data.config) {
          setConfig(res.data.config);
        }
        if (res.data.bridgeRecord) {
          setBridgeLog((prev) => [res.data.bridgeRecord, ...prev]);
        }
      }
    } catch (e: any) {
      console.error('PayPal OAuth token error', e);
    } finally {
      setIsLoadingToken(false);
    }
  };

  const handleRunNvpCall = async () => {
    setIsLoadingNvp(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        response: any;
        bridgeRecord: any;
      }>('/api/paypal/nvp/call', {
        method: 'POST',
        body: JSON.stringify({ method: 'GetTransactionDetails' }),
      });

      if (res.ok && res.data) {
        setLastNvpResponse(res.data.response);
        if (res.data.bridgeRecord) {
          setBridgeLog((prev) => [res.data.bridgeRecord, ...prev]);
        }
      }
    } catch (e: any) {
      console.error('PayPal NVP API call error', e);
    } finally {
      setIsLoadingNvp(false);
    }
  };

  // Compute Base64 for CLIENT_ID:CLIENT_SECRET
  const base64Auth = btoa(`${config.clientId}:${config.clientSecret}`);

  // Generate standard cURL string
  const curlCommand = `curl -v -X POST "${config.oauthEndpoint}" \\
  -u "${config.clientId}:${config.clientSecret}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=${config.grantType}"`;

  // Reusable Card Component for each Variable
  const VariableCard = ({
    title,
    varKey,
    value,
    icon: Icon,
    color = 'blue',
    isSecret = false,
    showSecretState,
    toggleSecret,
    onChange,
    description,
    tag,
  }: {
    title: string;
    varKey: keyof PayPalConfig;
    value: string | number;
    icon: any;
    color?: 'blue' | 'purple' | 'emerald' | 'amber' | 'cyan' | 'rose' | 'indigo';
    isSecret?: boolean;
    showSecretState?: boolean;
    toggleSecret?: () => void;
    onChange?: (newVal: string) => void;
    description?: string;
    tag?: string;
  }) => {
    const colorClasses = {
      blue: 'border-blue-500/30 bg-blue-950/20 text-blue-400',
      purple: 'border-purple-500/30 bg-purple-950/20 text-purple-400',
      emerald: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
      amber: 'border-amber-500/30 bg-amber-950/20 text-amber-400',
      cyan: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400',
      rose: 'border-rose-500/30 bg-rose-950/20 text-rose-400',
      indigo: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-400',
    };

    const isCopied = copiedKey === varKey;

    return (
      <div className={`p-4 rounded-xl border bg-[#161B22] flex flex-col justify-between space-y-3 transition-all hover:border-[#484f58] shadow-xs group`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-white tracking-tight">{title}</h3>
              <code className="text-[10px] text-[#8B949E] font-mono">{String(varKey)}</code>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {tag && (
              <span className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded-full border ${colorClasses[color]}`}>
                {tag}
              </span>
            )}
            <button
              onClick={() => handleCopy(String(value), varKey)}
              className="p-1.5 rounded-lg text-[#8B949E] hover:text-white hover:bg-[#21262d] transition-colors"
              title="Copy variable value"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Input / Display Field */}
        <div className="space-y-1">
          <div className="relative flex items-center">
            <input
              type={isSecret && !showSecretState ? 'password' : 'text'}
              value={String(value)}
              onChange={(e) => onChange ? onChange(e.target.value) : updateVar(varKey, e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-lg bg-[#0d1117] border border-[#30363D] text-xs font-mono text-[#79C0FF] focus:outline-none focus:border-blue-500/60 transition-colors"
            />
            {isSecret && toggleSecret && (
              <button
                type="button"
                onClick={toggleSecret}
                className="absolute right-2 p-1 text-[#8B949E] hover:text-white transition-colors"
              >
                {showSecretState ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          {description && (
            <p className="text-[10px] text-[#8B949E] leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-[#161B22] to-cyan-950/40 rounded-2xl border border-blue-500/30 p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <CreditCard className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                PayPal Sandbox REST API, Pay Later JS SDK v6 & Credentials Hub
              </h2>
              <p className="text-xs text-[#8B949E]">
                Full support for Pay Later messaging (`paypal-messages`), OAuth 2.0 Client credentials, and QuickBooks Bridge synchronization.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleFetchOAuthToken}
            disabled={isLoadingToken}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-950/50 transition-all border border-blue-400/40"
          >
            {isLoadingToken ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Exchange OAuth Token</span>
          </button>

          <button
            onClick={handleRunNvpCall}
            disabled={isLoadingNvp}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#21262d] hover:bg-[#30363D] text-amber-300 hover:text-white text-xs font-bold border border-amber-500/30 transition-all"
          >
            {isLoadingNvp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Test NVP/SOAP Call</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAY PAL PAY LATER JS SDK V6 MESSAGING STUDIO & INTERACTIVE COMPONENT */}
      {/* ========================================================================= */}
      <div className="bg-[#161B22] rounded-2xl border border-blue-500/40 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#30363D] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">PayPal Pay Later Messaging (JS SDK v6)</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  v6/core
                </span>
              </div>
              <p className="text-xs text-[#8B949E]">
                Render flexible Pay in 4 or Pay Monthly financing messages with Learn More modals, analytics callbacks, and dynamic cart total updating.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-[#0d1117] p-1 rounded-xl border border-[#30363D]">
            {(['HTML', 'JAVASCRIPT', 'HYBRID'] as const).map((pattern) => (
              <button
                key={pattern}
                onClick={() => {
                  updateVar('payLaterIntegrationPattern', pattern);
                  setActiveCodeTab(pattern);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  config.payLaterIntegrationPattern === pattern
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[#8B949E] hover:text-white hover:bg-[#21262d]'
                }`}
              >
                {pattern} Mode
              </button>
            ))}
          </div>
        </div>

        {/* Live Pay Later Preview Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Rendering Box */}
          <div className="lg:col-span-7 bg-[#0d1117] rounded-xl border border-[#30363D] p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Live Product Page Preview
                </span>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  SDK Authenticated ({config.clientId.slice(0, 10)}...)
                </span>
              </div>

              {/* Simulated Product Card */}
              <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Pro Developer Workstation</span>
                  <span className="text-sm font-extrabold text-cyan-400 font-mono">${config.payLaterAmount}</span>
                </div>

                {/* THE PAY PAL MESSAGE COMPONENT RENDERER */}
                <div
                  className={`p-3.5 rounded-lg border transition-all duration-300 shadow-sm ${
                    config.payLaterTextColor === 'WHITE'
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : config.payLaterTextColor === 'MONOCHROME'
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                      : 'bg-blue-50/90 border-blue-200 text-slate-900'
                  }`}
                  style={{
                    fontSize: config.payLaterFontSize || '14px',
                    textAlign: (config.payLaterTextAlign as any) || 'left',
                  }}
                >
                  <div className="flex items-center gap-2 flex-wrap" style={{ justifyContent: config.payLaterTextAlign === 'center' ? 'center' : 'flex-start' }}>
                    {/* PayPal Monogram / Logo */}
                    {config.payLaterLogoType !== 'NONE' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-600 text-white font-black text-xs tracking-tighter italic shadow-xs">
                        {config.payLaterLogoType === 'MONOGRAM' ? 'P' : 'PayPal'}
                      </span>
                    )}

                    <span>
                      Pay in 4 interest-free payments of{' '}
                      <strong>${(parseFloat(config.payLaterAmount || '300.00') / 4).toFixed(2)}</strong> every 2 weeks.
                    </span>

                    <button
                      onClick={() => {
                        trackAnalyticsEvent('paylater_message_clicked', { amount: config.payLaterAmount });
                        trackAnalyticsEvent('paylater_learn_more_shown', { mode: config.payLaterPresentationMode });
                        setIsLearnMoreModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1 text-blue-600 font-bold underline hover:text-blue-800 transition-colors ml-1"
                    >
                      <span>Learn More</span>
                      <ExternalLink className="w-3 h-3 inline" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-[#8B949E] flex items-center justify-between pt-1">
                  <span>Merchant ID: {config.accountId}</span>
                  <span>Currency: {config.payLaterCurrency}</span>
                </div>
              </div>
            </div>

            {/* Cart Amount Slider & Dynamic Updates */}
            <div className="space-y-2 pt-2 border-t border-[#30363D]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  Dynamic Cart Amount
                </span>
                <span className="font-mono text-cyan-400 font-bold">${config.payLaterAmount}</span>
              </div>

              <input
                type="range"
                min="50"
                max="2000"
                step="25"
                value={parseFloat(config.payLaterAmount) || 300}
                onChange={(e) => {
                  const val = parseFloat(e.target.value).toFixed(2);
                  updateVar('payLaterAmount', val);
                  trackAnalyticsEvent('paylater_calculate', { amount: val });
                }}
                className="w-full accent-blue-500 cursor-pointer h-2 bg-[#21262d] rounded-lg"
              />

              <div className="flex items-center space-x-2 pt-1">
                {['50.00', '150.00', '300.00', '500.00', '1200.00'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      updateVar('payLaterAmount', preset);
                      trackAnalyticsEvent('paylater_calculate', { amount: preset });
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border transition-colors ${
                      config.payLaterAmount === preset
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-[#161b22] text-[#8B949E] border-[#30363D] hover:text-white'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Controls */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-purple-400" />
              Messaging Customizer Options
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1 font-semibold">Logo Type</label>
                <select
                  value={config.payLaterLogoType}
                  onChange={(e) => updateVar('payLaterLogoType', e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#0d1117] border border-[#30363D] text-white font-mono"
                >
                  <option value="MONOGRAM">MONOGRAM (P)</option>
                  <option value="PRIMARY">PRIMARY (PayPal)</option>
                  <option value="ALTERNATIVE">ALTERNATIVE</option>
                  <option value="INLINE">INLINE</option>
                  <option value="NONE">NONE</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1 font-semibold">Logo Position</label>
                <select
                  value={config.payLaterLogoPosition}
                  onChange={(e) => updateVar('payLaterLogoPosition', e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#0d1117] border border-[#30363D] text-white font-mono"
                >
                  <option value="LEFT">LEFT</option>
                  <option value="TOP">TOP</option>
                  <option value="RIGHT">RIGHT</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1 font-semibold">Text Color</label>
                <select
                  value={config.payLaterTextColor}
                  onChange={(e) => updateVar('payLaterTextColor', e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#0d1117] border border-[#30363D] text-white font-mono"
                >
                  <option value="BLACK">BLACK (Light BG)</option>
                  <option value="WHITE">WHITE (Dark BG)</option>
                  <option value="MONOCHROME">MONOCHROME</option>
                  <option value="GRAY">GRAY</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1 font-semibold">Learn More Mode</label>
                <select
                  value={config.payLaterPresentationMode}
                  onChange={(e) => updateVar('payLaterPresentationMode', e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#0d1117] border border-[#30363D] text-white font-mono"
                >
                  <option value="MODAL">MODAL</option>
                  <option value="POPUP">POPUP</option>
                  <option value="REDIRECT">REDIRECT</option>
                  <option value="AUTO">AUTO</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1 font-semibold">Locale / Language</label>
                <select
                  value={config.payLaterLocale}
                  onChange={(e) => updateVar('payLaterLocale', e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#0d1117] border border-[#30363D] text-white font-mono"
                >
                  <option value="en-US">en-US (United States)</option>
                  <option value="en-CA">en-CA (Canada English)</option>
                  <option value="fr-CA">fr-CA (Canada French)</option>
                  <option value="en-GB">en-GB (United Kingdom)</option>
                  <option value="de-DE">de-DE (Germany)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1 font-semibold">Font Size CSS</label>
                <select
                  value={config.payLaterFontSize}
                  onChange={(e) => updateVar('payLaterFontSize', e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#0d1117] border border-[#30363D] text-white font-mono"
                >
                  <option value="12px">12px Small</option>
                  <option value="14px">14px Medium</option>
                  <option value="16px">16px Large</option>
                  <option value="18px">18px X-Large</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Code Snippet Generator */}
        <div className="space-y-3 pt-2 border-t border-[#30363D]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white">
                Generated Integration Code ({activeCodeTab} Pattern)
              </h4>
            </div>
            <button
              onClick={() => {
                const codeSnippet =
                  activeCodeTab === 'HTML'
                    ? `<script async src="https://www.sandbox.paypal.com/web-sdk/v6/core" onload="onPayPalWebSdkLoaded()"></script>\n<paypal-message auto-bootstrap amount="${config.payLaterAmount}" logo-type="${config.payLaterLogoType}" text-color="${config.payLaterTextColor}"></paypal-message>`
                    : `const content = await messagesInstance.fetchContent({ amount: "${config.payLaterAmount}", currencyCode: "${config.payLaterCurrency}", logoType: "${config.payLaterLogoType}" });`;
                handleCopy(codeSnippet, 'code-snippet');
              }}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363D] text-[11px] text-[#C9D1D9] border border-[#30363D]"
            >
              {copiedKey === 'code-snippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy Code</span>
            </button>
          </div>

          <div className="rounded-xl border border-[#30363D] bg-[#0d1117] p-4 text-xs font-mono text-[#79C0FF] overflow-x-auto max-h-48">
            <pre>
              {activeCodeTab === 'HTML' &&
                `<!-- Step 1: Load PayPal JS SDK v6 Core -->
<script
  async
  src="https://www.sandbox.paypal.com/web-sdk/v6/core"
  onload="onPayPalWebSdkLoaded()"
></script>

<!-- Step 2: Add Pay Later Message Custom HTML Element -->
<paypal-message
  auto-bootstrap
  amount="${config.payLaterAmount}"
  logo-type="${config.payLaterLogoType}"
  text-color="${config.payLaterTextColor}"
></paypal-message>

<!-- Step 3: Initialize SDK Instance -->
<script>
  async function onPayPalWebSdkLoaded() {
    const sdkInstance = await window.paypal.createInstance({
      clientId: "${config.clientId}",
      components: ["paypal-messages"],
      locale: "${config.payLaterLocale}"
    });
    const messagesInstance = sdkInstance.createPayPalMessages({
      currencyCode: "${config.payLaterCurrency}"
    });
    const learnMore = await messagesInstance.createLearnMore({
      presentationMode: "${config.payLaterPresentationMode}"
    });
  }
</script>`}

              {activeCodeTab === 'JAVASCRIPT' &&
                `// Pure JavaScript Pattern (Maximum Control)
const messageElement = document.querySelector('paypal-message');

const sdkInstance = await window.paypal.createInstance({
  clientId: "${config.clientId}",
  components: ["paypal-messages"],
  locale: "${config.payLaterLocale}"
});

const messagesInstance = sdkInstance.createPayPalMessages();

const content = await messagesInstance.fetchContent({
  amount: "${config.payLaterAmount}",
  currencyCode: "${config.payLaterCurrency}",
  logoType: "${config.payLaterLogoType}",
  textColor: "${config.payLaterTextColor}",
  logoPosition: "${config.payLaterLogoPosition}",
  onReady: (content) => {
    messageElement.setContent(content);
  },
});`}

              {activeCodeTab === 'HYBRID' &&
                `<!-- Hybrid Configuration Pattern -->
<paypal-message amount="${config.payLaterAmount}"></paypal-message>

<script>
  (async () => {
    const sdkInstance = await window.paypal.createInstance({
      clientId: "${config.clientId}",
      components: ["paypal-messages"]
    });
    const messagesInstance = sdkInstance.createPayPalMessages({
      currencyCode: "${config.payLaterCurrency}"
    });
  })();
</script>`}
            </pre>
          </div>
        </div>

        {/* Realtime Analytics Event Feed */}
        <div className="space-y-2 pt-2 border-t border-[#30363D]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Pay Later Analytics & Callbacks Stream
            </span>
            <span className="text-[10px] text-[#8B949E] font-mono">{analyticsEvents.length} Events Captured</span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-[11px] font-mono">
            {analyticsEvents.length === 0 ? (
              <span className="text-[#8B949E] italic">Click "Learn More" or move the amount slider above to fire callbacks</span>
            ) : (
              analyticsEvents.map((evt) => (
                <span
                  key={evt.id}
                  className="px-2.5 py-1 rounded-lg bg-[#0d1117] border border-blue-500/30 text-cyan-300 shrink-0 flex items-center gap-1.5 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <strong>{evt.name}</strong> ({evt.timestamp})
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* LEARN MORE FINANCING TERMS MODAL */}
      {isLearnMoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161B22] rounded-2xl border border-blue-500/40 max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-blue-600 text-white font-black text-sm italic">P</span>
                <div>
                  <h3 className="text-sm font-bold text-white">Pay in 4 with PayPal</h3>
                  <p className="text-[11px] text-[#8B949E]">0% APR • No Late Fees • Instant Decision</p>
                </div>
              </div>
              <button
                onClick={() => {
                  trackAnalyticsEvent('paylater_learn_more_closed');
                  setIsLearnMoreModalOpen(false);
                }}
                className="text-[#8B949E] hover:text-white p-1 rounded-lg hover:bg-[#21262d]"
              >
                ✕
              </button>
            </div>

            {/* Installment Breakdown */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363D] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B949E]">Cart Total:</span>
                  <span className="text-white font-bold font-mono">${config.payLaterAmount} USD</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B949E]">Installment Schedule:</span>
                  <span className="text-emerald-400 font-bold">4 Interest-Free Payments</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363D] space-y-1">
                  <span className="text-[10px] text-[#8B949E] font-bold">1ST PAYMENT TODAY</span>
                  <p className="text-sm font-bold text-white font-mono">
                    ${(parseFloat(config.payLaterAmount) / 4).toFixed(2)}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363D] space-y-1">
                  <span className="text-[10px] text-[#8B949E] font-bold">IN 2 WEEKS</span>
                  <p className="text-sm font-bold text-white font-mono">
                    ${(parseFloat(config.payLaterAmount) / 4).toFixed(2)}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363D] space-y-1">
                  <span className="text-[10px] text-[#8B949E] font-bold">IN 4 WEEKS</span>
                  <p className="text-sm font-bold text-white font-mono">
                    ${(parseFloat(config.payLaterAmount) / 4).toFixed(2)}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363D] space-y-1">
                  <span className="text-[10px] text-[#8B949E] font-bold">IN 6 WEEKS</span>
                  <p className="text-sm font-bold text-white font-mono">
                    ${(parseFloat(config.payLaterAmount) / 4).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  trackAnalyticsEvent('paylater_apply_clicked', { amount: config.payLaterAmount });
                  setIsLearnMoreModalOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md border border-blue-400/40"
              >
                Apply Now with PayPal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Section 1: Sandbox Account Variables */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">1. PayPal Sandbox Account Variables</h3>
          </div>
          <span className="text-xs text-[#8B949E] font-mono">9 Variable Cards</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <VariableCard
            title="Sandbox Email"
            varKey="sandboxEmail"
            value={config.sandboxEmail}
            icon={User}
            color="emerald"
            tag="Business"
            description="Default business account email for sandbox test transactions"
          />

          <VariableCard
            title="Sandbox URL"
            varKey="sandboxUrl"
            value={config.sandboxUrl}
            icon={Globe}
            color="cyan"
            tag="Dashboard"
            description="Sandbox sign-in portal endpoint"
          />

          <VariableCard
            title="Account Owner Name"
            varKey="accountName"
            value={config.accountName}
            icon={User}
            color="emerald"
            description="Mock account holder name"
          />

          <VariableCard
            title="Account Phone"
            varKey="accountPhone"
            value={config.accountPhone}
            icon={Phone}
            color="blue"
            description="Test environment contact number"
          />

          <VariableCard
            title="Country / Region"
            varKey="accountCountry"
            value={config.accountCountry}
            icon={Globe}
            color="indigo"
            tag="US"
            description="Jurisdiction code"
          />

          <VariableCard
            title="Account Type"
            varKey="accountType"
            value={config.accountType}
            icon={Shield}
            color="purple"
            tag="Business"
            description="Account tier level"
          />

          <VariableCard
            title="Account ID (Payer ID)"
            varKey="accountId"
            value={config.accountId}
            icon={Key}
            color="amber"
            tag="Payer ID"
            description="Unique sandbox business identifier"
          />

          <VariableCard
            title="Verification Status"
            varKey="accountStatus"
            value={config.accountStatus}
            icon={CheckCircle2}
            color="emerald"
            tag="Verified"
            description="Merchant verification state"
          />

          <VariableCard
            title="Credit Cards Attached"
            varKey="creditCardsCount"
            value={config.creditCardsCount}
            icon={CreditCard}
            color="cyan"
            description="Simulated vault credit cards count"
          />
        </div>
      </div>

      {/* Grid Section 2: NVP/SOAP Legacy Credentials */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">2. NVP/SOAP Sandbox Credentials</h3>
          </div>
          <span className="text-xs text-[#8B949E] font-mono">3 Variable Cards</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <VariableCard
            title="NVP API Username"
            varKey="nvpUsername"
            value={config.nvpUsername}
            icon={User}
            color="amber"
            description="Legacy NVP/SOAP API Username"
          />

          <VariableCard
            title="NVP API Password"
            varKey="nvpPassword"
            value={config.nvpPassword}
            icon={Key}
            color="amber"
            isSecret={true}
            showSecretState={showNvpPass}
            toggleSecret={() => setShowNvpPass(!showNvpPass)}
            description="Legacy NVP/SOAP API Password"
          />

          <VariableCard
            title="NVP API Signature"
            varKey="nvpSignature"
            value={config.nvpSignature}
            icon={Lock}
            color="amber"
            description="Legacy Signature Hash string"
          />
        </div>
      </div>

      {/* Grid Section 3: REST API Application Credentials */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">3. REST API Application Credentials</h3>
          </div>
          <span className="text-xs text-[#8B949E] font-mono">3 Variable Cards</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <VariableCard
            title="REST App Name"
            varKey="appName"
            value={config.appName}
            icon={Layers}
            color="purple"
            description="Registered Developer REST application name"
          />

          <VariableCard
            title="REST Client ID"
            varKey="clientId"
            value={config.clientId}
            icon={Key}
            color="purple"
            description="PayPal REST Client Identifier"
          />

          <VariableCard
            title="REST Client Secret"
            varKey="clientSecret"
            value={config.clientSecret}
            icon={Lock}
            color="rose"
            isSecret={true}
            showSecretState={showSecret}
            toggleSecret={() => setShowSecret(!showSecret)}
            description="PayPal REST Client Secret"
          />
        </div>
      </div>

      {/* Grid Section 4: OAuth Token & Response Variables */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">4. REST OAuth 2.0 Response Variables</h3>
          </div>
          <span className="text-xs text-[#8B949E] font-mono">8 Variable Cards</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <VariableCard
            title="OAuth Token Endpoint"
            varKey="oauthEndpoint"
            value={config.oauthEndpoint}
            icon={Globe}
            color="cyan"
            description="POST url for token grant"
          />

          <VariableCard
            title="Grant Type"
            varKey="grantType"
            value={config.grantType}
            icon={Terminal}
            color="blue"
            tag="client_credentials"
            description="Required OAuth body parameter"
          />

          <VariableCard
            title="Access Token"
            varKey="accessToken"
            value={config.accessToken}
            icon={Zap}
            color="emerald"
            tag="Active"
            description="PayPal Bearer Access Token"
          />

          <VariableCard
            title="Token Type"
            varKey="tokenType"
            value={config.tokenType}
            icon={Shield}
            color="purple"
            tag="Bearer"
            description="Authorization header type"
          />

          <VariableCard
            title="PayPal App ID"
            varKey="appId"
            value={config.appId}
            icon={Key}
            color="indigo"
            description="System generated application ID"
          />

          <VariableCard
            title="Expires In (Seconds)"
            varKey="expiresIn"
            value={config.expiresIn}
            icon={RefreshCw}
            color="amber"
            tag={`${Math.round(config.expiresIn / 3600)}h`}
            description="Access token lifespan in seconds"
          />

          <VariableCard
            title="Nonce Timestamp"
            varKey="nonce"
            value={config.nonce}
            icon={Code2}
            color="rose"
            description="Unique token generation nonce"
          />

          <VariableCard
            title="Granted API Scopes"
            varKey="sampleScope"
            value={config.sampleScope}
            icon={Sparkles}
            color="emerald"
            description="Authorized API service endpoints"
          />
        </div>
      </div>

      {/* cURL Command & Execution Box */}
      <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-[#79C0FF]" />
            <h3 className="text-sm font-bold text-white">PayPal cURL OAuth Token Generator</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#8B949E] font-mono hidden sm:inline">
              Base64 Auth: <code className="text-[#79C0FF]">{base64Auth.slice(0, 20)}...</code>
            </span>
            <button
              onClick={() => handleCopy(curlCommand, 'curl')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363D] text-xs font-semibold text-[#C9D1D9] border border-[#30363D] transition-colors"
            >
              {copiedKey === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'curl' ? 'Copied cURL' : 'Copy cURL'}</span>
            </button>
          </div>
        </div>

        <div className="relative rounded-xl border border-[#30363D] bg-[#0d1117] p-4 text-xs font-mono text-[#79C0FF] overflow-x-auto">
          <pre>{curlCommand}</pre>
        </div>
      </div>

      {/* Live Token Response & QuickBooks Ledger Status */}
      {(lastTokenResponse || lastNvpResponse || bridgeLog.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Payload */}
          <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Last API Response Payload</h3>
            </div>
            <div className="rounded-xl border border-[#30363D] bg-[#0d1117] p-4 text-xs font-mono text-emerald-400 max-h-60 overflow-y-auto">
              <pre>{JSON.stringify(lastTokenResponse || lastNvpResponse, null, 2)}</pre>
            </div>
          </div>

          {/* QuickBooks Bridge Activity */}
          <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">QuickBooks Ledger Bridge Activity</h3>
            </div>
            <div className="rounded-xl border border-[#30363D] bg-[#0d1117] p-3 space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
              {bridgeLog.length === 0 ? (
                <p className="text-[#8B949E] text-xs font-sans">No PayPal bridge entries recorded yet. Execute OAuth or NVP call above.</p>
              ) : (
                bridgeLog.map((log, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363D] space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-bold">{log.action}</span>
                      <span className="text-[#8B949E]">{log.bridgeId}</span>
                    </div>
                    <p className="text-[#C9D1D9] text-[11px] font-sans">{log.summary}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
