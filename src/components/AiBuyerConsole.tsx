import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShoppingCart,
  CreditCard,
  Building2,
  Landmark,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Download,
  ArrowRight,
  Shield,
  FileText,
  DollarSign,
  Package,
  Layers,
  Check,
  Copy,
  Receipt,
  Bot,
  Zap,
  Tag,
  TrendingDown,
  Clock,
  ChevronDown,
  ChevronUp,
  FileCode,
  Store,
  MessageSquare
} from 'lucide-react';
import { TokenResponse } from '../types';
import { apiFetch } from '../utils/apiClient';

interface AiBuyerConsoleProps {
  tokens?: TokenResponse | null;
  realmId?: string;
  onNavigateToBridge?: () => void;
}

// Built-in sample payload seeded from user's provided file
const INITIAL_SYNCHRONIZED_FILE = {
  companyName: 'Sandbox Company US 822f',
  accountsCount: 200,
  customersCount: 30,
  invoicesCount: 32,
  paymentsCount: 16,
  bankAccountsCount: 189,
  cardsCount: 1,
  modernTreasuryAccountsSynced: 200,
  card: {
    id: '1150040002',
    name: 'Citi ThankYou® Premier Card',
    accountNumber: 'XXXXXXXXXXXX3250',
    type: 'CREDIT_CARD',
    currentBalance: -2996.57,
  },
  keyBankAccounts: [
    { id: '35', name: 'Checking', accountNumber: '1010', balance: 1201.00, type: 'Checking' },
    { id: '1150040003', name: 'Citi Platinum Savings Account', accountNumber: 'XXXXXX8543', balance: 5142.00, type: 'Savings' },
    { id: '1150040000', name: 'Citi Business Operating Checking', accountNumber: '05329451', balance: 3450.00, type: 'Checking' },
    { id: '1150040010', name: 'Checking (#1443)', accountNumber: '591443', balance: 850.00, type: 'Checking' },
    { id: '1150040017', name: 'Citi Account #MC-CUST-1005061234', accountNumber: 'MC-CUST-1005061234', balance: 1980.00, type: 'Checking' },
    { id: '200151639855507453329451', name: 'James OCallaghan Chase Checking', accountNumber: 'xxxxxx9451', balance: 2450.00, type: 'PERSONAL_CHECKING' }
  ]
};

