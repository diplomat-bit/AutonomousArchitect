import React, { useState } from 'react';
import { TriangleAlert, CheckCircle2, Copy, Check, ExternalLink, Terminal, Shield, Sparkles, X, Globe, Layers, Key } from 'lucide-react';

interface VercelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelGuideModal: React.FC<VercelGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envVars = [
    { key: 'INTUIT_CLIENT_ID', desc: 'Your Intuit App Client ID (from developer.intuit.com keys tab)' },
    { key: 'INTUIT_CLIENT_SECRET', desc: 'Your Intuit App Client Secret' },
    { key: 'INTUIT_REDIRECT_URI', desc: 'Your OAuth redirect URL (e.g. https://developer.intuit.com/app/developer/quickstart or your vercel app domain/callback)' },
    { key: 'INTUIT_ENVIRONMENT', desc: 'Set to "sandbox" (or "production")' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#30363D] flex items-center justify-between sticky top-0 bg-[#161B22] z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#000000] to-[#30363D] border border-[#30363D] flex items-center justify-center text-white">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 1155 1000">
                <path d="m577.3 0 577.4 1000H0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Vercel Deployment & "JSON Error" Fix Guide</span>
                <span className="px-2 py-0.5 text-[11px] font-mono rounded-full bg-[#238636]/20 text-[#3FB950] border border-[#238636]/30">
                  Ready for Vercel
                </span>
              </h2>
              <p className="text-xs text-[#8B949E]">Why the JSON error happened and how to deploy flawlessly to Vercel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#8B949E] hover:text-white hover:bg-[#21262D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm">
          {/* Why the error happened */}
          <div className="p-4 rounded-xl bg-[#0d1117] border border-[#f85149]/30 space-y-2">
            <div className="flex items-center space-x-2 text-[#f85149] font-semibold text-xs uppercase tracking-wider">
              <TriangleAlert className="w-4 h-4" />
              <span>Root Cause of the "Unexpected token &lt; in JSON" Error</span>
            </div>
            <p className="text-xs text-[#C9D1D9] leading-relaxed">
              When standard Express apps are pushed directly to Vercel without serverless configuration, Vercel cannot run a persistent Node server via <code className="text-[#f85149] bg-[#161B22] px-1 py-0.5 rounded">app.listen()</code>. Instead, requests to <code className="text-[#58A6FF] bg-[#161B22] px-1 py-0.5 rounded">/api/*</code> hit Vercel's static router, which returned an HTML 404 error page (<code className="text-[#C9D1D9] font-mono">&lt;!DOCTYPE html&gt;...</code>). The browser then failed when calling <code className="text-[#58A6FF] font-mono">res.json()</code> on that HTML.
            </p>
          </div>

          {/* Solution configured */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B949E] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#3FB950]" />
              <span>The Architectural Fix We Implemented</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-[#0d1117] border border-[#30363D] rounded-xl space-y-1">
                <span className="font-mono font-bold text-[#58A6FF]">1. /vercel.json</span>
                <p className="text-[#8B949E]">Maps all incoming <code className="text-white">/api/*</code> traffic directly to Vercel's serverless function engine.</p>
              </div>
              <div className="p-3.5 bg-[#0d1117] border border-[#30363D] rounded-xl space-y-1">
                <span className="font-mono font-bold text-[#58A6FF]">2. /api/index.ts</span>
                <p className="text-[#8B949E]">Vercel Serverless Function entry point exporting our unified Express Intuit API handler.</p>
              </div>
              <div className="p-3.5 bg-[#0d1117] border border-[#30363D] rounded-xl space-y-1">
                <span className="font-mono font-bold text-[#58A6FF]">3. /src/server/app.ts</span>
                <p className="text-[#8B949E]">Modular Express router supporting both local container dev and stateless Vercel cloud runtime.</p>
              </div>
              <div className="p-3.5 bg-[#0d1117] border border-[#30363D] rounded-xl space-y-1">
                <span className="font-mono font-bold text-[#58A6FF]">4. Safe API Client</span>
                <p className="text-[#8B949E]">Safely parses server responses and delivers clear diagnostic warnings instead of raw JSON crashes.</p>
              </div>
            </div>
          </div>

          {/* Vercel Environment Variables */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B949E] flex items-center space-x-2">
                <Key className="w-4 h-4 text-[#D29922]" />
                <span>Required Vercel Project Environment Variables</span>
              </h3>
            </div>
            <p className="text-xs text-[#8B949E]">
              Add these in your <strong className="text-white">Vercel Dashboard &rarr; Project Settings &rarr; Environment Variables</strong>:
            </p>
            <div className="space-y-2">
              {envVars.map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-[#0d1117] border border-[#30363D] rounded-lg">
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs text-[#58A6FF] font-bold">{item.key}</span>
                    <p className="text-[11px] text-[#8B949E]">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(item.key, item.key)}
                    className="p-1.5 rounded-md hover:bg-[#21262D] text-[#8B949E] hover:text-white transition-colors"
                    title="Copy variable name"
                  >
                    {copiedKey === item.key ? <Check className="w-4 h-4 text-[#3FB950]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment steps */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B949E] flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#58A6FF]" />
              <span>Deploy Commands</span>
            </h3>
            <div className="p-4 bg-[#0d1117] border border-[#30363D] rounded-xl font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-[#8B949E]">
                <span># Deploy with Vercel CLI (or connect your GitHub repository to Vercel)</span>
                <button
                  onClick={() => handleCopy('npx vercel', 'cmd')}
                  className="hover:text-white flex items-center space-x-1"
                >
                  {copiedKey === 'cmd' ? <Check className="w-3.5 h-3.5 text-[#3FB950]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-[#3FB950]">npx vercel --prod</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#30363D] flex justify-end bg-[#161B22] rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold transition-colors"
          >
            Got It, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
