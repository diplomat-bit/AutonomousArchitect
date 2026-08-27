import React, { useState, useEffect } from 'react';
import { KeyRound, Shield, Clock, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff, Copy, Check, Lock, RefreshCw, UserCheck, Key, Sparkles } from 'lucide-react';
import { TokenResponse } from '../types';
import { apiFetch } from '../utils/apiClient';

interface Step2TokensProps {
  code: string;
  realmId: string;
  clientId: string;
  redirectUri: string;
  hasEnvSecret: boolean;
  onTokensAcquired: (tokens: TokenResponse) => void;
  onNavigateToPortal?: () => void;
}

export const Step2Tokens: React.FC<Step2TokensProps> = ({
  code: initialCode,
  realmId: initialRealmId,
  clientId,
  redirectUri,
  hasEnvSecret,
  onTokensAcquired,
  onNavigateToPortal,
}) => {
  const [authCode, setAuthCode] = useState(initialCode || '');
  const [realmId, setRealmId] = useState(initialRealmId || '');
  const [clientSecret, setClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  
  // Manual Token Bypass State
  const [manualAccessToken, setManualAccessToken] = useState('');
  const [manualRefreshToken, setManualRefreshToken] = useState('');
  const [manualRealmId, setManualRealmId] = useState('');
  const [showManualSection, setShowManualSection] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenResult, setTokenResult] = useState<TokenResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) setAuthCode(initialCode);
    if (initialRealmId) setRealmId(initialRealmId);
  }, [initialCode, initialRealmId]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyManualTokens = () => {
    if (!manualAccessToken.trim()) {
      setError('Please provide at least an Access Token (Bearer or ya29...).');
      return;
    }
    const injectedTokens: TokenResponse = {
      access_token: manualAccessToken.trim(),
      refresh_token: manualRefreshToken.trim() || 'rt_manual_dev_session',
      token_type: 'Bearer',
      expires_in: 3600,
      x_refresh_token_expires_in: 8726400,
      realmId: manualRealmId.trim() || realmId.trim() || '9341453986873523',
    };
    setTokenResult(injectedTokens);
    onTokensAcquired(injectedTokens);
    setError(null);
  };

  const handleExchange = async () => {
    if (!authCode.trim()) {
      setError('Please provide an authorization code from Step 1.');
      return;
    }

    if (!hasEnvSecret && !clientSecret.trim()) {
      setError('Please enter your Intuit Client Secret (or configure INTUIT_CLIENT_SECRET in .env).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch<{ success: boolean; tokens: TokenResponse }>('/api/intuit/exchange-token', {
        method: 'POST',
        body: JSON.stringify({
          code: authCode.trim(),
          realmId: realmId.trim() || undefined,
          clientIdOverride: clientId,
          redirectUriOverride: redirectUri,
          clientSecretOverride: clientSecret.trim() || undefined,
        }),
      });

      if (!res.ok || !res.data) {
        setError(res.error || 'Token exchange failed. If deployed to Vercel, make sure INTUIT_CLIENT_SECRET is set in Vercel Environment Variables.');
      } else {
        setTokenResult(res.data.tokens);
        onTokensAcquired(res.data.tokens);
      }
    } catch (e: any) {
      setError(e.message || 'Network error during token exchange');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#30363D] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[#30363D] flex items-center justify-between bg-[#161B22]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#238636] text-white font-bold text-sm shadow-xs">
            2
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Step 02 — Exchange Code for Bearer Tokens</h2>
            <p className="text-xs text-[#8B949E]">POST to /oauth2/v1/tokens/bearer with Basic Auth Header to receive access & refresh tokens</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-[#1f242c] text-[#79C0FF] border border-[#30363D]">
          POST /oauth2/v1/tokens/bearer
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
              Authorization Code (from Step 1)
            </label>
            <input
              type="text"
              id="input-step2-code"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="e.g. AB11708..."
              className="w-full px-3 py-2 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:ring-1 focus:ring-[#79C0FF] focus:border-[#79C0FF] placeholder:text-[#8B949E]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
              Sandbox Company Realm ID
            </label>
            <input
              type="text"
              id="input-step2-realmid"
              value={realmId}
              onChange={(e) => setRealmId(e.target.value)}
              placeholder="e.g. 4620816365..."
              className="w-full px-3 py-2 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:ring-1 focus:ring-[#79C0FF] focus:border-[#79C0FF] placeholder:text-[#8B949E]/50"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-[#8B949E]" />
                <span>Intuit Client Secret</span>
              </label>
              {hasEnvSecret ? (
                <span className="text-[11px] font-medium text-[#3FB950] bg-[#238636]/15 px-2 py-0.5 rounded border border-[#238636]/30 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Configured in Server/Vercel Env</span>
                </span>
              ) : (
                <span className="text-[11px] font-medium text-[#D29922] bg-[#D29922]/15 px-2 py-0.5 rounded border border-[#D29922]/30 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Manual Input or Vercel Env Required</span>
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                id="input-step2-secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder={hasEnvSecret ? 'Secret loaded from environment (or paste here to override)' : 'Paste your Intuit Client Secret here...'}
                className="w-full px-3 py-2 pr-10 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:ring-1 focus:ring-[#79C0FF] focus:border-[#79C0FF] placeholder:text-[#8B949E]/50"
              />
              <button
                type="button"
                id="toggle-secret-visibility-btn"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2.5 top-2.5 text-[#8B949E] hover:text-white"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#8B949E]">
              💡 <strong>Tip:</strong> You can paste your Client Secret directly above to execute the exchange instantly, even if Vercel has not completed a redeploy after adding environment variables.
            </p>
          </div>
        </div>

        {/* Exchange Action Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[#8B949E]">
            Intuit tokens expire in <span className="font-semibold text-white">60 minutes</span> (Access Token) & <span className="font-semibold text-white">101 days</span> (Refresh Token).
          </div>

          <button
            id="exchange-token-btn"
            onClick={handleExchange}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors border border-[rgba(240,246,252,0.1)]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Exchanging with Intuit...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5" />
                <span>Exchange Code for Tokens</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>
        </div>

        {/* Manual Direct Token Ingestion / Dev Portal Bypass */}
        <div className="pt-3 border-t border-[#30363D]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowManualSection(!showManualSection)}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{showManualSection ? '▲ Hide Direct Token Bypass' : '▼ Already have Bearer Tokens or want to use Service Account Tokens? Click here'}</span>
            </button>

            {onNavigateToPortal && (
              <button
                type="button"
                onClick={onNavigateToPortal}
                className="text-xs bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-200 px-2.5 py-1 rounded-md font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Open Dev Portal & Token Mint</span>
              </button>
            )}
          </div>

          {showManualSection && (
            <div className="mt-3 p-4 bg-[#0d1117] rounded-xl border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-400" /> Direct Bearer Token Injection
                </span>
                <span className="text-[10px] text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                  Instant Bypass
                </span>
              </div>
              <p className="text-[11px] text-[#8B949E]">
                Paste an existing Intuit Bearer Token, Google Service Account Token (<code>ya29...</code>), or Sandbox test token to instantly activate API calling without re-authenticating:
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={manualAccessToken}
                  onChange={(e) => setManualAccessToken(e.target.value)}
                  placeholder="Paste Access Token (Bearer eyJ... or ya29...)"
                  className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-emerald-300 focus:border-purple-500 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={manualRefreshToken}
                    onChange={(e) => setManualRefreshToken(e.target.value)}
                    placeholder="Optional: Refresh Token"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:border-purple-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={manualRealmId}
                    onChange={(e) => setManualRealmId(e.target.value)}
                    placeholder="Optional: Sandbox Realm ID (e.g. 9341453986873523)"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyManualTokens}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Apply & Activate Injected Tokens
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Exchange Error: </span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Token Result Display */}
        {tokenResult && (
          <div className="bg-[#0d1117] rounded-xl p-5 border border-[#30363D] text-[#C9D1D9] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#30363D] pb-3 gap-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#3FB950]" />
                <span className="text-sm font-semibold text-white">OAuth 2.0 Tokens Successfully Acquired</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#238636]/15 text-[#3FB950] border border-[#238636]/30 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Expires in: {tokenResult.expires_in}s (~1 hr)</span>
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1f242c] text-[#79C0FF] border border-[#30363D]">
                  Type: {tokenResult.token_type}
                </span>
              </div>
            </div>

            {/* Access Token */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-[#8B949E]">Access Token (Bearer)</span>
                <button
                  id="copy-access-token-btn"
                  onClick={() => handleCopy(tokenResult.access_token, 'access')}
                  className="flex items-center space-x-1 text-xs text-[#8B949E] hover:text-white transition-colors"
                >
                  {copiedKey === 'access' ? <Check className="w-3 h-3 text-[#3FB950]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'access' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-[#010409] p-3 rounded-lg border border-[#30363D] font-mono text-xs text-[#79C0FF] break-all select-all">
                {tokenResult.access_token}
              </div>
            </div>

            {/* Refresh Token */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-[#8B949E]">Refresh Token (Lifespan: 101 days)</span>
                <button
                  id="copy-refresh-token-btn"
                  onClick={() => handleCopy(tokenResult.refresh_token, 'refresh')}
                  className="flex items-center space-x-1 text-xs text-[#8B949E] hover:text-white transition-colors"
                >
                  {copiedKey === 'refresh' ? <Check className="w-3 h-3 text-[#3FB950]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'refresh' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-[#010409] p-3 rounded-lg border border-[#30363D] font-mono text-xs text-[#3FB950] break-all select-all">
                {tokenResult.refresh_token}
              </div>
            </div>

            {/* OpenID ID Token / Decoded Claims */}
            {tokenResult.decodedIdToken && (
              <div className="space-y-1.5 pt-2 border-t border-[#30363D]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-[#8B949E] flex items-center space-x-1">
                    <UserCheck className="w-3 h-3 text-[#79C0FF]" />
                    <span>OpenID Connect Claims (from id_token)</span>
                  </span>
                </div>
                <div className="bg-[#010409] p-3 rounded-lg border border-[#30363D] font-mono text-xs text-[#C9D1D9]">
                  <pre className="overflow-x-auto text-[11px] text-[#79C0FF]">{JSON.stringify(tokenResult.decodedIdToken, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
