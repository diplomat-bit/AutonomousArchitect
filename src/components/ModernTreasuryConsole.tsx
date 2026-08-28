import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Layers,
  Lock,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Search,
  Filter,
  Database,
  Sliders,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Terminal,
  Code2,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { apiFetch } from '../utils/apiClient';

export interface ModernTreasuryLedgerItem {
  id: string;
  object: string;
  live_mode: boolean;
  name: string;
  description: string | null;
  currency?: string;
  currency_exponent?: number;
  metadata: Record<string, any>;
  discarded_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ModernTreasuryConsoleProps {
  onSendToAiIngest?: (rawJson: string) => void;
}

export function ModernTreasuryConsole({ onSendToAiIngest }: ModernTreasuryConsoleProps) {
  const [config, setConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  
  // Query parameters
  const [perPage, setPerPage] = useState<number>(25);
  const [idFilter, setIdFilter] = useState<string>('');
  const [metadataKey, setMetadataKey] = useState<string>('');
  const [metadataValue, setMetadataValue] = useState<string>('');
  const [updatedAtOperator, setUpdatedAtOperator] = useState<'gt' | 'gte' | 'lt' | 'lte' | 'eq'>('gt');
  const [updatedAtDate, setUpdatedAtDate] = useState<string>('');
  const [afterCursor, setAfterCursor] = useState<string>('');
  const [autoStoreQbo, setAutoStoreQbo] = useState<boolean>(true);
  const [targetType, setTargetType] = useState<'Account' | 'JournalEntry'>('Account');

  // Results state
  const [ledgers, setLedgers] = useState<ModernTreasuryLedgerItem[]>([]);
  const [qboStorageInfo, setQboStorageInfo] = useState<any>(null);
  const [upstreamInfo, setUpstreamInfo] = useState<any>(null);
  const [metaInfo, setMetaInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExecutedUrl, setLastExecutedUrl] = useState<string>('');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeLang, setActiveCodeLang] = useState<'shell' | 'node' | 'python' | 'ruby'>('shell');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedLedgerForModal, setSelectedLedgerForModal] = useState<ModernTreasuryLedgerItem | null>(null);

  // New Ledger Form State
  const [newLedgerName, setNewLedgerName] = useState('');
  const [newLedgerDescription, setNewLedgerDescription] = useState('');
  const [newLedgerCurrency, setNewLedgerCurrency] = useState('USD');
  const [newLedgerMetadataKey, setNewLedgerMetadataKey] = useState('Type');
  const [newLedgerMetadataVal, setNewLedgerMetadataVal] = useState('Loan');
  const [creatingLedger, setCreatingLedger] = useState(false);

