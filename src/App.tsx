import React, { useState, useEffect } from 'react';
import { Navbar, MainTabType } from './components/Navbar';
import { Step1Auth } from './components/Step1Auth';
import { Step2Tokens } from './components/Step2Tokens';
import { Step3Apis } from './components/Step3Apis';
import { Step4Refresh } from './components/Step4Refresh';
import { AutonomousSync } from './components/AutonomousSync';
import { CodeGenerator } from './components/CodeGenerator';
import { ScopeReference } from './components/ScopeReference';
import { VercelGuideModal } from './components/VercelGuideModal';
import { AiBankingIngest } from './components/AiBankingIngest';
import QuickBooksCommandBridge from './components/QuickBooksCommandBridge';
import { QuickBooksFormBuilder } from './components/QuickBooksFormBuilder';
import DeveloperPortal from './components/DeveloperPortal';
import DocumentationHub from './components/DocumentationHub';
import { CustomCurlExecutor } from './components/CustomCurlExecutor';
import ChaseLoyaltyConsole from './components/ChaseLoyaltyConsole';
import { FinicityConsole } from './components/FinicityConsole';
import { ModernTreasuryConsole } from './components/ModernTreasuryConsole';
import { AutonomousBridgeLedger } from './components/AutonomousBridgeLedger';
import { IntuitConfig, TokenResponse } from './types';
import { apiFetch } from './utils/apiClient';
import { CheckCircle2, ChevronRight, RefreshCw, Trash2, Shield, PlayCircle, Code2, BookOpen, Layers, Zap, Sparkles, Plus, Terminal, Key } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('runner');
  const [config, setConfig] = useState<IntuitConfig | null>(null);
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
  
  // Workflow States
  const [authCode, setAuthCode] = useState('');
  const [realmId, setRealmId] = useState('');
  const [csrfState, setCsrfState] = useState('');
  const [tokens, setTokens] = useState<TokenResponse | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [ingestPayload, setIngestPayload] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await apiFetch<IntuitConfig>('/api/intuit/config');
      if (res.ok && res.data) {
        setConfig(res.data);
        if (res.data.activeTokens?.realmId) {
          setRealmId(res.data.activeTokens.realmId);
        }
      }
    } catch (e) {
      console.error('Error fetching config:', e);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleCodeAcquired = (code: string, parsedRealm: string, state?: string) => {
    setAuthCode(code);
    if (parsedRealm) setRealmId(parsedRealm);
    if (state) setCsrfState(state);
    setCurrentStep(2);
  };

  const handleTokensAcquired = (tokenData: TokenResponse) => {
    setTokens(tokenData);
    if (tokenData.realmId) setRealmId(tokenData.realmId);
    setCurrentStep(3);
    fetchConfig();
  };

  const handleTokensRefreshed = (newTokens: TokenResponse) => {
    setTokens((prev) => (prev ? { ...prev, ...newTokens } : newTokens));
    fetchConfig();
  };

  const handleClearSession = async () => {
    try {
      await apiFetch('/api/intuit/clear-session', { method: 'POST' });
      setAuthCode('');
      setTokens(null);
      setCurrentStep(1);
      fetchConfig();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#C9D1D9] flex flex-col font-sans selection:bg-[#238636]/30 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        onRefreshConfig={fetchConfig}
        onOpenVercelGuide={() => setIsVercelModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Banner / Overview */}
        <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-white tracking-tight">
                QuickBooks Full-Spectrum API & AI Banking Hub
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#238636]/15 text-[#3FB950] border border-[#238636]/30">
                SANDBOX READY
              </span>
            </div>
            <p className="text-xs text-[#8B949E] max-w-3xl leading-relaxed">
              Create accounts, run cURLs, parse bank statement JSON with Gemini AI into QuickBooks Chart of Accounts, manage customers & ACH bank accounts, and execute sandbox transactions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('portal')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition-all border border-purple-400/40"
            >
              <Key className="w-4 h-4 text-purple-200" />
              <span>Developer Portal & Token Mint</span>
            </button>
            <button
              onClick={() => setIsVercelModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-[#30363D] bg-[#000000] hover:bg-[#21262d] text-white text-xs font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 1155 1000">
                <path d="m577.3 0 577.4 1000H0z" />
              </svg>
              <span>Vercel Fix Guide</span>
            </button>
            {tokens && (
              <button
                id="clear-session-btn"
                onClick={handleClearSession}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-[#30363D] hover:border-rose-500/50 bg-[#21262d] hover:bg-rose-950/40 text-[#C9D1D9] hover:text-rose-300 text-xs font-medium transition-colors"
                title="Clear current session tokens"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Tokens</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Launch Control Hub */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setActiveTab('portal')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
              activeTab === 'portal'
                ? 'bg-purple-950/40 border-purple-500 text-white shadow-sm'
                : 'bg-[#161B22] border-[#30363D] hover:border-purple-500/50 text-[#C9D1D9]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Key className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono font-bold text-purple-300 px-1.5 py-0.5 rounded bg-purple-500/20">
                MINT TOKENS
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Developer Portal</p>
              <p className="text-[11px] text-[#8B949E]">Upload SA JSON & ya29... tokens</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('bridge')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
              activeTab === 'bridge'
                ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                : 'bg-[#161B22] border-[#30363D] hover:border-emerald-500/50 text-[#C9D1D9]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Zap className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-500/20">
                LEDGER
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Command Bridge</p>
              <p className="text-[11px] text-[#8B949E]">Execute Intuit & GCP Actions</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('runner')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
              activeTab === 'runner'
                ? 'bg-blue-950/40 border-blue-500 text-white shadow-sm'
                : 'bg-[#161B22] border-[#30363D] hover:border-blue-500/50 text-[#C9D1D9]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <PlayCircle className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono font-bold text-blue-300 px-1.5 py-0.5 rounded bg-blue-500/20">
                STEP-BY-STEP
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">OAuth 2.0 Runner</p>
              <p className="text-[11px] text-[#8B949E]">Intuit Connect & Exchange</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('ai-ingest')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
              activeTab === 'ai-ingest'
                ? 'bg-amber-950/40 border-amber-500 text-white shadow-sm'
                : 'bg-[#161B22] border-[#30363D] hover:border-amber-500/50 text-[#C9D1D9]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/20">
                GEMINI AI
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">AI Banking Ingest</p>
              <p className="text-[11px] text-[#8B949E]">Raw Banking JSON to Ledger</p>
            </div>
          </button>
        </div>

        {/* Tab: Automated QBO-Banking Bridge & Technical Linking Ledger */}
        {activeTab === 'auto-bridge' && (
          <div id="section-auto-bridge-ledger">
            <AutonomousBridgeLedger
              realmId={realmId || config?.activeTokens.realmId || undefined}
              hasTokens={Boolean(config?.activeTokens.hasAccessToken || tokens?.access_token)}
            />
          </div>
        )}

        {/* Tab 0: Autonomous Ledger Command Bridge */}
        {activeTab === 'bridge' && (
          <div id="section-command-bridge">
            <QuickBooksCommandBridge
              tokens={tokens ? { accessToken: tokens.accessToken || (tokens as any).access_token, realmId: realmId || tokens.realmId || null } : undefined}
            />
          </div>
        )}

        {/* Tab 1: Interactive Runner */}
        {activeTab === 'runner' && (
          <div className="space-y-6">
            {/* Step Progression Ribbon */}
            <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-2 shadow-xs overflow-x-auto">
              <div className="flex items-center min-w-[600px] justify-between gap-2">
                {[
                  { num: 1, label: 'Get Auth Code', active: currentStep === 1, done: Boolean(authCode) },
                  { num: 2, label: 'Exchange Tokens', active: currentStep === 2, done: Boolean(tokens?.access_token) },
                  { num: 3, label: 'Call Sandbox APIs', active: currentStep === 3, done: Boolean(tokens?.access_token) },
                  { num: 4, label: 'Refresh Token', active: currentStep === 4, done: false },
                ].map((s) => (
                  <button
                    key={s.num}
                    id={`step-nav-btn-${s.num}`}
                    onClick={() => setCurrentStep(s.num as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      currentStep === s.num
                        ? 'bg-[#238636] text-white font-semibold shadow-xs border border-[#3FB950]/30'
                        : s.done
                        ? 'text-[#3FB950] bg-[#238636]/15 hover:bg-[#238636]/25 border border-[#238636]/30'
                        : 'text-[#8B949E] hover:bg-[#21262d] border border-transparent'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      currentStep === s.num
                        ? 'bg-white text-[#161B22]'
                        : s.done
                        ? 'bg-[#238636] text-white'
                        : 'bg-[#21262d] text-[#8B949E] border border-[#30363D]'
                    }`}>
                      {s.done ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : s.num}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1: Authorization Code */}
            <div id="section-step-1">
              <Step1Auth
                clientId={config?.clientId || 'ABySM9kH7sQ0wfw8Mb3SB30DqWCRQNG6cDQMQVf5gSMvugU5n8'}
                redirectUri={config?.redirectUri || 'https://developer.intuit.com/app/developer/quickstart'}
                onCodeAcquired={handleCodeAcquired}
              />
            </div>

            {/* Step 2: Token Exchange */}
            <div id="section-step-2">
              <Step2Tokens
                code={authCode}
                realmId={realmId}
                clientId={config?.clientId || 'ABySM9kH7sQ0wfw8Mb3SB30DqWCRQNG6cDQMQVf5gSMvugU5n8'}
                redirectUri={config?.redirectUri || 'https://developer.intuit.com/app/developer/quickstart'}
                hasEnvSecret={Boolean(config?.hasClientSecret)}
                onTokensAcquired={handleTokensAcquired}
                onNavigateToPortal={() => setActiveTab('portal')}
              />
            </div>

            {/* Step 3: Sandbox APIs */}
            <div id="section-step-3">
              <Step3Apis tokens={tokens} />
            </div>

            {/* Step 4: Refresh Token */}
            <div id="section-step-4">
              <Step4Refresh
                tokens={tokens}
                clientId={config?.clientId || 'ABySM9kH7sQ0wfw8Mb3SB30DqWCRQNG6cDQMQVf5gSMvugU5n8'}
                hasEnvSecret={Boolean(config?.hasClientSecret)}
                onTokensRefreshed={handleTokensRefreshed}
              />
            </div>
          </div>
        )}

        {/* Tab: Chase Pay With Points & Loyalty */}
        {activeTab === 'chase' && (
          <div id="section-chase-loyalty">
            <ChaseLoyaltyConsole />
          </div>
        )}

        {/* Tab: Mastercard Open Finance & Finicity */}
        {activeTab === 'finicity' && (
          <div id="section-finicity-open-finance">
            <FinicityConsole
              onSendToAiIngest={(rawJson) => {
                setIngestPayload(rawJson);
                setActiveTab('ai-ingest');
              }}
            />
          </div>
        )}

        {/* Tab: Modern Treasury Ledgers & Live QBO Storage */}
        {activeTab === 'moderntreasury' && (
          <div id="section-modern-treasury-ledgers">
            <ModernTreasuryConsole
              onSendToAiIngest={(rawJson) => {
                setIngestPayload(rawJson);
                setActiveTab('ai-ingest');
              }}
            />
          </div>
        )}

        {/* Tab 2: AI Banking Ingest */}
        {activeTab === 'ai-ingest' && (
          <div id="section-ai-banking-ingest">
            <AiBankingIngest 
              tokens={tokens} 
              initialPayload={ingestPayload || undefined} 
            />
          </div>
        )}

        {/* Tab 3: Form Creator */}
        {activeTab === 'forms' && (
          <div id="section-form-builder">
            <QuickBooksFormBuilder tokens={tokens} />
          </div>
        )}

        {/* Tab 4: cURL Runner */}
        {activeTab === 'curl' && (
          <div id="section-curl-runner">
            <CustomCurlExecutor
              tokens={tokens}
              onSendToAiIngest={(rawJson) => {
                setIngestPayload(rawJson);
                setActiveTab('ai-ingest');
              }}
            />
          </div>
        )}

        {/* Tab 5: Autonomous Sync */}
        {activeTab === 'autonomous' && (
          <div id="section-autonomous-sync">
            <AutonomousSync tokens={tokens} realmId={realmId} />
          </div>
        )}

        {/* Tab 6: Code Scaffolder */}
        {activeTab === 'scaffolder' && (
          <div id="section-code-scaffolder">
            <CodeGenerator />
          </div>
        )}

        {/* Tab 7: Scopes & Matrix */}
        {activeTab === 'scopes' && (
          <div id="section-scopes-reference">
            <ScopeReference />
          </div>
        )}

        {/* Tab 8: Developer Portal */}
        {activeTab === 'portal' && (
          <div id="section-developer-portal">
            <DeveloperPortal />
          </div>
        )}

        {/* Tab 9: API Documentation Hub */}
        {activeTab === 'docs-hub' && (
          <div id="section-documentation-hub">
            <DocumentationHub />
          </div>
        )}

      </main>

      {/* Vercel Deployment Guide Modal */}
      <VercelGuideModal
        isOpen={isVercelModalOpen}
        onClose={() => setIsVercelModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-[#30363D] bg-[#0d1117] py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8B949E]">
          <div className="flex items-center space-x-2">
            <span>Intuit QuickBooks Sandbox OAuth 2.0 Integration</span>
            <span>•</span>
            <span>Client ID: <code className="font-mono text-[#79C0FF]">{config?.clientId || 'ABySM9k...'}</code></span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('ai-ingest')}
              className="text-[#3FB950] hover:underline font-medium"
            >
              AI Banking Ingest
            </button>
            <button
              onClick={() => setActiveTab('forms')}
              className="text-[#79C0FF] hover:underline font-medium"
            >
              Form Creator
            </button>
            <button
              onClick={() => setActiveTab('curl')}
              className="text-[#D29922] hover:underline font-medium"
            >
              cURL Runner
            </button>
            <a
              href="https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8B949E] hover:text-white font-medium"
            >
              Intuit Docs ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
