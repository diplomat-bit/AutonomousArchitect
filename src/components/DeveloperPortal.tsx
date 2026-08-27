import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  User,
  Plus,
  Trash2,
  Copy,
  Check,
  Terminal,
  Database,
  RefreshCw,
  Activity,
  CheckCircle2,
  Lock,
  Globe,
  Server,
  FileText,
  FileCode,
  Sliders,
  Sparkles,
  Upload,
  UploadCloud,
  CreditCard,
} from 'lucide-react';
import ChaseLoyaltyConsole from './ChaseLoyaltyConsole';
import { EnvironmentVariablesManager } from './EnvironmentVariablesManager';

interface DeveloperPortalProps {
  onApiKeySelect?: (key: string) => void;
}

export default function DeveloperPortal({ onApiKeySelect }: DeveloperPortalProps) {
  const [email, setEmail] = useState('developer@aibanking.dev');
  const [name, setName] = useState('Master Developer');
  const [user, setUser] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState('Production Microservice Key');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'global-env' | 'keys' | 'service-account' | 'token-mint' | 'chase-loyalty' | 'logs' | 'records' | 'playground'>('global-env');
  const [googleHmac, setGoogleHmac] = useState<any>(null);
  const [hmacLoading, setHmacLoading] = useState(false);

  // Service Account & Env state
  const [saProjectId, setSaProjectId] = useState('aistudio-quickbooksoauth2-43d92844');
  const [saClientEmail, setSaClientEmail] = useState('service-principal@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com');
  const [saHmacServiceAccount, setSaHmacServiceAccount] = useState('service-principal@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com');
  const [saPrivateKey, setSaPrivateKey] = useState('');
  const [saPrivateKeyId, setSaPrivateKeyId] = useState('');
  const [saHmacAccessId, setSaHmacAccessId] = useState('');
  const [saHmacSecret, setSaHmacSecret] = useState('');
  const [saJsonInput, setSaJsonInput] = useState('');
  const [envExportText, setEnvExportText] = useState('');
  const [saConfigSaving, setSaConfigSaving] = useState(false);

  // Token Minting State
  const [tokenScope, setTokenScope] = useState('https://www.googleapis.com/auth/cloud-platform');
  const [generatedTokens, setGeneratedTokens] = useState<any>(null);
  const [tokenMintingLoading, setTokenMintingLoading] = useState(false);

  // Playground state
  const [testEndpoint, setTestEndpoint] = useState('/api/intuit/universal/transform-and-ingest');
  const [testApiKey, setTestApiKey] = useState('sk_live_aibanking_9f83a82e71d4b609c217');
  const [testPayload, setTestPayload] = useState(
    JSON.stringify(
      {
        rawData: {
          accountGroup: 'CHECKING',
          checkingAccountsDetails: [
            {
              productName: 'Sovereign Business Checking',
              displayAccountNumber: '1010',
              currentBalance: 45000.0,
            },
          ],
        },
        targetEntity: 'Account',
      },
      null,
      2
    )
  );
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchLogsAndRecords();
    fetchGoogleHmac();
    fetchServiceAccountConfig();
  }, []);

  const fetchServiceAccountConfig = async () => {
    try {
      const res = await fetch('/api/google/service-account/env-export');
      const data = await res.json();
      if (data.success) {
        setEnvExportText(data.envText);
        if (data.servicePrincipal) {
          setSaProjectId(data.servicePrincipal.projectId || '');
          setSaClientEmail(data.servicePrincipal.clientEmail || '');
          setSaPrivateKeyId(data.servicePrincipal.privateKeyId || '');
        }
        if (data.hmacKey) {
          setSaHmacServiceAccount(data.hmacKey.serviceAccount || data.servicePrincipal?.clientEmail || '');
          setSaHmacAccessId(data.hmacKey.accessId || '');
        }
      }
    } catch (err) {
      console.error('Failed to fetch service account config', err);
    }
  };

  const handleSaveServiceAccount = async () => {
    setSaConfigSaving(true);
    try {
      const res = await fetch('/api/google/service-account/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceAccountJson: saJsonInput.trim() || undefined,
          projectId: saProjectId.trim() || undefined,
          clientEmail: saClientEmail.trim() || undefined,
          privateKey: saPrivateKey.trim() || undefined,
          privateKeyId: saPrivateKeyId.trim() || undefined,
          hmacServiceAccount: saHmacServiceAccount.trim() || undefined,
          hmacAccessId: saHmacAccessId.trim() || undefined,
          hmacSecret: saHmacSecret.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnvExportText(data.envText);
        if (data.hmacKey) {
          setGoogleHmac({
            ...googleHmac,
            serviceAccountEmail: data.hmacKey.serviceAccount || saHmacServiceAccount,
            accessId: data.hmacKey.accessId,
            secret: saHmacSecret || googleHmac?.secret,
            secretPrefix: data.hmacKey.secretPrefix,
            state: data.hmacKey.state,
          });
        }
        alert('Service Account & HMAC credentials successfully configured and activated!');
        fetchLogsAndRecords();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err: any) {
      alert('Failed to save service account config: ' + err.message);
    } finally {
      setSaConfigSaving(false);
    }
  };

  const [uploadDragOver, setUploadDragOver] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFileContent(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    readFileContent(file);
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSaJsonInput(content);
        // Auto parse immediately on upload
        processImportJson(content);
      }
    };
    reader.readAsText(file);
  };

  const processImportJson = async (jsonTextToImport?: string) => {
    const textToUse = jsonTextToImport || saJsonInput;
    if (!textToUse.trim()) {
      alert('Please select a JSON file or paste your Google Service Account JSON into the text box first.');
      return;
    }
    setSaConfigSaving(true);
    try {
      const res = await fetch('/api/google/service-account/import-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawJson: textToUse.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setEnvExportText(data.envText);
        if (data.parsed) {
          setSaProjectId(data.parsed.projectId || '');
          setSaClientEmail(data.parsed.clientEmail || '');
          setSaPrivateKeyId(data.parsed.privateKeyId || '');
        }
        alert('Google Cloud Service Account JSON imported and activated successfully!');
        fetchServiceAccountConfig();
      } else {
        alert('Import error: ' + data.error);
      }
    } catch (err: any) {
      alert('Failed to import JSON: ' + err.message);
    } finally {
      setSaConfigSaving(false);
    }
  };

  const handleGenerateOAuthToken = async () => {
    setTokenMintingLoading(true);
    try {
      const res = await fetch('/api/google/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: saClientEmail,
          scope: tokenScope,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedTokens(data);
        fetchUserData();
      } else {
        alert('Token Generation Error: ' + data.error);
      }
    } catch (err: any) {
      alert('Failed to generate token: ' + err.message);
    } finally {
      setTokenMintingLoading(false);
    }
  };

  const handleImportJson = async () => {
    processImportJson();
  };

  const fetchGoogleHmac = async () => {
    try {
      const res = await fetch('/api/google/hmac/active');
      const data = await res.json();
      if (data.success && data.hmacKey) {
        setGoogleHmac(data.hmacKey);
        setSaHmacAccessId(data.hmacKey.accessId);
        setSaHmacSecret(data.hmacKey.secret);
      }
    } catch (err) {
      console.error('Failed to fetch Google HMAC key', err);
    }
  };

  const handleGenerateHmacKey = async () => {
    setHmacLoading(true);
    try {
      const res = await fetch('/api/google/hmac/generate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceAccountEmail: user?.email || 'service-principal@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com' }),
      });
      const data = await res.json();
      if (data.success && data.hmacKey) {
        setGoogleHmac(data.hmacKey);
        alert('Google Cloud Service Account HMAC Key provisioned and activated!');
      }
    } catch (err: any) {
      alert('Failed to generate Google HMAC key: ' + err.message);
    } finally {
      setHmacLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setKeys(data.keys || []);
        if (data.keys?.[0]?.key) {
          setTestApiKey(data.keys[0].key);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user data', err);
    }
  };

  const handleRegisterOrLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        await fetchUserData();
        alert('Account authenticated / registered successfully!');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName, userEmail: email, rateLimit: 5000 }),
      });
      const data = await res.json();
      if (data.success) {
        setKeys([data.key, ...keys]);
        setTestApiKey(data.key.key);
        alert('New API Key generated and secured in Firestore!');
      }
    } catch (err: any) {
      alert('Failed to generate key: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setKeys(keys.map((k) => (k.id === id ? { ...k, status: 'revoked' } : k)));
      }
    } catch (err: any) {
      alert('Failed to revoke key: ' + err.message);
    }
  };

  const fetchLogsAndRecords = async () => {
    try {
      const [logsRes, recsRes] = await Promise.all([
        fetch('/api/logs?limit=50'),
        fetch('/api/records?limit=50'),
      ]);
      const logsData = await logsRes.json();
      const recsData = await recsRes.json();
      if (logsData.success) setLogs(logsData.logs || []);
      if (recsData.success) setRecords(recsData.records || []);
    } catch (err) {
      console.error('Failed to fetch logs/records', err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const executePlaygroundTest = async () => {
    setTestLoading(true);
    try {
      let bodyData = {};
      try {
        bodyData = JSON.parse(testPayload);
      } catch {
        bodyData = { rawData: testPayload };
      }

      const res = await fetch(testEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': testApiKey,
        },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      setTestResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });
      fetchLogsAndRecords();
    } catch (err: any) {
      setTestResponse({ error: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Developer Portal & API Security Gateway
                <span className="text-xs bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-500/30">
                  Firestore Secured
                </span>
              </h1>
            </div>
          </div>
          <p className="text-slate-400 text-sm max-w-3xl">
            Manage your developer accounts, generate cryptographic API keys, audit live request logs, and test endpoints in real-time with full Firestore persistence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogsAndRecords}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Account Authentication Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleRegisterOrLogin} className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
            <User className="w-4 h-4 text-blue-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Developer Email"
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-56"
              required
            />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl w-36 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
            Sign In / Register
          </button>
        </form>
        {user && (
          <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Signed in as <strong className="text-white">{user.email}</strong> ({user.name})
            </span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('global-env')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
            activeSubTab === 'global-env'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-400/50'
              : 'text-emerald-300 hover:text-white bg-emerald-950/30 border border-emerald-500/30'
          }`}
        >
          <Server className="w-4 h-4 text-emerald-300" /> 🌐 Master .env & Service Config
        </button>
        <button
          onClick={() => setActiveSubTab('service-account')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            activeSubTab === 'service-account' ? 'bg-slate-800 text-emerald-400 shadow-sm border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-400" /> Google Service Account & HMAC (.env)
        </button>
        <button
          onClick={() => setActiveSubTab('token-mint')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
            activeSubTab === 'token-mint' ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40' : 'text-purple-300 hover:text-white bg-purple-950/30 border border-purple-500/30'
          }`}
        >
          <Key className="w-4 h-4 text-purple-300" /> 🪙 Token Minting (ya29... & RS256)
        </button>
        <button
          onClick={() => setActiveSubTab('chase-loyalty')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
            activeSubTab === 'chase-loyalty' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 border border-blue-400/50' : 'text-blue-300 hover:text-white bg-blue-950/30 border border-blue-500/30'
          }`}
        >
          <CreditCard className="w-4 h-4 text-blue-400" /> 💳 Chase Rewards & Loyalty API
        </button>
        <button
          onClick={() => setActiveSubTab('keys')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            activeSubTab === 'keys' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" /> API Keys ({keys.length})
        </button>
        <button
          onClick={() => setActiveSubTab('playground')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            activeSubTab === 'playground' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" /> Interactive API Playground
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            activeSubTab === 'logs' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" /> Live Audit Logs ({logs.length})
        </button>
        <button
          onClick={() => setActiveSubTab('records')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            activeSubTab === 'records' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" /> Firestore Records ({records.length})
        </button>
      </div>

      {/* TAB CONTENT: GLOBAL ENVIRONMENT VARIABLES (.ENV MANAGER) */}
      {activeSubTab === 'global-env' && (
        <EnvironmentVariablesManager />
      )}

      {/* TAB CONTENT: GOOGLE SERVICE ACCOUNT & HMAC (.ENV) OR TOKEN MINT */}
      {(activeSubTab === 'service-account' || activeSubTab === 'token-mint') && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <Shield className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-white">Google Service Account & HMAC Credentials</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                    Live Active Runtime
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Configure your Google Cloud Service Principal, RSA private keys, and Cloud Storage HMAC credentials (<code className="text-emerald-400">GOOG1E...</code>) for signed JWT assertions, GOOG4-HMAC-SHA256 canonical requests, and API self-calling.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(envExportText || '', 'full_env')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  {copiedKey === 'full_env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy .env Snippet
                </button>
                <button
                  onClick={handleSaveServiceAccount}
                  disabled={saConfigSaving}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                >
                  {saConfigSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Save & Apply to Runtime
                </button>
              </div>
            </div>

            {/* Active Credentials Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Service Account Email:</span>
                <span className="text-slate-200 truncate block font-bold" title={saClientEmail}>{saClientEmail}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider block">HMAC Access ID:</span>
                <span className="text-emerald-400 font-bold block">{saHmacAccessId || 'GOOG1E...'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider block">GCP Project ID:</span>
                <span className="text-blue-400 block font-bold">{saProjectId}</span>
              </div>
            </div>
          </div>

          {/* Dual Column: JSON Importer & Form Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: JSON File Upload & Importer */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-400" /> Upload Google Service Account JSON
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json,application/json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" /> Choose JSON File
                  </button>
                  <button
                    type="button"
                    onClick={handleImportJson}
                    disabled={saConfigSaving}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Parse & Load
                  </button>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setUploadDragOver(true);
                }}
                onDragLeave={() => setUploadDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                  uploadDragOver
                    ? 'border-emerald-400 bg-emerald-950/30 text-emerald-300'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-200">
                    Click to browse or drag & drop your <code className="text-emerald-400 font-mono">.json</code> key file here
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Directly loads client_email, project_id, client_id, and tokens into memory.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-mono text-[11px] block mb-1">
                  Or paste raw JSON contents below:
                </label>
                <textarea
                  value={saJsonInput}
                  onChange={(e) => setSaJsonInput(e.target.value)}
                  placeholder={`{
  "type": "service_account",
  "project_id": "your-gcp-project",
  "client_email": "sa@your-gcp-project.iam.gserviceaccount.com",
  "client_id": "115630309363072892165",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}`}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Column 2: Individual Field Configuration */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" /> Environment Variables & HMAC Settings
              </h4>
              <p className="text-xs text-slate-400">
                Edit individual parameters or configure your Google Cloud HMAC Access ID and Secret:
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-mono text-[11px] block mb-1">GOOGLE_PROJECT_ID</label>
                  <input
                    type="text"
                    value={saProjectId}
                    onChange={(e) => setSaProjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono text-[11px] block mb-1">GOOGLE_CLIENT_EMAIL (General RSA SA)</label>
                  <input
                    type="text"
                    value={saClientEmail}
                    onChange={(e) => setSaClientEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <label className="text-emerald-400 font-mono text-[11px] block mb-1">
                    GOOGLE_HMAC_SERVICE_ACCOUNT (Dedicated HMAC Service Account)
                  </label>
                  <input
                    type="text"
                    value={saHmacServiceAccount}
                    onChange={(e) => setSaHmacServiceAccount(e.target.value)}
                    placeholder="my-hmac-sa@project.iam.gserviceaccount.com"
                    className="w-full bg-slate-950 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-emerald-400 font-mono text-[11px] block mb-1">GOOGLE_HMAC_ACCESS_ID</label>
                    <input
                      type="text"
                      value={saHmacAccessId}
                      onChange={(e) => setSaHmacAccessId(e.target.value)}
                      placeholder="GOOG1E..."
                      className="w-full bg-slate-950 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-emerald-400 font-mono text-[11px] block mb-1">GOOGLE_HMAC_SECRET</label>
                    <input
                      type="password"
                      value={saHmacSecret}
                      onChange={(e) => setSaHmacSecret(e.target.value)}
                      placeholder="Base64 Secret..."
                      className="w-full bg-slate-950 border border-emerald-500/40 text-slate-200 px-3 py-2 rounded-xl font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-mono text-[11px] block mb-1">GOOGLE_PRIVATE_KEY (RSA PEM)</label>
                  <textarea
                    value={saPrivateKey}
                    onChange={(e) => setSaPrivateKey(e.target.value)}
                    placeholder="-----BEGIN PRIVATE KEY-----\n..."
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl font-mono text-[11px] focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveServiceAccount}
                  disabled={saConfigSaving}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  Save Service Account & HMAC
                </button>
              </div>
            </div>
          </div>

          {/* Formatted .env Live Export Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> Exported .env Configuration
              </h4>
              <button
                onClick={() => copyToClipboard(envExportText, 'env_export_bottom')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition"
              >
                {copiedKey === 'env_export_bottom' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy .env
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Copy and paste these environment variables into your Cloud Run, Vercel, or local <code className="text-slate-300">.env</code> configuration:
            </p>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400/90 overflow-x-auto max-h-64">
              {envExportText || '# Generating .env export...'}
            </pre>
          </div>

          {/* Token Minting & Generation Console */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/30 border border-purple-500/30 p-6 rounded-2xl space-y-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                    <Key className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-white">OAuth2 / IAM Token Minting Console</h3>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded border border-purple-500/30">
                    RS256 JWT & Bearer Tokens
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Generate live OAuth2 <code className="text-purple-400">Bearer Access Tokens</code> (<code className="text-slate-300">ya29...</code>), RS256 JWT assertions, and ID tokens from your active Service Account to use across APIs.
                </p>
              </div>

              <button
                onClick={handleGenerateOAuthToken}
                disabled={tokenMintingLoading}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-purple-600/30"
              >
                {tokenMintingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Access Token (ya29...)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-2">
                <label className="text-slate-400 text-[11px] block">OAuth2 Scope:</label>
                <select
                  value={tokenScope}
                  onChange={(e) => setTokenScope(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:border-purple-500 focus:outline-none"
                >
                  <option value="https://www.googleapis.com/auth/cloud-platform">https://www.googleapis.com/auth/cloud-platform (All GCP Services)</option>
                  <option value="https://www.googleapis.com/auth/devstorage.full_control">https://www.googleapis.com/auth/devstorage.full_control (Cloud Storage)</option>
                  <option value="https://www.googleapis.com/auth/generative-language">https://www.googleapis.com/auth/generative-language (Gemini AI)</option>
                  <option value="https://www.googleapis.com/auth/userinfo.email">https://www.googleapis.com/auth/userinfo.email (User Info & Auth)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-slate-400 text-[11px] block">Active Service Account Principal:</label>
                <input
                  type="text"
                  value={saClientEmail}
                  readOnly
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-400 px-3 py-2 rounded-xl"
                />
              </div>
            </div>

            {/* Generated Tokens Display */}
            {generatedTokens && (
              <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-purple-500/20 text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Active Token Generated (Expires in 3600s)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{generatedTokens.expires_at}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-400 font-mono text-[11px]">Bearer Access Token (ya29...):</span>
                      <button
                        onClick={() => copyToClipboard(generatedTokens.access_token, 'minted_access_token')}
                        className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        {copiedKey === 'minted_access_token' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy Token
                      </button>
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={generatedTokens.access_token}
                      className="w-full bg-slate-900 border border-purple-500/30 text-emerald-400 font-mono px-3 py-2 rounded-lg select-all"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-400 font-mono text-[11px]">Authorization Header:</span>
                      <button
                        onClick={() => copyToClipboard(`Bearer ${generatedTokens.access_token}`, 'minted_auth_header')}
                        className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        {copiedKey === 'minted_auth_header' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy Header
                      </button>
                    </div>
                    <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-purple-300 overflow-x-auto">
                      Authorization: Bearer {generatedTokens.access_token}
                    </pre>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-400 font-mono text-[11px]">RS256 Signed JWT Assertion:</span>
                      <button
                        onClick={() => copyToClipboard(generatedTokens.jwt_assertion, 'minted_jwt')}
                        className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        {copiedKey === 'minted_jwt' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Copy JWT
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={3}
                      value={generatedTokens.jwt_assertion}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px] p-2.5 rounded-lg select-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 1: API KEYS */}
      {activeSubTab === 'keys' && (
        <div className="space-y-6">
          {/* Google Cloud Service Account HMAC Key Section */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-blue-500/30 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                    <Shield className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-white">Google Cloud Service Account HMAC Key</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                    GOOG4-HMAC-SHA256
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Cryptographic HMAC-SHA256 credentials for Google Cloud Interoperability and signed canonical request authentication.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateHmacKey}
                  disabled={hmacLoading}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  {hmacLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Rotate / Provision HMAC Key
                </button>
              </div>
            </div>

            {googleHmac ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="space-y-1.5">
                  <span className="text-slate-400 text-[11px] block">HMAC Access ID (GOOG4 Credential):</span>
                  <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-emerald-300 font-bold">
                    <span>{googleHmac.accessId}</span>
                    <button
                      onClick={() => copyToClipboard(googleHmac.accessId, 'hmac_access_id')}
                      className="text-slate-400 hover:text-white"
                      title="Copy Access ID"
                    >
                      {copiedKey === 'hmac_access_id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-slate-500 text-[10px]">Service Account: {googleHmac.serviceAccountEmail}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-slate-400 text-[11px] block">HMAC Secret (Base64 Key):</span>
                  <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-slate-300 font-bold">
                    <span>{googleHmac.secretPrefix || `${googleHmac.secret?.slice(0, 8)}...`}</span>
                    <button
                      onClick={() => copyToClipboard(googleHmac.secret, 'hmac_secret')}
                      className="text-slate-400 hover:text-white"
                      title="Copy HMAC Secret"
                    >
                      {copiedKey === 'hmac_secret' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-slate-500 text-[10px]">Algorithm: HMAC-SHA256 • Status: {googleHmac.state}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-2">Loading active Google HMAC key credentials...</div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-400" /> Active API Keys & Credentials
                </h3>
                <p className="text-xs text-slate-400">
                  Use these cryptographic keys in your request headers (`x-api-key`) to authenticate calls.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key description..."
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl w-52 focus:outline-none"
                />
                <button
                  onClick={handleCreateKey}
                  disabled={loading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" /> Generate New Key
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{k.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold ${
                          k.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {k.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>Key: <strong className="text-emerald-300">{k.keyPrefix || k.key}</strong></span>
                      <span>• Calls: <strong className="text-white">{k.totalCalls}</strong></span>
                      <span>• Rate Limit: <strong className="text-white">{k.rateLimit}/hr</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(k.key, k.id)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                      title="Copy Secret Key"
                    >
                      {copiedKey === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === k.id ? 'Copied' : 'Copy Key'}
                    </button>
                    {onApiKeySelect && (
                      <button
                        onClick={() => onApiKeySelect(k.key)}
                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition border border-blue-500/30"
                      >
                        Use in App
                      </button>
                    )}
                    {k.status === 'active' && (
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2 rounded-lg transition border border-rose-500/30"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {keys.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">No API keys generated yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: PLAYGROUND */}
      {activeSubTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" /> Test Endpoint Request
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">API Endpoint</label>
                <select
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl font-mono"
                >
                  <option value="/api/intuit/universal/transform-and-ingest">POST /api/intuit/universal/transform-and-ingest (AI Ingest)</option>
                  <option value="/api/intuit/universal/file-upload-ingest">POST /api/intuit/universal/file-upload-ingest (File Upload)</option>
                  <option value="/api/intuit/query">POST /api/intuit/query (QBO SQL Query)</option>
                  <option value="/api/intuit/suite/accounts">POST /api/intuit/suite/accounts (Create Account)</option>
                  <option value="/api/records">POST /api/records (Persist to Firestore)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">API Key (`x-api-key` header)</label>
                <input
                  type="text"
                  value={testApiKey}
                  onChange={(e) => setTestApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-emerald-300 px-3 py-2 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">Request Body (JSON)</label>
                <textarea
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  className="w-full h-48 bg-slate-950 border border-slate-800 text-xs text-emerald-300 p-3 rounded-xl font-mono resize-none"
                />
              </div>

              <button
                onClick={executePlaygroundTest}
                disabled={testLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                {testLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
                Send API Request
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col h-[550px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-400" /> Response Output
              </span>
              {testResponse && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    testResponse.status === 200 || testResponse.status === 201
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  Status: {testResponse.status || 500}
                </span>
              )}
            </div>
            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-auto font-mono text-xs text-slate-300">
              {testResponse ? (
                <pre>{JSON.stringify(testResponse, null, 2)}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Terminal className="w-8 h-8 opacity-30" />
                  <p className="text-xs">Configure payload and send request to inspect live response.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CHASE LOYALTY & REWARDS */}
      {activeSubTab === 'chase-loyalty' && (
        <ChaseLoyaltyConsole />
      )}

      {/* TAB CONTENT 3: LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> Live Request Audit Logs (Firestore Tracked)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Method & Endpoint</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">API Key Prefix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3">
                      <span className="text-blue-400 font-bold mr-2">{log.method}</span>
                      <span className="text-slate-200">{log.endpoint}</span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.statusCode === 200 || log.statusCode === 201
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{log.durationMs}ms</td>
                    <td className="py-3 text-slate-400">{log.apiKeyPrefix || 'ANONYMOUS'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">No audit logs recorded yet.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: RECORDS */}
      {activeSubTab === 'records' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" /> Firestore Stored Banking Records & Statements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((rec) => (
              <div key={rec.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-mono font-bold">{rec.accountGroup || 'RECORD'}</span>
                  <span className="text-slate-400 text-[10px]">{new Date(rec.timestamp).toLocaleString()}</span>
                </div>
                <pre className="p-3 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 max-h-36 overflow-auto">
                  {JSON.stringify(rec.payload, null, 2)}
                </pre>
              </div>
            ))}
            {records.length === 0 && (
              <div className="col-span-2 p-8 text-center text-slate-500 text-xs">No stored records in Firestore yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
