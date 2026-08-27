import React, { useState } from 'react';
import { Terminal, Play, RefreshCw, Copy, Check, Sparkles, Send, BookOpen, AlertCircle, ArrowRight, CornerDownRight } from 'lucide-react';
import { TokenResponse } from '../types';
import { apiFetch } from '../utils/apiClient';

interface CustomCurlExecutorProps {
  tokens: TokenResponse | null;
  onSendToAiIngest?: (jsonString: string) => void;
}

export const CustomCurlExecutor: React.FC<CustomCurlExecutorProps> = ({ tokens, onSendToAiIngest }) => {
  const [curlCommand, setCurlCommand] = useState('');
  const [customAccessToken, setCustomAccessToken] = useState('');
  const [parsedMethod, setParsedMethod] = useState('GET');
  const [parsedUrl, setParsedUrl] = useState('https://sandbox-quickbooks.api.intuit.com/v3/company/4620816365/companyinfo/4620816365');
  const [parsedHeaders, setParsedHeaders] = useState<Record<string, string>>({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });
  const [parsedBody, setParsedBody] = useState('');
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'curl' | 'manual'>('curl');

  const activeToken = customAccessToken.trim() || tokens?.access_token || '';
  const activeRealm = tokens?.realmId || '4620816365';

  const presets = [
    {
      name: 'Finicity Step 1: Partner Authentication (Create Access Token)',
      curl: `curl --location --request POST 'https://api.finicity.com/aggregation/v2/partners/authentication' \\
  --header 'Content-Type: application/json' \\
  --header 'Finicity-App-Key: 2423653942467' \\
  --header 'Accept: application/json' \\
  --data-raw '{
    "partnerId": "2423653942467",
    "partnerSecret": "demo_partner_secret_mastercard"
}'`,
    },
    {
      name: 'Finicity Step 2: Add Testing Customer',
      curl: `curl --location --request POST 'https://api.finicity.com/aggregation/v2/customers/testing' \\
  --header 'Content-Type: application/json' \\
  --header 'Accept: application/json' \\
  --header 'Finicity-App-Key: 2423653942467' \\
  --header 'Finicity-App-Token: YBh22Sb9Es6e66Q7lWdt' \\
  --data-raw '{
    "username": "customerusername1"
}'`,
    },
    {
      name: 'Finicity Step 3: Generate Mastercard Data Connect URL',
      curl: `curl --location --request POST 'https://api.finicity.com/connect/v2/generate' \\
  --header 'Content-Type: application/json' \\
  --header 'Accept: application/json' \\
  --header 'Finicity-App-Token: YBh22Sb9Es6e66Q7lWdt' \\
  --header 'Finicity-App-Key: 2423653942467' \\
  --data-raw '{
    "partnerId": "2423653942467",
    "customerId": "1005061234"
}'`,
    },
    {
      name: 'Finicity Step 5: Refresh Customer Accounts (Aggregation)',
      curl: `curl --location -g --request POST 'https://api.finicity.com/aggregation/v1/customers/1005061234/accounts' \\
  --header 'Content-Type: application/json' \\
  --header 'Accept: application/json' \\
  --header 'Finicity-App-Token: YBh22Sb9Es6e66Q7lWdt' \\
  --header 'Finicity-App-Key: 2423653942467' \\
  --data-raw '{}'`,
    },
    {
      name: 'Finicity: Fetch Customer Transactions (v3)',
      curl: `curl --location --request GET 'https://api.finicity.com/aggregation/v3/customers/1005061234/transactions?fromDate=1646136000&toDate=1665234244&includePending=true&sort=desc&limit=25' \\
  --header 'Finicity-App-Key: 2423653942467' \\
  --header 'Accept: application/json' \\
  --header 'Finicity-App-Token: YBh22Sb9Es6e66Q7lWdt'`,
    },
    {
      name: 'Chase Redeem Rewards (Loyalty POST)',
      curl: `curl -X POST "https://apidemo.chase.com/mock/card/loyalty/redeem-rewards/transactions/v1/transactions/" \\
  -H "Content-Type: application/json" \\
  -H "playground-id-token: {copied-playground-token-id}" \\
  -H "authorization: EB3ik8VN9sAV2YjUnZv5UUcAUzFg" \\
  -H "authorization2: Bearer eyJraWQiOiJrZXkwMSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJwd3B0ZXN0IiwiYXVkIjoiY2hhc2UiLCJpc3MiOiJQV1BURVNUIiwiZXhwIjoxNjE3MjM2OTkwLCJpYXQiOjE2MTcyMDA5OTAsImp0aSI6ImUzY2NmMGU2LWM5MmYtNDI2My04MGM2LTI0ODI1OTdiZmEzMiJ9.dUmOrjpXKAkra1opeuLVAV78MKGaI9kPe0VrH56NEdhseBedqiWB8cPQT6ujzTt2s2sREvdam9p85Vynvn10rYKbMdgShv0lEsYrbG3GcRcieYAW4DlgLZ6VlSbwiaw_DIbvLugOuVrcCR6MFj4qJmW3yz6NM5Us_sW4MJKdkbCuMreg5ciOj_32krJj7AwCBpllz7RFK5G_VjAlbBdoTgIIu0WoPYxhxr3D0BDQavhApQHCsEmti5Bh-okYUucx3YK_ZTPO_MTPwWY7T0_wRelgt6vOCyZPlzdAH_NDOADrk5dO7ajSH4tPL1z-wIuidGMAVWH5FTKPtSgxah1_FQ" \\
  -H "trace-id: 562952952929829" \\
  -H "channel-type: " \\
  -H "account-reference-universal-unique-identifier: d383fd33-7be1-4ff8-88b7-f2adca419296" \\
  -H "external-transaction-identifier: ETI202007020791" \\
  -H "external-account-identifier: XXXX.XXXX.aerra@jpmchase.com" \\
  -d '{"externalOrderNumber":"I202007020302","orderDate":"2021-02-11T22:25:50.52Z","externalTransactionTypeCode":"5070","usdRewardsTransactionAmount":7.95,"rewardsConversionRate":80,"merchantCategoryCode":"2020"}'`,
    },
    {
      name: 'Chase Rewards Balance (Loyalty GET)',
      curl: `curl -X GET "https://developer.chase.com/merchants/users/d383fd33-7be1-4ff8-88b7-f2adca419296/rewards-balance" \\
  -H "accept: application/json" \\
  -H "playground-id-token: " \\
  -H "authorization: EB3ik8VN9sAV2YjUnZv5UUcAUzFg" \\
  -H "authorization2: Bearer eyJraWQiOiJrZXkwMSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJwd3B0ZXN0IiwiYXVkIjoiY2hhc2UiLCJpc3MiOiJQV1BURVNUIiwiZXhwIjoxNjE3MjM2OTkwLCJpYXQiOjE2MTcyMDA5OTAsImp0aSI6ImUzY2NmMGU2LWM5MmYtNDI2My04MGM2LTI0ODI1OTdiZmEzMiJ9.dUmOrjpXKAkra1opeuLVAV78MKGaI9kPe0VrH56NEdhseBedqiWB8cPQT6ujzTt2s2sREvdam9p85Vynvn10rYKbMdgShv0lEsYrbG3GcRcieYAW4DlgLZ6VlSbwiaw_DIbvLugOuVrcCR6MFj4qJmW3yz6NM5Us_sW4MJKdkbCuMreg5ciOj_32krJj7AwCBpllz7RFK5G_VjAlbBdoTgIIu0WoPYxhxr3D0BDQavhApQHCsEmti5Bh-okYUucx3YK_ZTPO_MTPwWY7T0_wRelgt6vOCyZPlzdAH_NDOADrk5dO7ajSH4tPL1z-wIuidGMAVWH5FTKPtSgxah1_FQ" \\
  -H "trace-id: 562952952929829" \\
  -H "external-account-identifier: ETI202007020791"`,
    },
    {
      name: 'Create Bank Account in QBO',
      curl: `curl -X POST "https://sandbox-quickbooks.api.intuit.com/v3/company/${activeRealm}/account?minorversion=75" \\
  -H "Authorization: Bearer ${activeToken || '<ACCESS_TOKEN>'}" \\
  -H "Accept: application/json" \\
  -H "Content-Type: application/json" \\
  -d '{"Name": "Citi Commercial Checking - 0019", "AccountType": "Bank", "AccountSubType": "Checking", "AcctNum": "0019", "Description": "Main Operating Account"}'`,
    },
    {
      name: 'Query All Accounts (SQL)',
      curl: `curl -X GET "https://sandbox-quickbooks.api.intuit.com/v3/company/${activeRealm}/query?query=SELECT%20*%20FROM%20Account%20MAXRESULTS%2050&minorversion=75" \\
  -H "Authorization: Bearer ${activeToken || '<ACCESS_TOKEN>'}" \\
  -H "Accept: application/json"`,
    },
    {
      name: 'Create Customer in QBO',
      curl: `curl -X POST "https://sandbox-quickbooks.api.intuit.com/v3/company/${activeRealm}/customer?minorversion=75" \\
  -H "Authorization: Bearer ${activeToken || '<ACCESS_TOKEN>'}" \\
  -H "Accept: application/json" \\
  -H "Content-Type: application/json" \\
  -d '{"DisplayName": "Enterprise Client Inc", "PrimaryEmailAddr": {"Address": "billing@enterprise.com"}}'`,
    },
    {
      name: 'Get Company Info',
      curl: `curl -X GET "https://sandbox-quickbooks.api.intuit.com/v3/company/${activeRealm}/companyinfo/${activeRealm}" \\
  -H "Authorization: Bearer ${activeToken || '<ACCESS_TOKEN>'}" \\
  -H "Accept: application/json"`,
    },
    {
      name: 'Get OpenID User Info',
      curl: `curl -X GET "https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo" \\
  -H "Authorization: Bearer ${activeToken || '<ACCESS_TOKEN>'}" \\
  -H "Accept: application/json"`,
    },
  ];

  const parseCurlString = (curl: string) => {
    try {
      const clean = curl.replace(/\\\n/g, ' ').replace(/[\r\n]+/g, ' ').trim();
      // Advanced Robust cURL Tokenizer and Parser
      const tokensList: string[] = [];
      let currentToken = '';
      let insideQuote: string | null = null;
      let escaped = false;

      for (let i = 0; i < clean.length; i++) {
        const char = clean[i];

        if (escaped) {
          currentToken += char;
          escaped = false;
          continue;
        }

        if (char === '\\') {
          escaped = true;
          continue;
        }

        if (insideQuote) {
          if (char === insideQuote) {
            insideQuote = null;
          } else {
            currentToken += char;
          }
        } else {
          if (char === '"' || char === "'") {
            insideQuote = char;
          } else if (/\s/.test(char)) {
            if (currentToken.length > 0) {
              tokensList.push(currentToken);
              currentToken = '';
            }
          } else {
            currentToken += char;
          }
        }
      }
      if (currentToken.length > 0) {
        tokensList.push(currentToken);
      }

      let method = 'GET';
      let targetUrl = '';
      const headers: Record<string, string> = {};
      let body = '';

      for (let i = 0; i < tokensList.length; i++) {
        const token = tokensList[i];

        if ((token === '-X' || token === '--request') && i + 1 < tokensList.length) {
          method = tokensList[++i].toUpperCase();
        } else if ((token === '-H' || token === '--header') && i + 1 < tokensList.length) {
          const headerStr = tokensList[++i];
          const colonIdx = headerStr.indexOf(':');
          if (colonIdx > 0) {
            const hKey = headerStr.slice(0, colonIdx).trim();
            const hVal = headerStr.slice(colonIdx + 1).trim();
            headers[hKey] = hVal;
          }
        } else if (
          (token === '-d' ||
            token === '--data' ||
            token === '--data-raw' ||
            token === '--data-binary' ||
            token === '--data-ascii') &&
          i + 1 < tokensList.length
        ) {
          body = tokensList[++i];
          if (method === 'GET') method = 'POST';
        } else if (token.startsWith('http://') || token.startsWith('https://')) {
          targetUrl = token;
        } else if (token !== 'curl' && !token.startsWith('-') && !targetUrl) {
          // Check if token looks like a URL without http or with template variable
          if (token.includes('http') || token.includes('.com') || token.includes('/v3/') || token.includes('/api/')) {
            targetUrl = token;
          }
        }
      }

      if (!headers['Accept']) {
        headers['Accept'] = 'application/json';
      }

      setParsedMethod(method);
      if (targetUrl) setParsedUrl(targetUrl);
      setParsedHeaders(headers);
      if (body) setParsedBody(body);
    } catch (e) {
      console.error('Error parsing curl string:', e);
    }
  };

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setCurlCommand(preset.curl);
    parseCurlString(preset.curl);
  };

  const handleExecute = async () => {
    setError(null);
    setLoading(true);
    setExecutionResult(null);

    // If using cURL mode, re-parse
    if (activeTab === 'curl' && curlCommand.trim()) {
      parseCurlString(curlCommand);
    }

    try {
      let finalUrl = parsedUrl;
      // Replace placeholder with active realm
      if (finalUrl.includes('${activeRealm}') || finalUrl.includes('{realmId}')) {
        finalUrl = finalUrl.replace(/\$\{activeRealm\}|\{realmId\}/g, activeRealm);
      }

      let reqHeaders = { ...parsedHeaders };
      // Inject bearer token if not explicitly provided
      if (activeToken && !reqHeaders['Authorization'] && !reqHeaders['authorization']) {
        reqHeaders['Authorization'] = `Bearer ${activeToken}`;
      } else if (reqHeaders['Authorization']?.includes('<ACCESS_TOKEN>') && activeToken) {
        reqHeaders['Authorization'] = `Bearer ${activeToken}`;
      }

      let bodyPayload: any = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(parsedMethod) && parsedBody.trim()) {
        try {
          bodyPayload = JSON.parse(parsedBody);
        } catch {
          bodyPayload = parsedBody;
        }
      }

      const res = await apiFetch<{
        status: number;
        statusText: string;
        url: string;
        method: string;
        durationMs: number;
        data: any;
        error?: string;
      }>('/api/intuit/custom-request', {
        method: 'POST',
        body: JSON.stringify({
          method: parsedMethod,
          url: finalUrl,
          headers: reqHeaders,
          body: bodyPayload,
          accessToken: activeToken,
        }),
      });

      if (!res.ok) {
        setError(res.error || `HTTP ${res.status} Error`);
      }
      setExecutionResult(res.data);
    } catch (e: any) {
      setError(e.message || 'Failed to execute custom cURL request');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (executionResult?.data) {
      navigator.clipboard.writeText(JSON.stringify(executionResult.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-[#79C0FF]/20 border border-[#79C0FF]/40 text-[#79C0FF]">
              <Terminal className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              QuickBooks cURL Terminal & Custom API Runner
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#79C0FF]/15 text-[#79C0FF] border border-[#79C0FF]/30">
              Universal Proxy
            </span>
          </div>
          <p className="text-xs text-[#8B949E] max-w-3xl leading-relaxed">
            Paste any QuickBooks or banking cURL command to execute it directly against the live sandbox. Tokens and headers are automatically formatted and proxied.
          </p>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-4 space-y-2">
        <div className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider flex items-center space-x-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Quick cURL Presets</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363D] rounded-lg text-xs text-[#C9D1D9] hover:text-white transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Connection / Token Bar */}
      <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
              Active Bearer Access Token
            </label>
            <input
              type="password"
              value={customAccessToken || tokens?.access_token || ''}
              onChange={(e) => setCustomAccessToken(e.target.value)}
              placeholder="Paste Bearer Token or authenticate in Step 2..."
              className="w-full px-3 py-1.5 font-mono text-xs bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:border-[#79C0FF]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
              QuickBooks Realm ID
            </label>
            <input
              type="text"
              value={tokens?.realmId || '4620816365'}
              readOnly
              className="w-full px-3 py-1.5 font-mono text-xs bg-[#010409]/60 border border-[#30363D] rounded-lg text-[#8B949E]"
            />
          </div>
        </div>
      </div>

      {/* Main Runner Tabs & Code Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input & Editor */}
        <div className="lg:col-span-7 bg-[#161B22] rounded-xl border border-[#30363D] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'curl' ? 'bg-[#21262d] text-white border border-[#30363D]' : 'text-[#8B949E] hover:text-white'
                }`}
              >
                cURL Command Box
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'manual' ? 'bg-[#21262d] text-white border border-[#30363D]' : 'text-[#8B949E] hover:text-white'
                }`}
              >
                Manual HTTP Builder
              </button>
            </div>

            <button
              id="curl-execute-btn"
              onClick={handleExecute}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Execute cURL</span>
            </button>
          </div>

          {activeTab === 'curl' ? (
            <div className="space-y-2">
              <textarea
                rows={12}
                value={curlCommand}
                onChange={(e) => {
                  setCurlCommand(e.target.value);
                  parseCurlString(e.target.value);
                }}
                placeholder={`curl -X POST "https://sandbox-quickbooks.api.intuit.com/v3/company/4620816365/account?minorversion=75" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"Name":"Operating Cash","AccountType":"Bank","AccountSubType":"Checking"}'`}
                className="w-full p-4 font-mono text-xs bg-[#010409] border border-[#30363D] rounded-xl text-[#79C0FF] focus:outline-none focus:border-[#79C0FF] leading-relaxed resize-y"
              />
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Method</label>
                  <select
                    value={parsedMethod}
                    onChange={(e) => setParsedMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Target URL</label>
                  <input
                    type="text"
                    value={parsedUrl}
                    onChange={(e) => setParsedUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">Request Body (JSON)</label>
                <textarea
                  rows={6}
                  value={parsedBody}
                  onChange={(e) => setParsedBody(e.target.value)}
                  placeholder='{"Name": "My Account", "AccountType": "Bank"}'
                  className="w-full p-3 font-mono text-xs bg-[#010409] border border-[#30363D] rounded-lg text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Response Inspector */}
        <div className="lg:col-span-5 bg-[#161B22] rounded-xl border border-[#30363D] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#8B949E]" />
              <h3 className="text-xs font-semibold text-white">Execution Response</h3>
            </div>

            <div className="flex items-center space-x-2">
              {executionResult?.status && (
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                    executionResult.status >= 200 && executionResult.status < 300
                      ? 'bg-[#238636]/15 text-[#3FB950] border-[#238636]/30'
                      : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                  }`}
                >
                  HTTP {executionResult.status} {executionResult.durationMs ? `(${executionResult.durationMs}ms)` : ''}
                </span>
              )}

              {executionResult?.data && (
                <button
                  onClick={handleCopyResult}
                  className="p-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8B949E] hover:text-white"
                  title="Copy result"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#3FB950]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <div className="p-3 bg-[#010409] border border-[#30363D] rounded-lg font-mono text-[11px] text-[#C9D1D9] overflow-y-auto max-h-96">
            {executionResult ? (
              <pre>{JSON.stringify(executionResult.data || executionResult, null, 2)}</pre>
            ) : (
              <span className="text-[#8B949E]/70 italic">
                No cURL command executed yet. Select a preset or paste a command and click "Execute cURL".
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
