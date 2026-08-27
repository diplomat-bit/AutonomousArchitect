import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  CreditCard,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  Layers,
  FileCode,
  Save,
  Server,
} from 'lucide-react';
import { apiFetch } from '../utils/apiClient';

export interface EnvItem {
  key: string;
  category: 'google' | 'gemini' | 'finicity' | 'chase' | 'intuit' | 'security';
  categoryLabel: string;
  description: string;
  value: string;
  isSecret: boolean;
  isSet: boolean;
  maskedValue: string;
  defaultValue?: string;
}

export function EnvironmentVariablesManager() {
  const [items, setItems] = useState<EnvItem[]>([]);
  const [rawEnvText, setRawEnvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [editableValues, setEditableValues] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    fetchEnvVariables();
  }, []);

  const fetchEnvVariables = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>('/api/env/all');
      const data = res.data;
      if (res.ok && data?.items) {
        setItems(data.items);
        setRawEnvText(data.rawEnvText || '');
        const valMap: Record<string, string> = {};
        data.items.forEach((item: EnvItem) => {
          valMap[item.key] = item.value;
        });
        setEditableValues(valMap);
      } else if (res.error) {
        setStatusMessage({ type: 'error', text: res.error });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Failed to load env variables: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReveal = (key: string) => {
    setRevealedSecrets(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditableValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await apiFetch<any>('/api/env/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: editableValues }),
      });

      const data = res.data;
      if (res.ok && data?.success) {
        setStatusMessage({ type: 'success', text: 'All environment variables updated & applied to runtime server!' });
        if (data.items) {
          setItems(data.items);
          setRawEnvText(data.rawEnvText || '');
        }
      } else {
        setStatusMessage({ type: 'error', text: res.error || data?.error || 'Failed to update variables.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadEnv = () => {
    const blob = new Blob([rawEnvText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '.env';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleParseAndImport = async () => {
    if (!importText.trim()) return;
    const lines = importText.split('\n');
    const updates: Record<string, string> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        updates[key] = val;
      }
    }

    if (Object.keys(updates).length === 0) {
      alert('No valid environment key-value pairs found in input.');
      return;
    }

    setEditableValues(prev => ({
      ...prev,
      ...updates,
    }));

    setSaving(true);
    try {
      const res = await apiFetch<any>('/api/env/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      const data = res.data;
      if (res.ok && data?.success) {
        setStatusMessage({ type: 'success', text: `Imported and saved ${Object.keys(updates).length} environment variables!` });
        if (data.items) {
          setItems(data.items);
          setRawEnvText(data.rawEnvText || '');
        }
        setImportModalOpen(false);
        setImportText('');
      } else {
        alert(res.error || data?.error || 'Import failed');
      }
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadDemoDefaults = async () => {
    const demoDefaults: Record<string, string> = {
      GOOGLE_PROJECT_ID: 'aistudio-quickbooksoauth2-43d92844',
      GOOGLE_CLIENT_EMAIL: 'service-principal@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com',
      GOOGLE_HMAC_SERVICE_ACCOUNT: 'service-principal@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com',
      GOOGLE_HMAC_ACCESS_ID: 'GOOG1E738194720491823901',
      FINICITY_API_BASE_URL: 'https://api.finicity.com',
      FINICITY_APP_KEY: '2423653942467',
      FINICITY_PARTNER_ID: '2423653942467',
      FINICITY_PARTNER_SECRET: 'demo_partner_secret_mastercard',
      FINICITY_CUSTOMER_ID: '1005061234',
      FINICITY_CUSTOMER_USERNAME: 'customerusername1',
      FINICITY_ENVIRONMENT: 'sandbox',
      CHASE_API_BASE_URL: 'https://apidemo.chase.com',
      CHASE_DEVELOPER_BASE_URL: 'https://developer.chase.com',
      CHASE_AUTHORIZATION: 'EB3ik8VN9sAV2YjUnZv5UUcAUzFg',
      CHASE_TRACE_ID: '562952952929829',
      CHASE_CLIENT_ID: 'SUNSHINE_WALLET',
      INTUIT_CLIENT_ID: 'ABySM9kH7sQ0wfw8Mb3SB30DqWCRQNG6cDQMQVf5gSMvugU5n8',
      INTUIT_REDIRECT_URI: 'https://developer.intuit.com/app/developer/quickstart',
      INTUIT_ENVIRONMENT: 'sandbox',
    };

    setEditableValues(prev => ({
      ...prev,
      ...demoDefaults,
    }));

    setSaving(true);
    try {
      const res = await apiFetch<any>('/api/env/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: demoDefaults }),
      });

      const data = res.data;
      if (res.ok && data?.success) {
        setStatusMessage({ type: 'success', text: 'Loaded sandbox demo environment defaults across all 6 service providers!' });
        if (data.items) {
          setItems(data.items);
          setRawEnvText(data.rawEnvText || '');
        }
      } else {
        setStatusMessage({ type: 'error', text: res.error || data?.error || 'Failed to apply defaults' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Services', icon: Layers },
    { id: 'google', label: 'Google Cloud & IAM', icon: Shield },
    { id: 'gemini', label: 'Google Gemini AI', icon: Sparkles },
    { id: 'finicity', label: 'Mastercard / Finicity', icon: Building2 },
    { id: 'chase', label: 'Chase Open Banking', icon: CreditCard },
    { id: 'intuit', label: 'QuickBooks Online', icon: Key },
    { id: 'security', label: 'Server & API Keys', icon: Lock },
  ];

  const filteredItems = items.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.key.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q)
    );
  });

  const totalCount = items.length;
  const configuredCount = items.filter(i => editableValues[i.key] && editableValues[i.key].trim().length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/80 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1.5 font-semibold">
                <Server className="w-3.5 h-3.5" />
                Live Runtime Environment
              </span>
              <span className="bg-blue-500/20 text-blue-300 font-mono text-xs px-2.5 py-1 rounded-md border border-blue-500/30">
                {configuredCount} / {totalCount} Variables Configured
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              Global Environment Variables & Service Config
            </h1>
            <p className="text-slate-400 text-sm max-w-3xl">
              Centralized credential and configuration manager powering Google Cloud IAM, Google Gemini AI, Mastercard Open Finance (Finicity), Chase Loyalty Rewards, QuickBooks Online, and Master Security Keys.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleLoadDemoDefaults}
              disabled={saving}
              className="px-3.5 py-2.5 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Populate test sandbox credentials for all providers"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Sandbox Defaults</span>
            </button>

            <button
              onClick={() => copyToClipboard(rawEnvText, 'full-env')}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedKey === 'full-env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy .env</span>
            </button>

            <button
              onClick={handleDownloadEnv}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download .env file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .env</span>
            </button>

            <button
              onClick={() => setImportModalOpen(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Import .env</span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save & Apply</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
              : 'bg-red-950/50 border-red-800 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter by variable name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Variables Grid */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Loading environment variables...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
            No environment variables match your search query.
          </div>
        ) : (
          filteredItems.map(item => {
            const isSecret = item.isSecret;
            const isRevealed = revealedSecrets[item.key] || false;
            const currentValue = editableValues[item.key] ?? item.value ?? '';
            const isConfigured = Boolean(currentValue && currentValue.trim().length > 0);

            return (
              <div
                key={item.key}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-4 lg:p-5 rounded-xl space-y-3 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-sm font-bold text-white tracking-wide">
                      {item.key}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {item.categoryLabel}
                    </span>
                    {isConfigured ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> SET
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> EMPTY
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isSecret && (
                      <button
                        type="button"
                        onClick={() => handleToggleReveal(item.key)}
                        className="text-slate-400 hover:text-white text-xs flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded border border-slate-800"
                        title={isRevealed ? 'Mask secret' : 'Reveal secret'}
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentValue, item.key)}
                      className="text-slate-400 hover:text-white text-xs flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono"
                      title="Copy variable value"
                    >
                      {copiedKey === item.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <p className="text-slate-400 text-xs">{item.description}</p>

                {/* Input or Textarea depending on multiline (e.g. private key) */}
                {item.key.includes('PRIVATE_KEY') || item.key.includes('AUTHORIZATION2') ? (
                  <textarea
                    rows={3}
                    value={isSecret && !isRevealed && currentValue ? item.maskedValue : currentValue}
                    onChange={e => handleFieldChange(item.key, e.target.value)}
                    placeholder={`Enter ${item.key}...`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-hidden focus:border-emerald-500"
                  />
                ) : (
                  <input
                    type={isSecret && !isRevealed ? 'password' : 'text'}
                    value={currentValue}
                    onChange={e => handleFieldChange(item.key, e.target.value)}
                    placeholder={`Enter ${item.key}...`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-hidden focus:border-emerald-500"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Save Button Floating Bottom Bar */}
      <div className="sticky bottom-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
        <div className="text-xs text-slate-400 hidden sm:block">
          Changes are persisted in server process memory and synchronized across all active gateway components.
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer ml-auto"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save & Apply Environment Changes</span>
        </button>
      </div>

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" /> Import .env Configuration
              </h3>
              <button
                onClick={() => setImportModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-400 text-xs">
              Paste the contents of your <code className="text-slate-200 bg-slate-950 px-1.5 py-0.5 rounded">.env</code> file below. Any matching variables will be parsed and loaded into the environment manager.
            </p>

            <textarea
              rows={12}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder={`# Paste your .env contents here\nINTUIT_CLIENT_ID="ABySM9k..."\nFINICITY_APP_KEY="24236..."\nCHASE_AUTHORIZATION="..."`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-hidden focus:border-emerald-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleParseAndImport}
                disabled={saving || !importText.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Parse & Import .env</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
