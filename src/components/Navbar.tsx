import React from 'react';
import { Shield, Key, CheckCircle2, AlertCircle, RefreshCw, Code2, PlayCircle, BookOpen, Sparkles, Plus, Terminal, Layers, Zap, CreditCard, Lock } from 'lucide-react';
import { IntuitConfig } from '../types';

export type MainTabType = 'runner' | 'auto-bridge' | 'bridge' | 'chase' | 'finicity' | 'ai-ingest' | 'forms' | 'curl' | 'autonomous' | 'scaffolder' | 'scopes' | 'portal' | 'docs-hub';

interface NavbarProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  config: IntuitConfig | null;
  onRefreshConfig: () => void;
  onOpenVercelGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  onRefreshConfig,
  onOpenVercelGuide,
}) => {
  const hasToken = config?.activeTokens.hasAccessToken;

  return (
    <header className="border-b border-[#30363D] bg-[#161B22]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-[#238636] flex items-center justify-center text-white shadow-sm font-bold text-lg">
              qb
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white tracking-tight text-base">QuickBooks Sandbox</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#238636]/20 text-[#3FB950] border border-[#238636]/40">
                  v2.0 OAuth & AI
                </span>
              </div>
              <p className="text-xs text-[#8B949E] hidden sm:block">Intuit Sandbox Full-Spectrum API & AI Banking Hub</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="hidden md:flex items-center space-x-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363D]">
            <button
              id="tab-runner-btn"
              onClick={() => setActiveTab('runner')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'runner'
                  ? 'bg-[#21262d] text-white shadow-xs border border-[#30363D] font-semibold'
                  : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-[#3FB950]" />
              <span>OAuth Flow</span>
            </button>

            <button
              id="tab-auto-bridge-btn"
              onClick={() => setActiveTab('auto-bridge')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'auto-bridge'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs border border-emerald-400 font-bold'
                  : 'text-emerald-300 hover:text-white bg-emerald-950/40 border border-emerald-500/40'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto QBO Bridge</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-400/20 text-emerald-300 font-bold animate-pulse">LOCKED</span>
            </button>

            <button
              id="tab-bridge-btn"
              onClick={() => setActiveTab('bridge')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'bridge'
                  ? 'bg-[#21262d] text-white shadow-xs border border-[#30363D] font-semibold'
                  : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Command Bridge</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">PRO</span>
            </button>

            <button
              id="tab-chase-btn"
              onClick={() => setActiveTab('chase')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'chase'
                  ? 'bg-blue-600 text-white shadow-xs border border-blue-400 font-semibold'
                  : 'text-blue-300 hover:text-white bg-blue-950/30 border border-blue-500/30'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              <span>Chase Loyalty</span>
            </button>

            <button
              id="tab-finicity-btn"
              onClick={() => setActiveTab('finicity')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'finicity'
                  ? 'bg-red-600 text-white shadow-xs border border-red-400 font-semibold'
                  : 'text-red-300 hover:text-white bg-red-950/30 border border-red-500/30'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-red-400" />
              <span>Mastercard / Finicity</span>
            </button>

            <button
              id="tab-ai-ingest-btn"
              onClick={() => setActiveTab('ai-ingest')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'ai-ingest'
                  ? 'bg-[#21262d] text-white shadow-xs border border-[#30363D] font-semibold'
                  : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3FB950]" />
              <span>AI Ingest</span>
            </button>

            <button
              id="tab-forms-btn"
              onClick={() => setActiveTab('forms')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'forms'
                  ? 'bg-[#21262d] text-white shadow-xs border border-[#30363D] font-semibold'
                  : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-[#79C0FF]" />
              <span>Form Creator</span>
            </button>

            <button
              id="tab-curl-btn"
              onClick={() => setActiveTab('curl')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'curl'
                  ? 'bg-[#21262d] text-white shadow-xs border border-[#30363D] font-semibold'
                  : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-[#D29922]" />
              <span>cURL Runner</span>
            </button>

            <button
              id="tab-autonomous-btn"
              onClick={() => setActiveTab('autonomous')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'autonomous'
                  ? 'bg-[#21262d] text-white shadow-xs border border-[#30363D] font-semibold'
                  : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#A371F7]" />
              <span>Sync All</span>
            </button>

            <button
              id="tab-scaffolder-btn"
              onClick={() => setActiveTab('scaffolder')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'scaffolder'
                  ? 'bg-[#21262d] text-white shadow-xs border border-[#30363D] font-semibold'
                  : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-[#79C0FF]" />
              <span>Scaffolds</span>
            </button>

            <button
              id="tab-portal-btn"
              onClick={() => setActiveTab('portal')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'portal'
                  ? 'bg-purple-600 text-white shadow-xs font-semibold'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-500/30'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>Dev Portal & Tokens</span>
            </button>

            <button
              id="tab-docs-hub-btn"
              onClick={() => setActiveTab('docs-hub')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'docs-hub'
                  ? 'bg-[#21262d] text-white shadow-xs border border-[#30363D] font-semibold'
                  : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>API Hub</span>
            </button>
          </div>

          {/* Environment Status Pills & Direct Portal Button */}
          <div className="flex items-center space-x-2">
            <button
              id="direct-portal-btn"
              onClick={() => setActiveTab('portal')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                activeTab === 'portal'
                  ? 'bg-purple-600 text-white border border-purple-400'
                  : 'bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-500/50'
              }`}
              title="Open Developer Portal, Upload Service Account JSON, & Mint ya29 Tokens"
            >
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>Dev Portal & Tokens</span>
            </button>

            <button
              id="vercel-guide-btn"
              onClick={onOpenVercelGuide}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#000000] hover:bg-[#21262D] text-white text-xs font-medium border border-[#30363D] transition-colors"
              title="Vercel Deployment Guide & JSON Error Fix"
            >
              <svg className="w-3 h-3 fill-white" viewBox="0 0 1155 1000">
                <path d="m577.3 0 577.4 1000H0z" />
              </svg>
              <span>Vercel Guide</span>
            </button>

            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
              hasToken 
                ? 'border-[#238636]/40 bg-[#238636]/15 text-[#3FB950]' 
                : 'border-[#30363D] bg-[#0d1117] text-[#8B949E]'
            }`}>
              {hasToken ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse"></span>
                  <span className="text-[#3FB950]">Token Active</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#8B949E]"></span>
                  <span className="text-[#8B949E]">No Token</span>
                </>
              )}
            </div>

            <button
              id="refresh-config-btn"
              onClick={onRefreshConfig}
              title="Refresh server status"
              aria-label="Refresh server configuration"
              className="p-1.5 rounded-md text-[#8B949E] hover:text-white hover:bg-[#21262d] border border-transparent hover:border-[#30363D] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden items-center space-x-1.5 overflow-x-auto py-2 border-t border-[#30363D]">
          {[
            { id: 'auto-bridge', label: '🔒 Auto QBO Bridge', highlight: true },
            { id: 'portal', label: '🔑 Dev Portal & Tokens', highlight: true },
            { id: 'bridge', label: '⚡ Command Bridge' },
            { id: 'chase', label: '💳 Chase Loyalty' },
            { id: 'finicity', label: '🏦 Mastercard / Finicity' },
            { id: 'runner', label: 'OAuth Flow' },
            { id: 'ai-ingest', label: 'AI Ingest' },
            { id: 'forms', label: 'Form Creator' },
            { id: 'curl', label: 'cURL' },
            { id: 'autonomous', label: 'Sync All' },
            { id: 'scaffolder', label: 'Scaffolds' },
            { id: 'docs-hub', label: 'API Hub' },
            { id: 'scopes', label: 'Docs' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as MainTabType)}
              className={`px-3 py-1.5 text-xs whitespace-nowrap rounded-lg font-medium transition-all ${
                activeTab === t.id
                  ? t.highlight ? 'bg-purple-600 text-white font-bold' : 'bg-[#238636] text-white font-semibold'
                  : t.highlight ? 'bg-purple-950/50 text-purple-300 border border-purple-500/40' : 'text-[#8B949E] bg-[#161B22]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