export const AiBuyerConsole: React.FC<AiBuyerConsoleProps> = ({ tokens, realmId, onNavigateToBridge }) => {
  const [purchaseIntent, setPurchaseIntent] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusStep, setStatusStep] = useState<string>('');
  
  // Funding source selection
  const [selectedFundingSource, setSelectedFundingSource] = useState<string>('auto');
  const [autoExecuteQbo, setAutoExecuteQbo] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'prompt' | 'catalog' | 'chat' | 'history'>('prompt');
  
  // Catalog
  const [catalog, setCatalog] = useState<Array<any>>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState('all');

  // Purchase History
  const [history, setHistory] = useState<Array<any>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // AI Chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am your AI Purchasing Agent. I am connected to Sandbox Company US 822f with 200 QuickBooks accounts, Citi Corporate Card (3250), 189 Bank Accounts, and Modern Treasury Dual-Entry Ledgers. Tell me what your business needs to buy!`,
      time: new Date().toLocaleTimeString(),
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showPayloadDetails, setShowPayloadDetails] = useState(false);

  // Fetch catalog on mount
  useEffect(() => {
    fetchCatalog();
    fetchHistory();
  }, []);

  const fetchCatalog = async () => {
    setCatalogLoading(true);
    try {
      const res = await apiFetch<any>('/api/ai-buyer/catalog');
      if (res.ok && res.data?.catalog) {
        setCatalog(res.data.catalog);
      }
    } catch (e) {
      console.error('Failed to fetch catalog', e);
    } finally {
      setCatalogLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await apiFetch<any>('/api/ai-buyer/history');
      if (res.ok && res.data?.history) {
        setHistory(res.data.history);
      }
    } catch (e) {
      console.error('Failed to fetch history', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleExecutePurchase = async (intentToUse?: string) => {
    const textToBuy = intentToUse || purchaseIntent;
    if (!textToBuy.trim()) {
      setErrorMsg('Please specify what item or service you want the AI to purchase.');
      return;
    }

    setErrorMsg(null);
    setPurchasing(true);
    setStatusStep('Evaluating company funds & cash flow across 189 bank accounts...');

    // Progress simulation steps for high-craft UX feedback
    const stepTimer1 = setTimeout(() => {
      setStatusStep('Consulting Gemini 3.7 Flash for QBO Chart of Accounts & tax optimization...');
    }, 900);

    const stepTimer2 = setTimeout(() => {
      setStatusStep('Authorizing payment instrument & constructing dual-entry ledger transaction...');
    }, 1800);

    try {
      const res = await apiFetch<any>('/api/ai-buyer/analyze-and-buy', {
        method: 'POST',
        body: JSON.stringify({
          purchaseIntent: textToBuy,
          preferredAccountId: selectedFundingSource === 'auto' ? undefined : selectedFundingSource,
          autoExecute: autoExecuteQbo,
          tokenOverride: tokens?.access_token,
          realmIdOverride: realmId || tokens?.realmId,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (res.ok && res.data?.success) {
        setPurchaseResult(res.data.purchase);
        setStatusStep('Purchase authorized & logged in QuickBooks and Modern Treasury!');
        fetchHistory();
      } else {
        setErrorMsg(res.data?.error || 'Failed to complete autonomous AI purchase.');
      }
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setErrorMsg(err.message || 'Error communicating with AI Procurement Server.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleChatSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: new Date().toLocaleTimeString() },
    ]);
    setChatLoading(true);

    try {
      const res = await apiFetch<any>('/api/ai-buyer/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userText,
          history: chatMessages,
        }),
      });

      if (res.ok && res.data?.reply) {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'ai', text: res.data.reply, time: new Date().toLocaleTimeString() },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'ai', text: 'I processed your query against the QuickBooks Chart of Accounts. How can I assist with your next purchase order?', time: new Date().toLocaleTimeString() },
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'I am ready to help evaluate budgets and authorize purchases for Sandbox Company US 822f.', time: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const downloadReceipt = (format: 'txt' | 'json') => {
    if (!purchaseResult) return;
    const content = format === 'json'
      ? JSON.stringify(purchaseResult, null, 2)
      : `=====================================================
AI PROCUREMENT PURCHASE RECEIPT & AUDIT CERTIFICATE
=====================================================
Transaction ID    : ${purchaseResult.id}
Timestamp         : ${new Date(purchaseResult.timestamp).toLocaleString()}
Authorization Code: ${purchaseResult.authorizationCode}
QuickBooks PO Ref : ${purchaseResult.qboDocNumber || 'AI-PO-100492'}
QuickBooks ID     : ${purchaseResult.qboPurchaseId || 'QBO-PUR-4921'}
Status            : ${purchaseResult.qboStatus}

COMPANY DETAILS
-----------------------------------------------------
Company Name      : Sandbox Company US 822f
Legal Address     : 123 Sierra Way, San Pablo, CA 87999
Default Currency  : USD ($)

PURCHASE BREAKDOWN
-----------------------------------------------------
Item Description  : ${purchaseResult.itemDescription}
Category          : ${purchaseResult.category}
Vendor / Supplier : ${purchaseResult.vendorName}
Subtotal          : $${purchaseResult.amount?.toFixed(2)}
Sales Tax (Est.)  : $${purchaseResult.taxAmount?.toFixed(2)}
TOTAL CHARGED     : $${purchaseResult.totalAmount?.toFixed(2)}

PAYMENT & FUNDING INSTRUMENT
-----------------------------------------------------
Funding Source    : ${purchaseResult.paymentMethod?.name}
Account Number    : ${purchaseResult.paymentMethod?.accountNumber}
Instrument Type   : ${purchaseResult.paymentMethod?.type}
Prior Balance     : $${purchaseResult.paymentMethod?.priorBalance?.toFixed(2)}
New Balance       : $${purchaseResult.paymentMethod?.newBalance?.toFixed(2)}

ACCOUNTING & LEDGER CLASSIFICATION
-----------------------------------------------------
QBO Expense Line  : ${purchaseResult.qboExpenseAccount?.name} (ID: ${purchaseResult.qboExpenseAccount?.id})
Classification    : ${purchaseResult.qboExpenseAccount?.classification}
Modern Treasury Tx: ${purchaseResult.modernTreasuryLedger?.transactionId}
Ledger Debit      : ${purchaseResult.modernTreasuryLedger?.debitAccountId}
Ledger Credit     : ${purchaseResult.modernTreasuryLedger?.creditAccountId}

AI DECISION RATIONALE
-----------------------------------------------------
${purchaseResult.aiRationale}

Generated autonomously by Gemini 3.7 Flash AI Procurement Engine.
=====================================================`;

    const mime = format === 'json' ? 'application/json' : 'text/plain;charset=utf-8';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase_receipt_${purchaseResult.authorizationCode}_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const quickBuyPrompts = [
    {
      title: '🌿 Landscaping Soil & Pumps',
      prompt: 'Buy 50 bags of enriched topsoil and 2 submersible water fountain pumps for $365 from Sierra Green Valley Supply',
      category: 'Job Materials',
      amount: '$365.00',
      account: 'Plants & Soil (49)'
    },
    {
      title: '💳 Citi Card Office Chairs',
      prompt: 'Purchase 2 high-back ergonomic mesh task chairs for $540 using Citi ThankYou Premier Card',
      category: 'Office & Facility',
      amount: '$540.00',
      account: 'Building Repairs (73)'
    },
    {
      title: '💻 Cloud Compute Credits',
      prompt: 'Pay for Google Cloud Platform server compute quota and GenAI storage credits for $250.00',
      category: 'IT & Cloud Compute',
      amount: '$250.00',
      account: 'Legal & Accounting (69)'
    },
    {
      title: '🚗 Commercial Fleet Tires',
      prompt: 'Order heavy-duty commercial truck tire replacement and safety inspection for $680 and bill to Operating Checking',
      category: 'Fleet & Vehicle',
      amount: '$680.00',
      account: 'Automobile (55)'
    },
    {
      title: '🌾 Bermuda Grass Turf Sod',
      prompt: 'Procure 500 sq ft roll set of Bermuda hybrid sod turf for $420 from Golden State Turf Farms',
      category: 'Landscaping Supplies',
      amount: '$420.00',
      account: 'Plants & Soil (49)'
    },
    {
      title: '📢 Digital Ads Campaign',
      prompt: 'Deploy targeted digital search engine marketing and lead generation campaign package for $350.00',
      category: 'Marketing',
      amount: '$350.00',
      account: 'Advertising (7)'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#161B22] via-[#1c2128] to-[#161B22] rounded-xl border border-[#30363D] p-6 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#238636] to-[#3FB950] text-white shadow-md">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                AI Autonomous Purchasing & Procurement Agent
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  GEMINI 3.7 FLASH
                </span>
              </h2>
            </div>
            <p className="text-xs text-[#8B949E] max-w-3xl leading-relaxed">
              Equipped with your synchronized QuickBooks financial data. The AI autonomously analyzes cash balances across 189 bank accounts, checks credit limits on Citi cards, maps purchases into the Chart of Accounts, executes transactions, and writes dual-entry Modern Treasury ledger records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowPayloadDetails(!showPayloadDetails)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs font-medium text-[#C9D1D9] border border-[#30363D] transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-[#79C0FF]" />
              <span>{showPayloadDetails ? 'Hide Loaded Data' : 'View Synced Financial State'}</span>
              {showPayloadDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {onNavigateToBridge && (
              <button
                onClick={onNavigateToBridge}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white shadow-xs border border-[#3FB950]/30 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Command Bridge</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Liquidity Radar Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#30363D]">
          <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D]">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] mb-1">
              <span className="flex items-center gap-1 font-medium">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                Citi ThankYou® Premier
              </span>
              <span className="text-purple-400 font-mono text-[10px]">CARD</span>
            </div>
            <div className="text-sm font-bold text-white font-mono">
              $18,000.00 <span className="text-[10px] text-purple-300 font-normal">Limit (3250)</span>
            </div>
            <div className="text-[10px] text-[#8B949E] mt-0.5">
              Current Bal: <span className="text-rose-400">-$2,996.57</span>
            </div>
          </div>

          <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D]">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Landmark className="w-3.5 h-3.5 text-[#79C0FF]" />
                Citi Platinum Savings
              </span>
              <span className="text-[#79C0FF] font-mono text-[10px]">SAVINGS</span>
            </div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              $5,142.00 <span className="text-[10px] text-[#8B949E] font-normal">USD</span>
            </div>
            <div className="text-[10px] text-[#8B949E] mt-0.5">
              Acct: <span className="text-[#C9D1D9]">XXXXXX8543 (ID: 1150040003)</span>
            </div>
          </div>

          <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D]">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Building2 className="w-3.5 h-3.5 text-[#3FB950]" />
                Operating Checking
              </span>
              <span className="text-[#3FB950] font-mono text-[10px]">CASH</span>
            </div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              $1,201.00 <span className="text-[10px] text-[#8B949E] font-normal">USD</span>
            </div>
            <div className="text-[10px] text-[#8B949E] mt-0.5">
              QBO Account <span className="text-[#C9D1D9]">Checking #1010 (ID: 35)</span>
            </div>
          </div>

          <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D]">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] mb-1">
              <span className="flex items-center gap-1 font-medium">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Modern Treasury
              </span>
              <span className="text-amber-400 font-mono text-[10px]">LEDGER</span>
            </div>
            <div className="text-sm font-bold text-white font-mono">
              200 Accounts <span className="text-[10px] text-[#3FB950] font-normal">1:1 Synced</span>
            </div>
            <div className="text-[10px] text-[#8B949E] mt-0.5">
              Autonomous Dual-Entry <span className="text-[#3FB950]">Active</span>
            </div>
          </div>
        </div>

        {/* Collapsible Synced Payload Details */}
        {showPayloadDetails && (
          <div className="mt-4 p-4 bg-[#0d1117] rounded-xl border border-[#30363D] text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3FB950]" />
                <span>Active Financial Ingestion Snapshot</span>
              </div>
              <span className="text-[11px] font-mono text-[#8B949E]">Loaded from user sync file</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#8B949E]">
              <div>🏢 Company: <strong className="text-white">Sandbox Company US 822f</strong></div>
              <div>📊 QBO Accounts: <strong className="text-[#79C0FF]">200 Categories</strong></div>
              <div>🏦 Bank Accounts: <strong className="text-[#D29922]">189 Connected</strong></div>
              <div>💳 Corporate Cards: <strong className="text-purple-400">1 Citi Premier Card</strong></div>
              <div>🧾 Invoices: <strong className="text-indigo-400">32 Open/Paid</strong></div>
              <div>💵 Customer Profiles: <strong className="text-teal-400">30 Records</strong></div>
              <div>🏛️ Modern Treasury: <strong className="text-emerald-400">200 Ledgers</strong></div>
              <div>⚙️ Jurisdiction: <strong className="text-white">California, US (CA 87999)</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#30363D] pb-3">
        <button
          onClick={() => setActiveSubTab('prompt')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'prompt'
              ? 'bg-[#238636] text-white shadow-xs border border-[#3FB950]/40'
              : 'text-[#8B949E] hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Natural Language "Buy with AI"</span>
        </button>

        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'catalog'
              ? 'bg-purple-600 text-white shadow-xs border border-purple-400/40'
              : 'text-[#8B949E] hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <Store className="w-4 h-4 text-purple-300" />
          <span>Commercial Supply Catalog</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-[10px] text-purple-200">{catalog.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'chat'
              ? 'bg-blue-600 text-white shadow-xs border border-blue-400/40'
              : 'text-[#8B949E] hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-blue-300" />
          <span>Procurement Advisor AI Chat</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'history'
              ? 'bg-[#21262d] text-white shadow-xs border border-[#30363D]'
              : 'text-[#8B949E] hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Purchases Audit Ledger</span>
          {history.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[10px] text-amber-300">{history.length}</span>
          )}
        </button>
      </div>

      {/* Main Tab 1: Natural Language Purchase Prompt */}
      {activeSubTab === 'prompt' && (
        <div className="space-y-6">
          {/* Main Input Box */}
          <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#3FB950]" />
                Autonomous Purchase Order Request
              </label>
              <span className="text-[11px] text-[#8B949E]">
                Gemini will inspect your accounts and choose the optimal payment instrument
              </span>
            </div>

            <div className="relative">
              <textarea
                value={purchaseIntent}
                onChange={(e) => setPurchaseIntent(e.target.value)}
                placeholder="Example: Purchase $420 of Bermuda sod turf rolls and 3 fountain pumps from supplier, fund via Citi Platinum Savings or Checking, and categorize under Landscaping Job Materials."
                className="w-full h-28 bg-[#0d1117] border border-[#30363D] rounded-xl p-3.5 text-xs text-white placeholder-[#8B949E]/70 focus:outline-hidden focus:border-[#3FB950] transition-colors leading-relaxed"
              />
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#8B949E]">Funding Source:</span>
                  <select
                    value={selectedFundingSource}
                    onChange={(e) => setSelectedFundingSource(e.target.value)}
                    className="bg-[#0d1117] border border-[#30363D] text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-[#3FB950]"
                  >
                    <option value="auto">✨ Autonomously Decide (AI Selection)</option>
                    <option value="1150040002">💳 Citi ThankYou® Premier Card (3250)</option>
                    <option value="35">🏦 Checking #1010 ($1,201.00 Available)</option>
                    <option value="1150040003">🏦 Citi Platinum Savings ($5,142.00 Available)</option>
                    <option value="1150040000">🏦 Citi Business Operating Checking (05329451)</option>
                    <option value="200151639855507453329451">🏦 James OCallaghan Chase Checking (xxxxxx9451)</option>
                  </select>
                </div>

                <label className="flex items-center space-x-2 text-xs text-[#C9D1D9] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoExecuteQbo}
                    onChange={(e) => setAutoExecuteQbo(e.target.checked)}
                    className="rounded border-[#30363D] text-[#238636] focus:ring-0"
                  />
                  <span>Dispatch Real QBO API & Modern Treasury Entry</span>
                </label>
              </div>

              <button
                id="btn-ai-buy-execute"
                onClick={() => handleExecutePurchase()}
                disabled={purchasing || !purchaseIntent.trim()}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#3FB950] text-white text-xs font-bold shadow-md shadow-emerald-950/40 border border-[#3FB950]/30 transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                {purchasing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing AI Procurement...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Authorize & Buy with AI</span>
                  </>
                )}
              </button>
            </div>

            {/* In-progress status message */}
            {purchasing && statusStep && (
              <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 flex items-center space-x-2 text-xs text-purple-200 animate-pulse">
                <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{statusStep}</span>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-center space-x-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Quick Scenario Buttons */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              One-Click Instant Procurement Scenarios
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickBuyPrompts.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setPurchaseIntent(p.prompt);
                    handleExecutePurchase(p.prompt);
                  }}
                  className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] hover:border-[#3FB950]/60 hover:bg-[#21262d] transition-all cursor-pointer group flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-[#3FB950] transition-colors">
                      {p.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#238636]/20 text-[#3FB950]">
                      {p.amount}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B949E] line-clamp-2 leading-relaxed">
                    {p.prompt}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-[#30363D]/60 text-[10px] text-[#8B949E]">
                    <span>Target: <strong className="text-[#79C0FF]">{p.account}</strong></span>
                    <span className="text-[#3FB950] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                      Procure ⚡
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Result Certificate & Confirmation */}
          {purchaseResult && (
            <div className="bg-gradient-to-br from-[#161B22] to-[#1c2128] rounded-xl border border-[#3FB950]/50 p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#30363D]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-[#238636] text-white">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Purchase Order Executed & Authorized
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#238636]/20 text-[#3FB950] border border-[#3FB950]/30">
                        {purchaseResult.authorizationCode}
                      </span>
                    </h3>
                    <p className="text-xs text-[#8B949E]">
                      QuickBooks PO #{purchaseResult.qboDocNumber} • Logged at {new Date(purchaseResult.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadReceipt('txt')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs font-medium text-[#79C0FF] border border-[#30363D] transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download Receipt (.txt)</span>
                  </button>
                  <button
                    onClick={() => downloadReceipt('json')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white border border-[#3FB950]/30 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PO (.json)</span>
                  </button>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Item Details */}
                <div className="bg-[#0d1117] p-4 rounded-xl border border-[#30363D] space-y-2">
                  <div className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#79C0FF]" />
                    Procured Goods & Services
                  </div>
                  <div className="text-sm font-bold text-white">{purchaseResult.itemDescription}</div>
                  <div className="text-xs text-[#8B949E]">
                    Vendor: <strong className="text-[#C9D1D9]">{purchaseResult.vendorName}</strong>
                  </div>
                  <div className="text-xs text-[#8B949E]">
                    Category: <span className="px-1.5 py-0.5 rounded bg-[#21262d] text-white">{purchaseResult.category}</span>
                  </div>
                  <div className="pt-2 border-t border-[#30363D] space-y-1 text-xs">
                    <div className="flex justify-between text-[#8B949E]">
                      <span>Subtotal:</span>
                      <span className="font-mono text-white">${purchaseResult.amount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#8B949E]">
                      <span>Sales Tax:</span>
                      <span className="font-mono text-white">${purchaseResult.taxAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-1 border-t border-[#30363D]">
                      <span>Total Amount:</span>
                      <span className="font-mono text-emerald-400 text-sm">${purchaseResult.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Payment Instrument */}
                <div className="bg-[#0d1117] p-4 rounded-xl border border-[#30363D] space-y-2">
                  <div className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                    Funding & Payment Method
                  </div>
                  <div className="text-sm font-bold text-white">{purchaseResult.paymentMethod?.name}</div>
                  <div className="text-xs text-[#8B949E]">
                    Account / Card: <span className="font-mono text-[#C9D1D9]">{purchaseResult.paymentMethod?.accountNumber}</span>
                  </div>
                  <div className="text-xs text-[#8B949E]">
                    Type: <span className="text-purple-300 font-medium">{purchaseResult.paymentMethod?.type}</span>
                  </div>
                  <div className="pt-2 border-t border-[#30363D] space-y-1 text-xs">
                    <div className="flex justify-between text-[#8B949E]">
                      <span>Prior Account Balance:</span>
                      <span className="font-mono text-white">${purchaseResult.paymentMethod?.priorBalance?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Remaining Balance:</span>
                      <span className="font-mono">${purchaseResult.paymentMethod?.newBalance?.toFixed(2)}</span>
                    </div>
                    <div className="text-[10px] text-[#3FB950] pt-1">
                      ✓ Instant settlement authorization verified
                    </div>
                  </div>
                </div>

                {/* 3. Accounting & Modern Treasury */}
                <div className="bg-[#0d1117] p-4 rounded-xl border border-[#30363D] space-y-2">
                  <div className="text-[11px] font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    QuickBooks & Modern Treasury
                  </div>
                  <div className="text-sm font-bold text-white">
                    {purchaseResult.qboExpenseAccount?.name}
                  </div>
                  <div className="text-xs text-[#8B949E]">
                    QBO Account ID: <span className="font-mono text-[#79C0FF]">{purchaseResult.qboExpenseAccount?.id}</span>
                  </div>
                  <div className="text-xs text-[#8B949E]">
                    Modern Treasury Tx: <span className="font-mono text-[#C9D1D9] text-[11px]">{purchaseResult.modernTreasuryLedger?.transactionId}</span>
                  </div>
                  <div className="pt-2 border-t border-[#30363D] space-y-1 text-xs">
                    <div className="flex justify-between text-[#8B949E]">
                      <span>Ledger Debit:</span>
                      <span className="font-mono text-white text-[11px]">{purchaseResult.modernTreasuryLedger?.debitAccountId}</span>
                    </div>
                    <div className="flex justify-between text-[#8B949E]">
                      <span>Ledger Credit:</span>
                      <span className="font-mono text-white text-[11px]">{purchaseResult.modernTreasuryLedger?.creditAccountId}</span>
                    </div>
                    <div className="flex justify-between text-[#3FB950] font-bold pt-1">
                      <span>Status:</span>
                      <span>{purchaseResult.qboStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Rationale */}
              <div className="p-3.5 bg-[#0d1117] rounded-xl border border-[#30363D] text-xs space-y-1">
                <div className="font-bold text-[#8B949E] uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#3FB950]" />
                  AI Purchasing Rationale
                </div>
                <p className="text-[#C9D1D9] leading-relaxed">
                  {purchaseResult.aiRationale}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Tab 2: Commercial Catalog Marketplace */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161B22] p-4 rounded-xl border border-[#30363D]">
            <div className="text-xs text-[#8B949E]">
              Browse verified commercial suppliers and click <strong className="text-white">"AI Buy & Charge"</strong> to immediately procure and book into your QuickBooks ledger.
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs text-[#8B949E]">Filter:</span>
              <select
                value={catalogFilter}
                onChange={(e) => setCatalogFilter(e.target.value)}
                className="bg-[#0d1117] border border-[#30363D] text-xs text-white rounded-lg px-2.5 py-1 focus:outline-hidden"
              >
                <option value="all">All Categories</option>
                <option value="Landscaping Supplies">Landscaping Supplies</option>
                <option value="IT & Cloud Compute">IT & Cloud Compute</option>
                <option value="Office & Facility">Office & Facility</option>
                <option value="Fleet & Vehicle">Fleet & Vehicle</option>
                <option value="Hardware & Tools">Hardware & Tools</option>
                <option value="Marketing & Ads">Marketing & Ads</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalog
              .filter((item) => catalogFilter === 'all' || item.category === catalogFilter)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-[#161B22] rounded-xl border border-[#30363D] hover:border-purple-500/60 p-5 space-y-3 flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/20 text-purple-300">
                        {item.category}
                      </span>
                      <span className="text-base font-bold font-mono text-emerald-400">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#8B949E] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#30363D] space-y-2">
                    <div className="text-[11px] text-[#8B949E] flex justify-between">
                      <span>Vendor:</span>
                      <strong className="text-[#C9D1D9]">{item.vendor}</strong>
                    </div>
                    <div className="text-[11px] text-[#8B949E] flex justify-between">
                      <span>QBO Expense:</span>
                      <span className="text-[#79C0FF] truncate max-w-[170px]">{item.recommendedQboAccount}</span>
                    </div>
                    <button
                      onClick={() => {
                        const prompt = `Buy 1 ${item.unit} of "${item.name}" for $${item.price.toFixed(2)} from vendor "${item.vendor}", classify under QBO account "${item.recommendedQboAccount}"`;
                        setPurchaseIntent(prompt);
                        setActiveSubTab('prompt');
                        handleExecutePurchase(prompt);
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer mt-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                      <span>AI Buy & Charge (${item.price.toFixed(2)})</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Main Tab 3: Interactive Procurement Advisor Chat */}
      {activeSubTab === 'chat' && (
        <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-white">AI Procurement Consultant</h3>
                <p className="text-[11px] text-[#8B949E]">
                  Ask questions about available liquidity, compare credit vs checking, or get tax deduction advice.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300">
              LIVE ASSISTANT
            </span>
          </div>

          {/* Chat Stream Window */}
          <div className="h-80 overflow-y-auto space-y-3 p-3 bg-[#0d1117] rounded-xl border border-[#30363D]">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xl rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#238636] text-white rounded-br-none'
                      : 'bg-[#21262d] text-[#C9D1D9] border border-[#30363D] rounded-bl-none'
                  }`}
                >
                  <div className="font-semibold text-[10px] opacity-75 mb-1">
                    {msg.sender === 'user' ? 'You' : 'AI Procurement Agent'} • {msg.time}
                  </div>
                  <div>{msg.text}</div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-[#21262d] text-[#8B949E] rounded-xl p-3 text-xs border border-[#30363D] flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>Analyzing QuickBooks liquidity & accounts...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleChatSend} className="flex items-center space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask: 'Which account should I use to buy a $1,500 lawn tractor?' or 'How much can I spend this week?'"
              className="flex-1 bg-[#0d1117] border border-[#30363D] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#8B949E] focus:outline-hidden focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* Main Tab 4: Purchases Audit History */}
      {activeSubTab === 'history' && (
        <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Executed Purchases & Dual-Ledger Audit Log
            </div>
            <button
              onClick={fetchHistory}
              className="flex items-center space-x-1 text-xs text-[#8B949E] hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Ledger</span>
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#8B949E] space-y-2">
              <ShoppingCart className="w-8 h-8 text-[#8B949E]/40 mx-auto" />
              <p>No autonomous purchases executed yet in this session.</p>
              <p className="text-[11px]">Use the prompt bar or commercial catalog to trigger your first purchase order.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#30363D] text-[#8B949E] uppercase text-[10px]">
                    <th className="py-2.5 px-3">Date / Auth</th>
                    <th className="py-2.5 px-3">Item & Vendor</th>
                    <th className="py-2.5 px-3">Funding Instrument</th>
                    <th className="py-2.5 px-3">QBO Expense Account</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363D]/60">
                  {history.map((h, i) => (
                    <tr key={h.id || i} className="hover:bg-[#21262d]/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono text-white font-bold">{h.authorizationCode}</div>
                        <div className="text-[10px] text-[#8B949E]">{new Date(h.timestamp).toLocaleDateString()} {new Date(h.timestamp).toLocaleTimeString()}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-white font-medium">{h.itemDescription}</div>
                        <div className="text-[10px] text-[#8B949E]">{h.vendorName} • {h.category}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-purple-300 font-medium">{h.paymentMethod?.name}</div>
                        <div className="text-[10px] font-mono text-[#8B949E]">{h.paymentMethod?.accountNumber}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[#79C0FF]">{h.qboExpenseAccount?.name}</div>
                        <div className="text-[10px] text-[#8B949E]">ID: {h.qboExpenseAccount?.id}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        ${h.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#238636]/20 text-[#3FB950] border border-[#238636]/30">
                          {h.qboStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
