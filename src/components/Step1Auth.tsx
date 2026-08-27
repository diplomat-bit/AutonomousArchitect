import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, Check, ArrowRight, Sparkles, Key, Globe, ShieldCheck, Link2 } from 'lucide-react';
import { AuthUrlResponse } from '../types';
import { apiFetch } from '../utils/apiClient';

interface Step1AuthProps {
  clientId: string;
  redirectUri: string;
  onCodeAcquired: (code: string, realmId: string, state?: string) => void;
}

export const Step1Auth: React.FC<Step1AuthProps> = ({
  clientId: defaultClientId,
  redirectUri: defaultRedirectUri,
  onCodeAcquired,
}) => {
  const [clientId, setClientId] = useState(defaultClientId || 'ABySM9kH7sQ0wfw8Mb3SB30DqWCRQNG6cDQMQVf5gSMvugU5n8');
  const [redirectUri, setRedirectUri] = useState(defaultRedirectUri || 'https://developer.intuit.com/app/developer/quickstart');
  const [scopes, setScopes] = useState('com.intuit.quickbooks.accounting com.intuit.quickbooks.payment openid profile email phone address');
  
  const [authData, setAuthData] = useState<AuthUrlResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  
  // Callback parsing
  const [pastedCallbackUrl, setPastedCallbackUrl] = useState('');
  const [parsedCode, setParsedCode] = useState('');
  const [parsedRealmId, setParsedRealmId] = useState('');
  const [parsedState, setParsedState] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState(false);

  useEffect(() => {
    if (defaultClientId) setClientId(defaultClientId);
    if (defaultRedirectUri) setRedirectUri(defaultRedirectUri);
  }, [defaultClientId, defaultRedirectUri]);

  // Generate Auth URL
  const generateAuthUrl = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<AuthUrlResponse>('/api/intuit/auth-url', {
        method: 'POST',
        body: JSON.stringify({
          customClientId: clientId,
          customRedirectUri: redirectUri,
          customScopes: scopes,
        }),
      });

      if (res.ok && res.data) {
        setAuthData(res.data);
      } else {
        // Safe fallback URL calculation if serverless cold start or static deployment
        const fallbackState = Math.random().toString(36).substring(2, 15);
        const params = new URLSearchParams({
          client_id: clientId,
          response_type: 'code',
          scope: scopes,
          redirect_uri: redirectUri,
          state: fallbackState,
        });
        setAuthData({
          authUrl: `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`,
          state: fallbackState,
          clientId: clientId,
          redirectUri: redirectUri,
          scopes: scopes,
        });
      }
    } catch (e) {
      console.error('Auth URL generation error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Initial auto-generation
  useEffect(() => {
    generateAuthUrl();
  }, []);

  const handleCopyUrl = () => {
    if (authData?.authUrl) {
      navigator.clipboard.writeText(authData.authUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  // Handle parsing pasted callback URL or query string
  const handleParseCallback = (input: string) => {
    setPastedCallbackUrl(input);
    setParseError(null);
    setParseSuccess(false);

    if (!input.trim()) {
      setParsedCode('');
      setParsedRealmId('');
      setParsedState('');
      return;
    }

    try {
      let queryString = input.trim();
      if (queryString.includes('?')) {
        queryString = queryString.split('?')[1];
      }
      
      const searchParams = new URLSearchParams(queryString);
      const code = searchParams.get('code');
      const realmId = searchParams.get('realmId');
      const state = searchParams.get('state');

      if (code) {
        setParsedCode(code);
        setParsedRealmId(realmId || '');
        setParsedState(state || '');
        setParseSuccess(true);
        onCodeAcquired(code, realmId || '', state || '');
      } else if (input.startsWith('AB') && input.length > 20) {
        // Direct code entered
        setParsedCode(input.trim());
        setParseSuccess(true);
        onCodeAcquired(input.trim(), parsedRealmId || '', parsedState || '');
      } else {
        setParseError('No `code` query parameter found in the input. Paste the full redirected URL from Intuit.');
      }
    } catch (e: any) {
      setParseError('Could not parse input. Please paste the full URL or query string.');
    }
  };

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#30363D] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[#30363D] flex items-center justify-between bg-[#161B22]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#238636] text-white font-bold text-sm shadow-xs">
            1
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Step 01 — Get Authorization Code</h2>
            <p className="text-xs text-[#8B949E]">Redirect user to Intuit OAuth 2.0 endpoint for sandbox consent & company selection</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-[#238636]/15 text-[#3FB950] border border-[#238636]/30">
          authorization_code
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
              Client ID
            </label>
            <input
              type="text"
              id="input-step1-client-id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:ring-1 focus:ring-[#79C0FF] focus:border-[#79C0FF] placeholder:text-[#8B949E]/50"
              placeholder="Your Intuit App Client ID"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
              Redirect URI
            </label>
            <input
              type="text"
              id="input-step1-redirect-uri"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:ring-1 focus:ring-[#79C0FF] focus:border-[#79C0FF] placeholder:text-[#8B949E]/50"
              placeholder="https://developer.intuit.com/app/developer/quickstart"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
              OAuth 2.0 Scopes
            </label>
            <input
              type="text"
              id="input-step1-scopes"
              value={scopes}
              onChange={(e) => setScopes(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:ring-1 focus:ring-[#79C0FF] focus:border-[#79C0FF]"
            />
            <p className="text-[11px] text-[#8B949E] mt-1.5">
              Includes Accounting (<code className="text-[#79C0FF] font-mono">com.intuit.quickbooks.accounting</code>), Payments (<code className="text-[#79C0FF] font-mono">com.intuit.quickbooks.payment</code>), and OpenID Connect identity scopes.
            </p>
          </div>
        </div>

        {/* Generated URL Box */}
        {authData && (
          <div className="bg-[#0d1117] rounded-lg p-4 border border-[#30363D] text-[#C9D1D9] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#3FB950]">
                  Constructed Authorize URL
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#21262d] text-[#C9D1D9] border border-[#30363D]">
                  state: {authData.state}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  id="copy-auth-url-btn"
                  onClick={handleCopyUrl}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-xs text-[#C9D1D9] border border-[#30363D] transition-colors"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-[#3FB950]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                </button>

                <a
                  id="launch-intuit-auth-btn"
                  href={authData.authUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#238636] hover:bg-[#2ea043] text-xs font-medium text-white shadow-xs transition-colors border border-[rgba(240,246,252,0.1)]"
                >
                  <span>Launch Intuit Consent</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="bg-[#010409] p-3 rounded border border-[#30363D] overflow-x-auto">
              <code className="text-xs font-mono text-[#79C0FF] break-all leading-relaxed select-all">
                {authData.authUrl}
              </code>
            </div>
          </div>
        )}

        {/* Callback Capture & Parse Area */}
        <div className="border border-[#30363D] bg-[#0d1117] rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xs font-semibold text-white flex items-center space-x-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#3FB950]" />
                <span>Captured Intuit Redirect (Callback URL or Code)</span>
              </h3>
              <p className="text-xs text-[#8B949E] mt-0.5">
                After you approve consent on Intuit, copy the redirected URL from your browser address bar and paste it below:
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              id="input-pasted-callback"
              value={pastedCallbackUrl}
              onChange={(e) => handleParseCallback(e.target.value)}
              placeholder="e.g. https://developer.intuit.com/app/developer/quickstart?code=AB117...&state=...&realmId=4620816365..."
              className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:ring-1 focus:ring-[#3FB950] focus:border-[#238636] placeholder:text-[#8B949E]/50"
            />

            {parseError && (
              <p className="text-xs text-rose-400 font-medium">⚠️ {parseError}</p>
            )}

            {parseSuccess && (
              <div className="p-3 bg-[#161B22] rounded-lg border border-[#238636]/40 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#3FB950]">
                  <Check className="w-4 h-4 text-[#3FB950]" />
                  <span>Authorization Code & Sandbox Company extracted! Ready for Step 2.</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-[#0d1117] p-2 rounded border border-[#30363D] overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-[#8B949E] block">Code:</span>
                    <span className="text-[#79C0FF] truncate block">{parsedCode}</span>
                  </div>
                  <div className="bg-[#0d1117] p-2 rounded border border-[#30363D] overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-[#8B949E] block">Company Realm ID:</span>
                    <span className="text-[#3FB950] font-bold block">{parsedRealmId || 'None'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
