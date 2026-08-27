import React, { useState, useEffect } from 'react';
import {
  Zap,
  Lock,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  Shield,
  Layers,
  ArrowRight,
  Database,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Globe,
  Radio,
  FileCode,
  Terminal,
  Activity,
  CreditCard,
  Building2,
  Trash2,
} from 'lucide-react';
import { apiFetch } from '../utils/apiClient';

export interface QuickBooksLinkedRecord {
  bridgeId: string;
  source: 'MASTERCARD_OPEN_FINANCE' | 'CHASE_OPEN_BANKING' | 'UNIVERSAL_INGEST';
  action: 'AUTHENTICATION' | 'ACCOUNT_AGGREGATION' | 'TRANSACTION_SYNC' | 'REWARDS_REDEMPTION' | 'CONNECT_GENERATE' | 'BALANCE_CHECK';
  realmId: string | null;
  qboAccountRef?: {
    id?: string;
    name?: string;
    accountType?: string;
    accountSubType?: string;
  };
  qboLinkedEntityType: 'Account' | 'JournalEntry' | 'Purchase' | 'Deposit' | 'Payment' | 'Customer' | 'Transfer';
  qboEntityId?: string;
  externalEntityId: string;
  amount?: number;
  currency?: string;
  timestamp: string;
  status: 'LOCKED_INTO_QUICKBOOKS' | 'SYNCED_WITH_METADATA' | 'PROVISIONED_AUTONOMOUSLY';
  technicalMetadata: {
    telemetryEpoch: number;
    isoTimestamp: string;
    deterministicHash: string;
    cryptographicHmacSignature: string;
    sourceGatewayTraceId: string;
    quickbooksRealmId: string;
    quickbooksSyncToken: string;
    finicityCorrelationId?: string;
    chaseInteractionId?: string;
    jpmcAccountUniversalUuid?: string;
    mastercardPartnerId?: string;
    mastercardCustomerId?: string;
    glAccountMapping: {
      debitAccount: string;
      creditAccount: string;
      chartOfAccountsCategory: string;
      reconciliationStatus: 'RECONCILED_AUTONOMOUS' | 'PENDING_SETTLEMENT' | 'LOCKED_AUDIT_LOG';
    };
    networkTelemetry: {
      protocol: string;
      provenanceIp: string;
      auditProvenance: string;
      immutabilityFlag: boolean;
    };
    rawPayloadSignature: string;
  };
  summary: string;
  rawPayload: any;
}

interface AutonomousBridgeLedgerProps {
  realmId?: string;
  hasTokens?: boolean;
}

