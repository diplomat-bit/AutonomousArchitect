import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, ExternalLink, ShieldAlert, Cpu, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { CODE_TEMPLATES } from '../data/codeSnippets';
import { SupportedLanguage } from '../types';

export const CodeGenerator: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('nodejs-express');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentTemplate = CODE_TEMPLATES.find((t) => t.id === selectedLang) || CODE_TEMPLATES[0];
  const currentFile = currentTemplate.files[selectedFileIndex] || currentTemplate.files[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Runnable Backend Code Scaffolds</h2>
            <p className="text-xs text-[#8B949E] mt-0.5">
              Select your target runtime to inspect full, runnable code with secure secret handling, automatic token refresh, and sandbox API routes.
            </p>
          </div>
        </div>

        {/* Framework Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          {CODE_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              id={`framework-select-${tmpl.id}`}
              onClick={() => {
                setSelectedLang(tmpl.id);
                setSelectedFileIndex(0);
              }}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedLang === tmpl.id
                  ? 'border-[#238636] bg-[#238636]/10 text-white ring-1 ring-[#3FB950]/30 font-semibold'
                  : 'border-[#30363D] bg-[#0d1117] text-[#C9D1D9] hover:border-[#484f58]'
              }`}
            >
              <div className="text-xs font-semibold">{tmpl.name}</div>
              <div className="text-[11px] text-[#8B949E] mt-0.5">{tmpl.category}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Code Viewer Box */}
      <div className="bg-[#0d1117] rounded-xl border border-[#30363D] shadow-md overflow-hidden text-[#C9D1D9]">
        {/* Top File Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-2.5 bg-[#161B22] border-b border-[#30363D] gap-2">
          {/* File Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto">
            {currentTemplate.files.map((file, idx) => (
              <button
                key={file.filename}
                id={`file-tab-${file.filename}`}
                onClick={() => setSelectedFileIndex(idx)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center space-x-1.5 ${
                  selectedFileIndex === idx
                    ? 'bg-[#0d1117] text-[#79C0FF] font-semibold border border-[#30363D]'
                    : 'text-[#8B949E] hover:text-white hover:bg-[#21262d]'
                }`}
              >
                <span>{file.filename}</span>
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              id="copy-scaffold-code-btn"
              onClick={handleCopyCode}
              className="flex items-center space-x-1 px-3 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-xs text-[#C9D1D9] border border-[#30363D] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#3FB950]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>

            <button
              id="download-scaffold-file-btn"
              onClick={handleDownload}
              className="flex items-center space-x-1 px-3 py-1 rounded bg-[#238636] hover:bg-[#2ea043] text-xs font-medium text-white transition-colors border border-[rgba(240,246,252,0.1)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-x-auto max-h-[540px] font-mono text-xs bg-[#010409]">
          <pre className="leading-relaxed select-all text-[#C9D1D9]">
            <code>{currentFile.code}</code>
          </pre>
        </div>
      </div>

      {/* Execution Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Run Guide */}
        <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-3 shadow-xs">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Terminal className="w-4 h-4 text-[#3FB950]" />
            <span>How to Run Locally ({currentTemplate.name})</span>
          </h3>
          <ol className="space-y-2 text-xs text-[#8B949E] list-decimal list-inside">
            {currentTemplate.runInstructions.map((instruction, i) => (
              <li key={i} className="leading-relaxed">
                <span className="font-normal text-[#C9D1D9]">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Security & Token Rules */}
        <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-3 shadow-xs">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-[#D29922]" />
            <span>Intuit OAuth 2.0 Security Requirements</span>
          </h3>
          <ul className="space-y-2 text-xs text-[#8B949E]">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950] shrink-0 mt-0.5" />
              <span><strong className="text-white">Keep Client Secret Server-Side:</strong> Never embed client secret in frontend JavaScript or mobile apps.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950] shrink-0 mt-0.5" />
              <span><strong className="text-white">Verify State Parameter:</strong> Always validate the cryptographically random <code className="font-mono text-[#79C0FF]">state</code> token to prevent CSRF attacks.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950] shrink-0 mt-0.5" />
              <span><strong className="text-white">Persist Rotated Refresh Tokens:</strong> Each refresh call invalidates the prior refresh token. Always write the new one to your database.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