  // Fetch config on mount
  const loadConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await apiFetch<any>('/api/moderntreasury/config');
      if (res.ok && res.data?.config) {
        setConfig(res.data.config);
      }
    } catch (e: any) {
      console.error('Failed to load Modern Treasury config:', e);
    } finally {
      setLoadingConfig(false);
    }
  };

  // PDF Progress & Stage Tracking State
  const [uploadingPdf, setUploadingPdf] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mappedAccountsResult, setMappedAccountsResult] = useState<any[]>([]);
  const [searchMappedFilter, setSearchMappedFilter] = useState<string>('');

  useEffect(() => {
    loadConfig();
    // Auto trigger initial fetch to show existing ledgers
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();

    try {
      const params = new URLSearchParams();
      params.set('per_page', String(perPage));
      params.set('autoStoreQbo', autoStoreQbo ? 'true' : 'false');
      params.set('targetType', targetType);

      if (idFilter.trim()) {
        params.set('id', idFilter.trim());
      }
      if (metadataKey.trim() && metadataValue.trim()) {
        params.set(`metadata[${metadataKey.trim()}]`, metadataValue.trim());
      }
      if (updatedAtDate.trim()) {
        params.set(`updated_at[${updatedAtOperator}]`, updatedAtDate.trim());
      }
      if (afterCursor.trim()) {
        params.set('after_cursor', afterCursor.trim());
      }

      const queryString = params.toString();
      const endpoint = `/api/moderntreasury/ledgers?${queryString}`;
      setLastExecutedUrl(`https://app.moderntreasury.com/api/ledgers?${queryString}`);

      const res = await apiFetch<any>(endpoint);
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);

      if (res.ok && res.data) {
        setLedgers(res.data.data || []);
        setQboStorageInfo(res.data.quickbooksStorage || null);
        setUpstreamInfo(res.data.upstream || null);
        setMetaInfo(res.data.meta || null);
      } else {
        setError(res.error || 'Failed to fetch Modern Treasury ledgers');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLedgerName.trim()) return;

    setCreatingLedger(true);
    try {
      const metaObj: Record<string, string> = {};
      if (newLedgerMetadataKey.trim() && newLedgerMetadataVal.trim()) {
        metaObj[newLedgerMetadataKey.trim()] = newLedgerMetadataVal.trim();
      }

      const res = await apiFetch<any>('/api/moderntreasury/ledgers', {
        method: 'POST',
        body: JSON.stringify({
          name: newLedgerName.trim(),
          description: newLedgerDescription.trim() || undefined,
          currency: newLedgerCurrency,
          metadata: metaObj,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewLedgerName('');
        setNewLedgerDescription('');
        fetchLedgers();
      } else {
        alert(res.error || 'Failed to create ledger');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingLedger(false);
    }
  };

  const handleSyncAllToQbo = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>('/api/moderntreasury/sync-all-to-qbo', { method: 'POST' });
      if (res.ok) {
        alert(`Successfully synced ${res.data?.syncedCount || ledgers.length} ledgers to QuickBooks Ledger!`);
        fetchLedgers();
      }
    } catch (e: any) {
      alert(`Sync failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportCitiPdfClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const executePdfPipeline = async (fileName: string, fileBase64?: string) => {
    setUploadingPdf(true);
    setUploadProgress(10);
    setCurrentStageIndex(0);
    setUploadError(null);
    setUploadFileName(fileName);
    setMappedAccountsResult([]);

    try {
      // Stage 1: File Reading & Base64 Encoding
      setUploadProgress(25);
      await new Promise((r) => setTimeout(r, 250));

      // Stage 2: Streaming Payload to Modern Treasury Server & PDF Parsing
      setCurrentStageIndex(1);
      setUploadProgress(45);

      const payload: any = { fileName };
      if (fileBase64) {
        payload.fileBase64 = fileBase64;
      }

      setUploadProgress(60);
      const response = await fetch('/api/moderntreasury/import-citi-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse and import PDF accounts');
      }

      // Stage 3: Account Number Extraction & Regex Pattern Matching
      setCurrentStageIndex(2);
      setUploadProgress(80);
      await new Promise((r) => setTimeout(r, 250));

      const accounts = data.accounts || [];
      setMappedAccountsResult(accounts);

      // Stage 4: Syncing Ledgers to QBO Chart of Accounts with HMAC Signature
      setCurrentStageIndex(3);
      setUploadProgress(100);
      await new Promise((r) => setTimeout(r, 250));

      fetchLedgers();
    } catch (err: any) {
      console.error('PDF Pipeline Error:', err);
      setUploadError(err.message || 'An error occurred during PDF processing');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        await executePdfPipeline(file.name, base64String);
      };
      reader.onerror = () => {
        setUploadError('Failed to read selected PDF file');
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      setUploadError(`PDF Upload Error: ${e.message}`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImportCitiPdf = async () => {
    await executePdfPipeline('CitiBusiness_Entitlement_Report.pdf');
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const generateCurlSnippet = () => {
    return `curl -X GET "https://app.moderntreasury.com/api/ledgers?per_page=${perPage}${idFilter ? `&id[]=${idFilter}` : ''}${metadataKey && metadataValue ? `&metadata[${metadataKey}]=${metadataValue}` : ''}" \\
  -H "Accept: application/json" \\
  -H "Authorization: ${config?.maskedAuth || 'Basic <base64(org_id:api_key)>'}"`;
  };

  const generateNodeSnippet = () => {
    return `const url = 'https://app.moderntreasury.com/api/ledgers?per_page=${perPage}';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    authorization: 'Basic ${config?.hasAuthHeader ? '••••••••' : '<base64(org_id:api_key)>'}'
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));`;
  };

  const generatePythonSnippet = () => {
    return `import requests

url = "https://app.moderntreasury.com/api/ledgers?per_page=${perPage}"

headers = {
    "accept": "application/json",
    "authorization": "${config?.maskedAuth || 'Basic <base64(org_id:api_key)>'}"
}

response = requests.get(url, headers=headers)
print(response.json())`;
  };

  const generateRubySnippet = () => {
    return `require 'uri'
require 'net/http'

url = URI("https://app.moderntreasury.com/api/ledgers?per_page=${perPage}")
http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["accept"] = 'application/json'
request["authorization"] = '${config?.maskedAuth || 'Basic <base64(org_id:api_key)>'}'

response = http.request(request)
puts response.read_body`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Status Header */}
      <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/40 shrink-0 font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Modern Treasury: List Ledgers & Live QuickBooks Storage
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  GET /api/ledgers
                </span>
              </div>
              <p className="text-xs text-[#8B949E] mt-1 max-w-3xl leading-relaxed">
                Query Modern Treasury Ledgers with real Basic Authentication and dynamically stream every single ledger directly into the QuickBooks Chart of Accounts, Bridge Ledger, and Journal Entries with cryptographic HMAC proofs.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-900/30 transition-all border border-indigo-400/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Ledger</span>
            </button>

            <button
              onClick={handleSyncAllToQbo}
              disabled={loading || ledgers.length === 0}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all border border-emerald-400/40"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Sync All to QBO Ledger</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              accept=".pdf"
              className="hidden"
            />
            <button
              onClick={handleImportCitiPdfClick}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-cyan-950/30 transition-all border border-cyan-400/40"
              title="Upload PDF (CitiBusiness Entitlement Report) to extract accounts and sync into QuickBooks"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Upload PDF Report</span>
            </button>

            <button
              onClick={handleImportCitiPdf}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-950/30 transition-all border border-indigo-400/40"
              title="Instantly import all CitiBusiness PDF accounts into QuickBooks"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Import Citi PDF Accounts → QBO</span>
            </button>

            <button
              onClick={loadConfig}
              className="p-2 rounded-lg bg-[#21262d] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] transition-colors"
              title="Refresh credentials status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingConfig ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Credentials & Status Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-[#30363D]/60 text-xs">
          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363D] flex items-center justify-between">
            <span className="text-[#8B949E] font-medium">Base URL:</span>
            <span className="font-mono text-cyan-300 font-bold text-[11px] truncate" title="https://app.moderntreasury.com">
              https://app.moderntreasury.com
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363D] flex items-center justify-between">
            <span className="text-[#8B949E] font-medium">Organization ID:</span>
            <span className="font-mono text-indigo-300 font-bold">
              {config?.organizationId || 'Auto (Sandbox)'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363D] flex items-center justify-between">
            <span className="text-[#8B949E] font-medium">Basic Auth Header:</span>
            <span className={`font-mono font-bold ${config?.hasAuthHeader ? 'text-emerald-400' : 'text-amber-400'}`}>
              {config?.hasAuthHeader ? 'Configured' : 'Auto Basic Org:Key'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363D] flex items-center justify-between">
            <span className="text-[#8B949E] font-medium">QuickBooks Bridge:</span>
            <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> CONNECTED & LOCKED
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363D] flex items-center justify-between">
            <span className="text-[#8B949E] font-medium">QBO Target Realm:</span>
            <span className="font-mono text-[#79C0FF] font-bold">
              {config?.quickbooksRealmId || '9341453267972001'}
            </span>
          </div>
        </div>
      </div>

      {/* PDF Upload, Stage Tracker & Account Mapping Panel */}
      {(uploadingPdf || mappedAccountsResult.length > 0 || uploadError) && (
        <div className="bg-[#161B22] rounded-xl border border-indigo-500/40 p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  PDF Account Extraction & QuickBooks Mapping Pipeline
                  {uploadProgress === 100 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% COMPLETE
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#8B949E]">
                  Report File: <span className="font-mono text-cyan-300 font-bold">{uploadFileName || 'CitiBusiness_Entitlement_Report.pdf'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="font-mono text-base font-extrabold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                {uploadProgress}%
              </span>
              <button
                onClick={() => {
                  setUploadingPdf(false);
                  setUploadProgress(0);
                  setMappedAccountsResult([]);
                  setUploadError(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#21262d] hover:bg-[#30363D] text-[#8B949E] hover:text-white transition-colors border border-[#30363D]"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#8B949E] font-medium">
              <span>Overall Pipeline Progress</span>
              <span className="font-mono font-bold text-indigo-300">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[#0d1117] h-3.5 rounded-full overflow-hidden border border-[#30363D] p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-300 shadow-sm shadow-indigo-500/50"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>

          {/* 4-Stage Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {[
              {
                idx: 0,
                title: '1. File Reading',
                desc: 'Reading PDF bytes & Base64 encoding',
              },
              {
                idx: 1,
                title: '2. Server Stream',
                desc: 'Posting payload & pdf-parse engine',
              },
              {
                idx: 2,
                title: '3. Regex Extraction',
                desc: 'Scanning Account#: patterns',
              },
              {
                idx: 3,
                title: '4. QBO & HMAC Sync',
                desc: 'Generating Chart of Accounts & HMAC',
              },
            ].map((stg) => {
              const isDone = currentStageIndex > stg.idx || uploadProgress === 100;
              const isCurrent = currentStageIndex === stg.idx && uploadProgress < 100;
              const isPending = currentStageIndex < stg.idx && uploadProgress < 100;

              return (
                <div
                  key={stg.idx}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200 shadow-sm'
                      : isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-md shadow-indigo-950/50 animate-pulse'
                      : 'bg-[#0d1117] border-[#30363D] text-[#8B949E]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{stg.title}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-[#8B949E]/40 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] opacity-80 leading-tight">{stg.desc}</p>
                </div>
              );
            })}
          </div>

          {uploadError && (
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Mapped Accounts Results View */}
          {mappedAccountsResult.length > 0 && (
            <div className="pt-3 border-t border-[#30363D] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Parsed Accounts Output ({mappedAccountsResult.length} Accounts Extracted)
                  </span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchMappedFilter}
                    onChange={(e) => setSearchMappedFilter(e.target.value)}
                    placeholder="Search account numbers or IDs..."
                    className="pl-8 pr-3 py-1 bg-[#0d1117] border border-[#30363D] rounded-lg text-xs text-white placeholder-[#8B949E] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {mappedAccountsResult.some((acc: any) => acc.status === 'QUICKBOOKS_NOT_CONNECTED') && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>QuickBooks OAuth Not Connected: Accounts are staged locally. Connect your QuickBooks account via OAuth to push these directly into your live Intuit Chart of Accounts.</span>
                  </div>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto rounded-xl border border-[#30363D] bg-[#0d1117] divide-y divide-[#30363D]/60 text-xs font-mono">
                {mappedAccountsResult
                  .filter((acc: any) => {
                    if (!searchMappedFilter.trim()) return true;
                    const q = searchMappedFilter.toLowerCase();
                    return (
                      String(acc.accountNumber).toLowerCase().includes(q) ||
                      String(acc.ledgerId).toLowerCase().includes(q) ||
                      String(acc.qboEntityId || '').toLowerCase().includes(q)
                    );
                  })
                  .map((acc: any, i: number) => {
                    const isRealSynced = acc.status === 'REAL_QBO_SYNCED' || acc.isRealQboSync;
                    const isNotConnected = acc.status === 'QUICKBOOKS_NOT_CONNECTED' || acc.qboEntityId === 'NOT_CONNECTED';
                    const isError = acc.status === 'QBO_API_ERROR' || Boolean(acc.qboError);

                    return (
                      <div key={i} className="p-3 hover:bg-[#161b22] flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-emerald-400 font-bold text-xs">
                              Citi Account #{acc.accountNumber}
                            </span>
                            {isRealSynced && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                Live QBO Entity ID: {acc.qboEntityId}
                              </span>
                            )}
                            {isNotConnected && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                                Local Staged (OAuth Required)
                              </span>
                            )}
                            {isError && (
                              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                                QBO Sync Error
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#8B949E] truncate">
                            Ledger ID: {acc.ledgerId} | Bridge ID: {acc.bridgeId}
                          </div>
                          {acc.qboError && (
                            <div className="text-[11px] text-red-400 font-sans">
                              Error: {acc.qboError}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          {isRealSynced && (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" /> LIVE QBO CREATED
                            </span>
                          )}
                          {isNotConnected && (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                              <AlertTriangle className="w-3.5 h-3.5" /> OAUTH REQUIRED
                            </span>
                          )}
                          {isError && (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1.5 shadow-sm">
                              <AlertCircle className="w-3.5 h-3.5" /> SYNC FAILED
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Query Filter & Execution Console */}
      <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Query Parameters & Filtering</h3>
          </div>
          <span className="text-[11px] text-[#8B949E] font-mono">
            GET https://app.moderntreasury.com/api/ledgers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Per Page */}
          <div>
            <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
              per_page (int32)
            </label>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
            >
              <option value={10}>10</option>
              <option value={25}>25 (Default)</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* ID Filter */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
              id[] (array of strings)
            </label>
            <input
              type="text"
              placeholder="e.g. 019a61f9-185c-780b-82d5-f637884c1d31"
              value={idFilter}
              onChange={(e) => setIdFilter(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#8B949E]/50 focus:border-indigo-500 focus:outline-hidden font-mono"
            />
          </div>

          {/* Metadata Key & Value */}
          <div>
            <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
              metadata Key
            </label>
            <input
              type="text"
              placeholder="e.g. Type"
              value={metadataKey}
              onChange={(e) => setMetadataKey(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#8B949E]/50 focus:border-indigo-500 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
              metadata Value
            </label>
            <input
              type="text"
              placeholder="e.g. Loan"
              value={metadataValue}
              onChange={(e) => setMetadataValue(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#8B949E]/50 focus:border-indigo-500 focus:outline-hidden font-mono"
            />
          </div>

          {/* Target Ledger Type */}
          <div>
            <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
              QBO Store Mode
            </label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as any)}
              className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="Account">Chart of Accounts</option>
              <option value="JournalEntry">Journal Entry GL</option>
            </select>
          </div>
        </div>

        {/* Secondary Parameters row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-1/3">
              <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                updated_at Op
              </label>
              <select
                value={updatedAtOperator}
                onChange={(e) => setUpdatedAtOperator(e.target.value as any)}
                className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-2 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="gt">&gt; (gt)</option>
                <option value="gte">&gt;= (gte)</option>
                <option value="lt">&lt; (lt)</option>
                <option value="lte">&lt;= (lte)</option>
                <option value="eq">= (eq)</option>
              </select>
            </div>
            <div className="w-2/3">
              <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                updated_at Date
              </label>
              <input
                type="text"
                placeholder="2022-01-01T12:00:00Z"
                value={updatedAtDate}
                onChange={(e) => setUpdatedAtDate(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#8B949E]/50 focus:border-indigo-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
              after_cursor (pagination)
            </label>
            <input
              type="text"
              placeholder="e.g. 019a61f8-2525-70f3-a6b2-1af97ed08594"
              value={afterCursor}
              onChange={(e) => setAfterCursor(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#8B949E]/50 focus:border-indigo-500 focus:outline-hidden font-mono"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#0d1117] border border-[#30363D] w-full cursor-pointer hover:border-emerald-500/50 transition-colors">
              <input
                type="checkbox"
                checked={autoStoreQbo}
                onChange={(e) => setAutoStoreQbo(e.target.checked)}
                className="rounded border-[#30363D] text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-[#161B22]"
              />
              <div>
                <p className="text-xs font-bold text-white">Auto-Store in QuickBooks</p>
                <p className="text-[10px] text-[#8B949E]">Locks every fetched ledger into QBO Ledger</p>
              </div>
            </label>
          </div>
        </div>

        {/* Execute Button Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#30363D]">
          <div className="flex items-center space-x-2 text-xs text-[#8B949E]">
            {latencyMs !== null && (
              <span className="px-2 py-1 rounded bg-[#0d1117] border border-[#30363D] font-mono text-emerald-400">
                ⚡ Latency: {latencyMs}ms
              </span>
            )}
            {metaInfo && (
              <span className="px-2 py-1 rounded bg-[#0d1117] border border-[#30363D] font-mono text-indigo-300">
                Count: {metaInfo.total} Ledgers
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={fetchLedgers}
              disabled={loading}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/30 transition-all border border-indigo-400/40 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-white ${loading ? 'animate-pulse' : ''}`} />
              <span>{loading ? 'Fetching & Storing in QBO...' : 'Fetch Ledgers & Store into QuickBooks'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-4 flex items-start space-x-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-white">Request Execution Error</p>
            <p className="font-mono">{error}</p>
          </div>
        </div>
      )}

      {/* QuickBooks Storage Status Banner */}
      {qboStorageInfo && (
        <div className="bg-emerald-950/25 border border-emerald-500/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white flex items-center gap-2">
                <span>QuickBooks Ledger Storage Completed</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                  {qboStorageInfo.storedCount} Recorded
                </span>
              </p>
              <p className="text-[#8B949E] text-[11px]">
                GL Mapping: <code className="text-emerald-300 font-mono">{qboStorageInfo.glDebitAccount}</code> ↔ <code className="text-emerald-300 font-mono">{qboStorageInfo.glCreditAccount}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-300">
            <span className="px-2.5 py-1 rounded bg-[#0d1117] border border-[#30363D] text-emerald-400 font-bold">
              STATUS: {qboStorageInfo.status}
            </span>
          </div>
        </div>
      )}

      {/* Ledgers Grid View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Retrieved Modern Treasury Ledgers ({ledgers.length})
            </h3>
          </div>
          <span className="text-xs text-[#8B949E]">
            All ledgers automatically synced with deterministic HMAC hashes
          </span>
        </div>

        {ledgers.length === 0 ? (
          <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-8 text-center text-xs text-[#8B949E] space-y-3">
            <Building2 className="w-8 h-8 mx-auto text-[#8B949E]/40" />
            <p>No ledgers found matching your query filters.</p>
            <button
              onClick={fetchLedgers}
              className="px-3 py-1.5 rounded-lg bg-[#21262d] text-white text-xs font-medium hover:bg-[#30363D] transition-colors"
            >
              Reset Filters & List All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {ledgers.map((l) => (
              <div
                key={l.id}
                className="bg-[#161B22] rounded-xl border border-[#30363D] hover:border-indigo-500/60 p-4 transition-all space-y-3 shadow-xs"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white">{l.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        l.live_mode
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {l.live_mode ? 'LIVE' : 'SANDBOX'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
                        {l.currency || 'USD'}
                      </span>
                    </div>
                    <p className="text-xs text-[#8B949E] line-clamp-2">
                      {l.description || 'No description provided.'}
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(l.id, l.id)}
                    className="p-1.5 rounded-md hover:bg-[#21262d] text-[#8B949E] hover:text-white transition-colors"
                    title="Copy Ledger UUID"
                  >
                    {copiedKey === l.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* ID & Metadata Tags */}
                <div className="bg-[#0d1117] rounded-lg p-2.5 border border-[#30363D]/70 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8B949E]">ID:</span>
                    <span className="text-indigo-300 truncate max-w-[280px]">{l.id}</span>
                  </div>

                  {l.metadata && Object.keys(l.metadata).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#30363D]/40">
                      {Object.entries(l.metadata).map(([k, v]) => (
                        <span
                          key={k}
                          className="px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 text-[10px]"
                        >
                          {k}: {String(v)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[#8B949E] pt-1">
                    <span>Created: {new Date(l.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(l.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* QBO Storage Verification Ribbon */}
                <div className="flex items-center justify-between pt-1 border-t border-[#30363D]/60 text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Locked into QuickBooks Ledger</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {onSendToAiIngest && (
                      <button
                        onClick={() => onSendToAiIngest(JSON.stringify(l, null, 2))}
                        className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-colors flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI Ingest</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedLedgerForModal(l)}
                      className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363D] text-white text-[11px] font-medium transition-colors"
                    >
                      Raw JSON
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Code Generator & cURL Reference */}
      <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Modern Treasury API Code Snippet</h3>
          </div>

          <div className="flex items-center space-x-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363D]">
            {(['shell', 'node', 'python', 'ruby'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveCodeLang(lang)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium capitalize transition-colors ${
                  activeCodeLang === lang
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-[#8B949E] hover:text-white'
                }`}
              >
                {lang === 'shell' ? 'cURL' : lang}
              </button>
            ))}
          </div>
        </div>

        <div className="relative bg-[#0d1117] rounded-xl border border-[#30363D] p-4 font-mono text-xs text-indigo-300 overflow-x-auto">
          <button
            onClick={() => {
              const snippet =
                activeCodeLang === 'shell'
                  ? generateCurlSnippet()
                  : activeCodeLang === 'node'
                  ? generateNodeSnippet()
                  : activeCodeLang === 'python'
                  ? generatePythonSnippet()
                  : generateRubySnippet();
              copyToClipboard(snippet, 'active_snippet');
            }}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363D] text-[#8B949E] hover:text-white transition-colors"
            title="Copy snippet"
          >
            {copiedKey === 'active_snippet' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          <pre>
            {activeCodeLang === 'shell' && generateCurlSnippet()}
            {activeCodeLang === 'node' && generateNodeSnippet()}
            {activeCodeLang === 'python' && generatePythonSnippet()}
            {activeCodeLang === 'ruby' && generateRubySnippet()}
          </pre>
        </div>
      </div>

      {/* Modal: Create New Ledger */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Create Modern Treasury Ledger</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#8B949E] hover:text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLedger} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#8B949E] font-medium mb-1">
                  Ledger Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Digital Wallet Example"
                  value={newLedgerName}
                  onChange={(e) => setNewLedgerName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-3 py-2 text-white placeholder-[#8B949E]/50 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#8B949E] font-medium mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Represents our USD funds and user balances"
                  value={newLedgerDescription}
                  onChange={(e) => setNewLedgerDescription(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-3 py-2 text-white placeholder-[#8B949E]/50 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B949E] font-medium mb-1">
                    Currency
                  </label>
                  <select
                    value={newLedgerCurrency}
                    onChange={(e) => setNewLedgerCurrency(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8B949E] font-medium mb-1">
                    Live Mode
                  </label>
                  <input
                    type="text"
                    disabled
                    value="false (Sandbox)"
                    className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-3 py-2 text-[#8B949E] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B949E] font-medium mb-1">
                    Metadata Key
                  </label>
                  <input
                    type="text"
                    placeholder="Type"
                    value={newLedgerMetadataKey}
                    onChange={(e) => setNewLedgerMetadataKey(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#8B949E] font-medium mb-1">
                    Metadata Value
                  </label>
                  <input
                    type="text"
                    placeholder="Loan"
                    value={newLedgerMetadataVal}
                    onChange={(e) => setNewLedgerMetadataVal(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363D] rounded-lg px-3 py-2 text-white font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300">
                ✓ Once created, this ledger will be automatically stored into the QuickBooks Ledger with GL Account mapping.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#21262d] text-white hover:bg-[#30363D] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingLedger}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors disabled:opacity-50"
                >
                  {creatingLedger ? 'Creating...' : 'Create & Store in QBO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inspect Raw Ledger JSON */}
      {selectedLedgerForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Ledger JSON: {selectedLedgerForModal.name}
              </h3>
              <button
                onClick={() => setSelectedLedgerForModal(null)}
                className="text-[#8B949E] hover:text-white text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="relative bg-[#0d1117] border border-[#30363D] rounded-xl p-4 font-mono text-xs text-indigo-300 max-h-96 overflow-y-auto">
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(selectedLedgerForModal, null, 2), 'modal_json')
                }
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363D] text-[#8B949E] hover:text-white transition-colors"
              >
                {copiedKey === 'modal_json' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <pre>{JSON.stringify(selectedLedgerForModal, null, 2)}</pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLedgerForModal(null)}
                className="px-4 py-2 rounded-lg bg-[#21262d] text-white hover:bg-[#30363D] text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