export const AutonomousBridgeLedger: React.FC<AutonomousBridgeLedgerProps> = ({
  realmId,
  hasTokens = false,
}) => {
  const [records, setRecords] = useState<QuickBooksLinkedRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<QuickBooksLinkedRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<'ALL' | 'CHASE' | 'MASTERCARD'>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch<{ success: boolean; records: QuickBooksLinkedRecord[] }>('/api/bridge/records');
      if (res.ok && res.data?.records) {
        setRecords(res.data.records);
        if (!selectedRecord && res.data.records.length > 0) {
          setSelectedRecord(res.data.records[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load bridge records', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(fetchRecords, 3000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleManualSync = async (source: 'CHASE_OPEN_BANKING' | 'MASTERCARD_OPEN_FINANCE') => {
    try {
      setIsSimulating(true);
      if (source === 'CHASE_OPEN_BANKING') {
        await apiFetch('/api/chase/v1/loyalty/points/balances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'USER-CHASE-009' }),
        });
      } else {
        await apiFetch('/api/finicity/execute-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerId: '2423653942467',
            customerId: '1005061234',
          }),
        });
      }
      await fetchRecords();
    } catch (err) {
      console.error('Failed to trigger manual sync', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClearLedger = async () => {
    try {
      await apiFetch('/api/bridge/records', { method: 'DELETE' });
      setRecords([]);
      setSelectedRecord(null);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (filterSource === 'CHASE') return r.source === 'CHASE_OPEN_BANKING';
    if (filterSource === 'MASTERCARD') return r.source === 'MASTERCARD_OPEN_FINANCE';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Master Bridge Header */}
      <div className="bg-gradient-to-r from-[#161B22] via-[#0D1117] to-[#161B22] rounded-xl border border-[#30363D] p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Automated QBO-Banking Bridge & Technical Linking Engine
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  REAL-TIME ACTIVE
                </span>
              </h2>
            </div>
            <p className="text-xs text-[#8B949E] max-w-3xl leading-relaxed">
              Every single invocation to <span className="text-blue-400 font-mono font-semibold">Chase Open Banking</span> or{' '}
              <span className="text-red-400 font-mono font-semibold">Mastercard Open Finance</span> automatically writes an immutable,
              cryptographically verifiable linking record into QuickBooks Online with full Chart of Accounts GL mapping and SHA-384 provenance signatures.
            </p>
          </div>

          {/* Quick Triggers */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleManualSync('CHASE_OPEN_BANKING')}
              disabled={isSimulating}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold shadow-md transition-all border border-blue-400/40 disabled:opacity-50"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Locking...' : 'Test Chase Lock-In'}</span>
            </button>
            <button
              onClick={() => handleManualSync('MASTERCARD_OPEN_FINANCE')}
              disabled={isSimulating}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold shadow-md transition-all border border-red-400/40 disabled:opacity-50"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Locking...' : 'Test Mastercard Lock-In'}</span>
            </button>
            <button
              onClick={fetchRecords}
              className="p-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-[#C9D1D9] border border-[#30363D] transition-colors"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {records.length > 0 && (
              <button
                onClick={handleClearLedger}
                className="p-2 rounded-lg bg-[#21262d] hover:bg-rose-950/40 hover:text-rose-300 text-[#8B949E] border border-[#30363D] transition-colors"
                title="Reset bridge records"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#30363D]/60 text-xs">
          <div className="flex items-center space-x-2 bg-[#0D1117]/80 p-2.5 rounded-lg border border-[#30363D]">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-[#8B949E] block uppercase font-mono">QBO Connection</span>
              <span className="font-semibold text-emerald-400 font-mono">
                {realmId ? `Realm: ${realmId}` : 'Sovereign Federation'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-[#0D1117]/80 p-2.5 rounded-lg border border-[#30363D]">
            <Lock className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-[10px] text-[#8B949E] block uppercase font-mono">Auto-Lock Status</span>
              <span className="font-semibold text-white">100% Intercept Active</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-[#0D1117]/80 p-2.5 rounded-lg border border-[#30363D]">
            <Cpu className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-[10px] text-[#8B949E] block uppercase font-mono">Cryptographic Signing</span>
              <span className="font-semibold text-purple-300 font-mono">HMAC-SHA384</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-[#0D1117]/80 p-2.5 rounded-lg border border-[#30363D]">
            <Database className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-[#8B949E] block uppercase font-mono">Locked Records</span>
              <span className="font-semibold text-white font-mono">{records.length} Transactions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bridge Grid: Records List + Deep Metadata Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Streaming Records List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Live Intercepted Ledger</h3>
            </div>
            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 bg-[#0D1117] p-0.5 rounded-lg border border-[#30363D] text-[11px]">
              <button
                onClick={() => setFilterSource('ALL')}
                className={`px-2 py-1 rounded ${filterSource === 'ALL' ? 'bg-[#21262d] text-white font-bold' : 'text-[#8B949E]'}`}
              >
                All ({records.length})
              </button>
              <button
                onClick={() => setFilterSource('CHASE')}
                className={`px-2 py-1 rounded ${filterSource === 'CHASE' ? 'bg-blue-600 text-white font-bold' : 'text-blue-400'}`}
              >
                Chase
              </button>
              <button
                onClick={() => setFilterSource('MASTERCARD')}
                className={`px-2 py-1 rounded ${filterSource === 'MASTERCARD' ? 'bg-red-600 text-white font-bold' : 'text-red-400'}`}
              >
                Mastercard
              </button>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#21262d] text-emerald-400 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">No Banking Calls Intercepted Yet</h4>
              <p className="text-xs text-[#8B949E] max-w-xs mx-auto">
                Execute any call in the Chase Loyalty or Mastercard/Finicity tabs, or click above to test the autonomous bridge lock.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => handleManualSync('CHASE_OPEN_BANKING')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow hover:bg-blue-500"
                >
                  Fire Chase Intercept
                </button>
                <button
                  onClick={() => handleManualSync('MASTERCARD_OPEN_FINANCE')}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold shadow hover:bg-red-500"
                >
                  Fire Mastercard Intercept
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredRecords.map((r) => {
                const isSelected = selectedRecord?.bridgeId === r.bridgeId;
                const isChase = r.source === 'CHASE_OPEN_BANKING';
                return (
                  <div
                    key={r.bridgeId}
                    onClick={() => setSelectedRecord(r)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#1c2128] border-emerald-500/80 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/40'
                        : 'bg-[#161B22] border-[#30363D] hover:border-[#8B949E]/40 hover:bg-[#1c2128]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider font-mono ${
                            isChase
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {isChase ? 'CHASE' : 'MASTERCARD'}
                        </span>
                        <span className="text-xs font-semibold text-white truncate max-w-[160px]">
                          {r.action.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#3FB950] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>LOCKED</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#8B949E] mt-2 line-clamp-1">{r.summary}</p>

                    <div className="mt-2.5 pt-2 border-t border-[#30363D]/60 flex items-center justify-between text-[11px] text-[#8B949E] font-mono">
                      <span className="text-white font-semibold">
                        {r.amount !== undefined && r.amount > 0 ? `$${r.amount.toLocaleString()}` : 'Snapshot Sync'}
                      </span>
                      <span>{new Date(r.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Insane Technical Metadata Inspector */}
        <div className="lg:col-span-7">
          {selectedRecord ? (
            <div className="bg-[#161B22] rounded-xl border border-[#30363D] overflow-hidden shadow-xl space-y-0">
              {/* Header */}
              <div className="p-4 bg-[#0D1117] border-b border-[#30363D] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      Deep Technical Linking Metadata & GL Bridge
                    </h4>
                    <span className="text-[10px] font-mono text-[#8B949E]">
                      Bridge UUID: {selectedRecord.bridgeId}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(JSON.stringify(selectedRecord, null, 2), selectedRecord.bridgeId)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-mono border border-[#30363D] transition-colors"
                >
                  {copiedId === selectedRecord.bridgeId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#3FB950]" />
                      <span className="text-[#3FB950]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#8B949E]" />
                      <span>Copy Full JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* Technical Linking Matrix */}
              <div className="p-5 space-y-5">
                {/* 1. Core Link Identifiers */}
                <div>
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>QuickBooks Entity & Chart of Accounts Linkage</span>
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D]">
                      <span className="text-[10px] text-[#8B949E] block">QBO Realm ID</span>
                      <span className="text-white font-bold">{selectedRecord.realmId || '9341453267972001'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D]">
                      <span className="text-[10px] text-[#8B949E] block">QBO Entity Target</span>
                      <span className="text-purple-300 font-bold">{selectedRecord.qboLinkedEntityType} ({selectedRecord.qboEntityId})</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D]">
                      <span className="text-[10px] text-[#8B949E] block">Sync Token</span>
                      <span className="text-emerald-400 font-bold">{selectedRecord.technicalMetadata.quickbooksSyncToken}</span>
                    </div>
                  </div>
                </div>

                {/* 2. GL Chart of Accounts Mapping */}
                <div>
                  <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>General Ledger & Reconciliation Route</span>
                  </h5>
                  <div className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-2">
                      <span className="text-[#8B949E]">Debit Account (Asset / Expense):</span>
                      <span className="text-white font-semibold">{selectedRecord.technicalMetadata.glAccountMapping.debitAccount}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#30363D]/60 pb-2">
                      <span className="text-[#8B949E]">Credit Account (Clearing / Liability):</span>
                      <span className="text-white font-semibold">{selectedRecord.technicalMetadata.glAccountMapping.creditAccount}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[#8B949E]">Reconciliation Audit Mode:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        {selectedRecord.technicalMetadata.glAccountMapping.reconciliationStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Cryptographic Provenance & Telemetry */}
                <div>
                  <h5 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Cryptographic Provenance & SHA-384 Signatures</span>
                  </h5>
                  <div className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#8B949E] block">HMAC-SHA384 Cryptographic Signature:</span>
                      <span className="text-purple-300 break-all select-all font-semibold">
                        {selectedRecord.technicalMetadata.cryptographicHmacSignature}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#30363D]/60">
                      <span className="text-[10px] text-[#8B949E] block">Deterministic Payload Hash (SHA-256):</span>
                      <span className="text-emerald-400 break-all select-all">
                        {selectedRecord.technicalMetadata.deterministicHash}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#30363D]/60 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-[#8B949E] block">Gateway Trace ID:</span>
                        <span className="text-white">{selectedRecord.technicalMetadata.sourceGatewayTraceId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8B949E] block">Protocol Security:</span>
                        <span className="text-amber-300 font-semibold">{selectedRecord.technicalMetadata.networkTelemetry.protocol}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Raw Upstream Payload Dump */}
                <div>
                  <h5 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Raw Intercepted Upstream Payload</span>
                  </h5>
                  <pre className="p-3.5 rounded-lg bg-[#0A0C10] border border-[#30363D] text-[11px] font-mono text-[#C9D1D9] max-h-56 overflow-y-auto">
                    {JSON.stringify(selectedRecord.rawPayload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-8 text-center text-[#8B949E] text-xs">
              Select an intercepted record on the left to inspect its deep technical metadata and QuickBooks linkage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
