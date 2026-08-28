import React, { useState } from 'react';
import { Zap, Download, RefreshCw, CheckCircle2, AlertCircle, Building2, Users, CreditCard, FileText, Database, Shield, Landmark, Sparkles, User, Copy, Check, FileCode, ArrowDownToLine } from 'lucide-react';
import { TokenResponse } from '../types';
import { apiFetch } from '../utils/apiClient';

interface AutonomousSyncProps {
  tokens: TokenResponse | null;
  realmId: string;
}

export const AutonomousSync: React.FC<AutonomousSyncProps> = ({ tokens, realmId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<any | null>(null);
  const [customToken, setCustomToken] = useState('');
  const [customRealm, setCustomRealm] = useState(realmId || tokens?.realmId || '');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const tokenToUse = customToken.trim() || tokens?.access_token || '';
  const realmToUse = customRealm.trim() || tokens?.realmId || '';

  const handlePullAll = async () => {
    if (!tokenToUse) {
      setError('Missing access token. Please complete Step 2 or enter a Bearer token.');
      return;
    }
    if (!realmToUse) {
      setError('Missing Realm ID / Company ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setSyncResult(null);

    try {
      const res = await apiFetch<any>('/api/intuit/pull-all', {
        method: 'POST',
        body: JSON.stringify({
          accessToken: tokenToUse,
          realmId: realmToUse,
        }),
      });

      if (!res.ok || !res.data) {
        setError(res.error || 'Failed to pull QuickBooks data');
      } else {
        setSyncResult(res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Network error during autonomous sync');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    if (!syncResult?.data) return null;
    const d = syncResult.data;
    switch (activeCategoryTab) {
      case 'companyInfo': return d.companyInfo;
      case 'accounts': return d.accounts;
      case 'modernTreasuryAccounts': return d.modernTreasuryAccounts;
      case 'bankAccounts': return d.bankAccounts;
      case 'cards': return d.cards;
      case 'customers': return d.customers;
      case 'invoices': return d.invoices;
      case 'payments': return d.payments;
      case 'salesReceipts': return d.salesReceipts;
      case 'userProfile': return d.userProfile;
      case 'all': default: return syncResult;
    }
  };

  const handleDownload = (format: 'json' | 'txt', fullPayload: boolean = true) => {
    if (!syncResult) return;
    const payload = fullPayload || activeCategoryTab === 'all' ? syncResult : getFilteredData();
    const jsonString = JSON.stringify(payload, null, 2);
    const mimeType = format === 'txt' ? 'text/plain;charset=utf-8' : 'application/json;charset=utf-8';
    const blob = new Blob([jsonString], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const company = (syncResult.summary?.companyName || 'quickbooks_sync').replace(/[^a-zA-Z0-9_-]/g, '_');
    const scopeTag = fullPayload || activeCategoryTab === 'all' ? 'full_spectrum' : activeCategoryTab;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    link.href = url;
    link.download = `qbo_sync_${scopeTag}_${company}_${timestamp}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = async () => {
    if (!syncResult) return;
    const payload = activeCategoryTab === 'all' ? syncResult : getFilteredData();
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#30363D] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[#30363D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-[#161B22] via-[#1f242c] to-[#161B22]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#238636] to-[#2ea043] text-white shadow-md">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white flex items-center space-x-2">
              <span>Autonomous Data Pull & Full Sync Engine</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-[#238636]/20 text-[#3FB950] border border-[#238636]/30">
                Full Spectrum Sync
              </span>
            </h2>
            <p className="text-xs text-[#8B949E]">
              Autonomously pull and aggregate every single record from your QuickBooks Sandbox (Company Info, Accounts, Bank Accounts, Cards, Customers, Invoices, Payments, Receipts, OpenID Profile).
            </p>
          </div>
        </div>

        <button
          id="autonomous-pull-all-btn"
          onClick={handlePullAll}
          disabled={loading}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-bold shadow-lg transition-all transform hover:scale-[1.02] border border-[#3FB950]/40 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Pulling Everything...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Pull All QuickBooks Data Now</span>
            </>
          )}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Credentials Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0d1117] p-4 rounded-xl border border-[#30363D]">
          <div>
            <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
              Access Token (Bearer)
            </label>
            <input
              type="text"
              value={customToken}
              onChange={(e) => setCustomToken(e.target.value)}
              placeholder={tokens?.access_token ? 'Using active session token (or paste override)...' : 'Paste access token...'}
              className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:border-[#79C0FF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
              Company / Realm ID
            </label>
            <input
              type="text"
              value={customRealm}
              onChange={(e) => setCustomRealm(e.target.value)}
              placeholder="e.g. 9341457771341574"
              className="w-full px-3 py-2 text-xs font-mono bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:border-[#79C0FF]"
            />
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sync Result Dashboard */}
        {syncResult && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#30363D]">
              <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-[#3FB950]" />
                <span>Autonomous Sync Successful — Company: <span className="text-[#79C0FF]">{syncResult.summary?.companyName}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs font-mono text-[#8B949E] mr-2">
                  Pulled at: {new Date(syncResult.pulledAt).toLocaleTimeString()}
                </div>
                {/* Header Direct Download Buttons */}
                <button
                  id="btn-download-full-txt"
                  onClick={() => handleDownload('txt', true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-medium border border-[#30363D] transition-colors cursor-pointer"
                  title="Download complete payload as a plain text file"
                >
                  <FileText className="w-3.5 h-3.5 text-[#79C0FF]" />
                  <span>Download .txt</span>
                </button>
                <button
                  id="btn-download-full-json"
                  onClick={() => handleDownload('json', true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold shadow-xs border border-[#3FB950]/30 transition-colors cursor-pointer"
                  title="Download complete payload as a JSON file"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid across all primary entity categories */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363D] text-center space-y-0.5">
                <div className="text-[10px] font-semibold text-[#8B949E] uppercase">Company Profile</div>
                <div className="text-base font-bold text-[#3FB950]">1</div>
                <div className="text-[10px] text-[#8B949E] truncate">QBO CompanyInfo</div>
              </div>

              <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363D] text-center space-y-0.5">
                <div className="text-[10px] font-semibold text-[#8B949E] uppercase">QBO Accounts</div>
                <div className="text-base font-bold text-[#79C0FF]">{syncResult.summary?.accountsCount || 0}</div>
                <div className="text-[10px] text-[#8B949E] truncate">Chart of Accounts</div>
              </div>

              <div className="p-3 bg-[#0d1117] rounded-xl border border-[#238636]/60 bg-[#238636]/10 text-center space-y-0.5">
                <div className="text-[10px] font-semibold text-[#3FB950] uppercase">Modern Treasury</div>
                <div className="text-base font-bold text-[#3FB950]">{syncResult.summary?.modernTreasuryAccountsSynced || syncResult.data?.modernTreasuryAccounts?.length || 0}</div>
                <div className="text-[10px] text-[#3FB950] truncate font-medium">Auto-Created Accounts</div>
              </div>

              <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363D] text-center space-y-0.5">
                <div className="text-[10px] font-semibold text-[#8B949E] uppercase">Bank Accounts</div>
                <div className="text-base font-bold text-[#D29922]">{syncResult.summary?.bankAccountsCount || 0}</div>
                <div className="text-[10px] text-[#8B949E] truncate">Customer Banks</div>
              </div>

              <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363D] text-center space-y-0.5">
                <div className="text-[10px] font-semibold text-[#8B949E] uppercase">Credit Cards</div>
                <div className="text-base font-bold text-purple-400">{syncResult.summary?.cardsCount || 0}</div>
                <div className="text-[10px] text-[#8B949E] truncate">Payments Card Entity</div>
              </div>

              <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363D] text-center space-y-0.5">
                <div className="text-[10px] font-semibold text-[#8B949E] uppercase">Customers</div>
                <div className="text-base font-bold text-emerald-400">{syncResult.summary?.customersCount || 0}</div>
                <div className="text-[10px] text-[#8B949E] truncate">Client Records</div>
              </div>

              <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363D] text-center space-y-0.5">
                <div className="text-[10px] font-semibold text-[#8B949E] uppercase">Invoices</div>
                <div className="text-base font-bold text-indigo-400">{syncResult.summary?.invoicesCount || 0}</div>
                <div className="text-[10px] text-[#8B949E] truncate">Receivables</div>
              </div>

              <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363D] text-center space-y-0.5">
                <div className="text-[10px] font-semibold text-[#8B949E] uppercase">Payments</div>
                <div className="text-base font-bold text-blue-400">{syncResult.summary?.paymentsCount || 0}</div>
                <div className="text-[10px] text-[#8B949E] truncate">Collected Charges</div>
              </div>

              <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363D] text-center space-y-0.5">
                <div className="text-[10px] font-semibold text-[#8B949E] uppercase">Sales Receipts</div>
                <div className="text-base font-bold text-teal-400">{syncResult.summary?.salesReceiptsCount || 0}</div>
                <div className="text-[10px] text-[#8B949E] truncate">Receipt Entries</div>
              </div>

              <div className="p-3 bg-[#0d1117] rounded-xl border border-[#30363D] text-center space-y-0.5">
                <div className="text-[10px] font-semibold text-[#8B949E] uppercase">User Profile</div>
                <div className="text-base font-bold text-amber-400">{syncResult.summary?.userProfileStatus || 'OK'}</div>
                <div className="text-[10px] text-[#8B949E] truncate">OpenID Connect</div>
              </div>
            </div>

            {/* Entity Category Filter Tabs & Download Controls */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
                  Inspect Pulled Category Payload
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-xs text-[#C9D1D9] border border-[#30363D] transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#3FB950]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy View'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload('txt', false)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-xs text-[#79C0FF] border border-[#30363D] transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download View (.txt)</span>
                  </button>
                  <button
                    onClick={() => handleDownload('json', false)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-xs text-[#3FB950] border border-[#30363D] transition-colors cursor-pointer font-medium"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Download View (.json)</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 p-1 bg-[#0d1117] rounded-xl border border-[#30363D]">
                {[
                  { id: 'all', label: 'Full Aggregated JSON' },
                  { id: 'companyInfo', label: `Company Info` },
                  { id: 'accounts', label: `QBO Accounts (${syncResult.summary?.accountsCount || 0})` },
                  { id: 'modernTreasuryAccounts', label: `Modern Treasury (${syncResult.summary?.modernTreasuryAccountsSynced || syncResult.data?.modernTreasuryAccounts?.length || 0})` },
                  { id: 'bankAccounts', label: `Bank Accounts (${syncResult.summary?.bankAccountsCount || 0})` },
                  { id: 'cards', label: `Credit Cards (${syncResult.summary?.cardsCount || 0})` },
                  { id: 'customers', label: `Customers (${syncResult.summary?.customersCount || 0})` },
                  { id: 'invoices', label: `Invoices (${syncResult.summary?.invoicesCount || 0})` },
                  { id: 'payments', label: `Payments (${syncResult.summary?.paymentsCount || 0})` },
                  { id: 'salesReceipts', label: `Sales Receipts (${syncResult.summary?.salesReceiptsCount || 0})` },
                  { id: 'userProfile', label: 'OpenID Profile' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveCategoryTab(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeCategoryTab === t.id
                        ? 'bg-[#238636] text-white font-semibold'
                        : 'text-[#8B949E] hover:text-white hover:bg-[#21262d]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Detailed Payload Viewer */}
              <pre className="p-4 rounded-xl bg-[#010409] border border-[#30363D] text-[#79C0FF] font-mono text-xs overflow-x-auto max-h-96 selection:bg-[#238636]/30">
                {JSON.stringify(getFilteredData(), null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

