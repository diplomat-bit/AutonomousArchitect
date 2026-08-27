import React, { useState } from 'react';
import { RefreshCw, RotateCcw, Clock, ShieldCheck, CheckCircle2, AlertCircle, Copy, Check, Key } from 'lucide-react';
import { TokenResponse } from '../types';
import { apiFetch } from '../utils/apiClient';

interface Step4RefreshProps {
  tokens: TokenResponse | null;
  clientId: string;
  hasEnvSecret: boolean;
  onTokensRefreshed: (newTokens: TokenResponse) => void;
}

export const Step4Refresh: React.FC<Step4RefreshProps> = ({
  tokens,
  clientId,
  hasEnvSecret,
  onTokensRefreshed,
}) => {
  const [refreshTokenInput, setRefreshTokenInput] = useState('');
  const [clientSecretInput, setClientSecretInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshSuccess, setRefreshSuccess] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeRefreshToken = refreshTokenInput.trim() || tokens?.refresh_token || '';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRefresh = async () => {
    if (!activeRefreshToken) {
      setError('Please provide a refresh token or complete Step 2 first.');
      return;
    }

    setLoading(true);
    setError(null);
    setRefreshSuccess(null);

    try {
      const res = await apiFetch<{ success: boolean; tokens: TokenResponse }>('/api/intuit/refresh-token', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: activeRefreshToken,
          clientIdOverride: clientId,
          clientSecretOverride: clientSecretInput.trim() || undefined,
        }),
      });

      if (!res.ok || !res.data) {
        setError(res.error || 'Token refresh failed');
      } else {
        setRefreshSuccess(res.data.tokens);
        onTokensRefreshed(res.data.tokens);
      }
    } catch (e: any) {
      setError(e.message || 'Error executing token refresh');
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
            4
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Step 04 — Refresh Access Token on Expiration</h2>
            <p className="text-xs text-[#8B949E]">POST to /oauth2/v1/tokens/bearer with grant_type=refresh_token to rotate access tokens</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-[#1f242c] text-[#D29922] border border-[#30363D]">
          grant_type=refresh_token
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Explanation Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-[#0d1117] border border-[#30363D] rounded-lg space-y-1.5">
            <div className="font-semibold text-white flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-[#D29922]" />
              <span>Token Lifespan Architecture</span>
            </div>
            <p className="text-[#8B949E] leading-relaxed">
              Intuit Access Tokens expire strictly after <strong className="text-white">3600 seconds (1 hour)</strong>. Refresh Tokens remain valid for <strong className="text-white">101 days</strong>, and automatically rotate with every refresh request.
            </p>
          </div>

          <div className="p-3.5 bg-[#0d1117] border border-[#30363D] rounded-lg space-y-1.5">
            <div className="font-semibold text-white flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#3FB950]" />
              <span>Automatic Rotation Best Practice</span>
            </div>
            <p className="text-[#8B949E] leading-relaxed">
              Whenever you execute a refresh token call, Intuit returns a fresh Access Token <em>and</em> a new Refresh Token. Always update your persistent store with the new pair.
            </p>
          </div>
        </div>

        {/* Input & Action */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
              Active Refresh Token to Exchange
            </label>
            <input
              type="text"
              id="input-step4-refresh-token"
              value={refreshTokenInput || (tokens?.refresh_token ? tokens.refresh_token : '')}
              onChange={(e) => setRefreshTokenInput(e.target.value)}
              placeholder="Paste a refresh token here..."
              className="w-full px-3 py-2 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:ring-1 focus:ring-[#79C0FF] focus:border-[#79C0FF] placeholder:text-[#8B949E]/50"
            />
          </div>

          {!hasEnvSecret && (
            <div>
              <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
                Client Secret (if not in .env)
              </label>
              <input
                type="password"
                id="input-step4-secret"
                value={clientSecretInput}
                onChange={(e) => setClientSecretInput(e.target.value)}
                placeholder="Client Secret..."
                className="w-full px-3 py-2 text-xs font-mono bg-[#0d1117] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:ring-1 focus:ring-[#79C0FF] focus:border-[#79C0FF] placeholder:text-[#8B949E]/50"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-[#8B949E] font-mono">
              POST https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer
            </div>

            <button
              id="refresh-token-execute-btn"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors border border-[rgba(240,246,252,0.1)]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Refreshing Token...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Execute Token Refresh</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Refresh Failed: </span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Success */}
        {refreshSuccess && (
          <div className="bg-[#0d1117] rounded-xl p-5 border border-[#30363D] text-[#C9D1D9] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#30363D] pb-3 gap-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#3FB950]" />
                <span className="text-sm font-semibold text-white">New Bearer & Refresh Tokens Issued</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#238636]/15 text-[#3FB950] border border-[#238636]/30">
                Fresh 3600s TTL
              </span>
            </div>

            {/* New Access Token */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-[#8B949E]">New Access Token</span>
                <button
                  id="copy-new-access-token-btn"
                  onClick={() => handleCopy(refreshSuccess.access_token, 'new_access')}
                  className="flex items-center space-x-1 text-xs text-[#8B949E] hover:text-white transition-colors"
                >
                  {copiedKey === 'new_access' ? <Check className="w-3 h-3 text-[#3FB950]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'new_access' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-[#010409] p-3 rounded-lg border border-[#30363D] font-mono text-xs text-[#79C0FF] break-all select-all">
                {refreshSuccess.access_token}
              </div>
            </div>

            {/* New Refresh Token */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-[#8B949E]">New Refresh Token</span>
                <button
                  id="copy-new-refresh-token-btn"
                  onClick={() => handleCopy(refreshSuccess.refresh_token, 'new_refresh')}
                  className="flex items-center space-x-1 text-xs text-[#8B949E] hover:text-white transition-colors"
                >
                  {copiedKey === 'new_refresh' ? <Check className="w-3 h-3 text-[#3FB950]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'new_refresh' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-[#010409] p-3 rounded-lg border border-[#30363D] font-mono text-xs text-[#3FB950] break-all select-all">
                {refreshSuccess.refresh_token}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
