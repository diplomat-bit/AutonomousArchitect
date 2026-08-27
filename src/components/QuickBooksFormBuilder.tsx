import React, { useState } from 'react';
import { Building2, User, CreditCard, FileText, Send, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, Terminal, Landmark, Plus, ArrowRight } from 'lucide-react';
import { TokenResponse } from '../types';
import { apiFetch } from '../utils/apiClient';

interface QuickBooksFormBuilderProps {
  tokens: TokenResponse | null;
}

type EntityType = 'account' | 'bankAccount' | 'customer' | 'invoice' | 'charge';

export const QuickBooksFormBuilder: React.FC<QuickBooksFormBuilderProps> = ({ tokens }) => {
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('account');
  const [customAccessToken, setCustomAccessToken] = useState('');
  const [realmId, setRealmId] = useState(tokens?.realmId || '');

  // Account Form State
  const [accountName, setAccountName] = useState('Operating Checking Account');
  const [accountType, setAccountType] = useState('Bank');
  const [accountSubType, setAccountSubType] = useState('Checking');
  const [accountAcctNum, setAccountAcctNum] = useState('1010');
  const [accountDescription, setAccountDescription] = useState('Primary cash operating account for payroll and billing');
  const [accountActive, setAccountActive] = useState(true);

  // Bank Account (Payments API) Form State
  const [bankName, setBankName] = useState('Acme Corporation');
  const [bankAccountNumber, setBankAccountNumber] = useState('4534882109');
  const [bankRoutingNumber, setBankRoutingNumber] = useState('123456789');
  const [bankPhone, setBankPhone] = useState('4155550199');
  const [bankAccountType, setBankAccountType] = useState('COMMERCIAL_CHECKING');

  // Customer Form State
  const [customerDisplayName, setCustomerDisplayName] = useState('Citibank Enterprise Client');
  const [customerGivenName, setCustomerGivenName] = useState('John');
  const [customerFamilyName, setCustomerFamilyName] = useState('Doe');
  const [customerCompanyName, setCustomerCompanyName] = useState('Citibank N.A.');
  const [customerEmail, setCustomerEmail] = useState('billing@citi-enterprise.com');
  const [customerPhone, setCustomerPhone] = useState('8005550100');

  // Invoice Form State
  const [invoiceCustomerId, setInvoiceCustomerId] = useState('1');
  const [invoiceCustomerName, setInvoiceCustomerName] = useState('Citibank Enterprise Client');
  const [invoiceAmount, setInvoiceAmount] = useState('1500.00');
  const [invoiceDescription, setInvoiceDescription] = useState('Enterprise API Integration & Cloud Banking Setup');
  const [invoiceDocNumber, setInvoiceDocNumber] = useState(`INV-${Date.now().toString().slice(-4)}`);

  // Charge Form State
  const [chargeAmount, setChargeAmount] = useState('250.00');
  const [chargeCurrency, setChargeCurrency] = useState('USD');
  const [chargeDescription, setChargeDescription] = useState('Direct Merchant Payment for QBO Settlement');

  // Execution States
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<any | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastExecutedEndpoint, setLastExecutedEndpoint] = useState<string>('');

  const tokenToUse = customAccessToken.trim() || tokens?.access_token || '';
  const finalRealm = realmId.trim() || tokens?.realmId || '';

  const getPayloadPreview = () => {
    switch (selectedEntity) {
      case 'account':
        return {
          Name: accountName,
          AccountType: accountType,
          AccountSubType: accountSubType,
          AcctNum: accountAcctNum,
          Description: accountDescription,
          Active: accountActive,
        };
      case 'bankAccount':
        return {
          name: bankName,
          accountNumber: bankAccountNumber,
          routingNumber: bankRoutingNumber,
          phone: bankPhone,
          accountType: bankAccountType,
        };
      case 'customer':
        return {
          DisplayName: customerDisplayName,
          GivenName: customerGivenName,
          FamilyName: customerFamilyName,
          CompanyName: customerCompanyName,
          PrimaryEmailAddr: { Address: customerEmail },
          PrimaryPhone: { FreeFormNumber: customerPhone },
        };
      case 'invoice':
        return {
          CustomerRef: { value: invoiceCustomerId, name: invoiceCustomerName },
          DocNumber: invoiceDocNumber,
          Line: [
            {
              Amount: parseFloat(invoiceAmount) || 0,
              DetailType: 'SalesItemLineDetail',
              Description: invoiceDescription,
              SalesItemLineDetail: { Qty: 1, UnitPrice: parseFloat(invoiceAmount) || 0 },
            },
          ],
        };
      case 'charge':
        return {
          amount: chargeAmount,
          currency: chargeCurrency,
          description: chargeDescription,
        };
    }
  };

  const handleExecute = async () => {
    if (!tokenToUse) {
      setError('Missing access token. Please complete Step 2 or enter a bearer token.');
      return;
    }
    if (!finalRealm && selectedEntity !== 'charge') {
      setError('Missing realmId. Please enter your sandbox company Realm ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setApiResult(null);

    let route = '';
    let reqBody: any = { accessToken: tokenToUse, realmId: finalRealm };

    try {
      if (selectedEntity === 'account') {
        route = '/api/intuit/accounts/create';
        setLastExecutedEndpoint(`POST https://sandbox-quickbooks.api.intuit.com/v3/company/${finalRealm}/account`);
        reqBody = {
          ...reqBody,
          name: accountName,
          accountType,
          accountSubType,
          acctNum: accountAcctNum,
          description: accountDescription,
          active: accountActive,
        };
      } else if (selectedEntity === 'bankAccount') {
        route = '/api/intuit/bank-accounts/create';
        setLastExecutedEndpoint(`POST https://sandbox.api.intuit.com/quickbooks/v4/customers/${finalRealm}/bank-accounts`);
        reqBody = {
          ...reqBody,
          customerId: finalRealm,
          name: bankName,
          accountNumber: bankAccountNumber,
          routingNumber: bankRoutingNumber,
          phone: bankPhone,
          accountType: bankAccountType,
        };
      } else if (selectedEntity === 'customer') {
        route = '/api/intuit/customers/create';
        setLastExecutedEndpoint(`POST https://sandbox-quickbooks.api.intuit.com/v3/company/${finalRealm}/customer`);
        reqBody = {
          ...reqBody,
          displayName: customerDisplayName,
          givenName: customerGivenName,
          familyName: customerFamilyName,
          companyName: customerCompanyName,
          email: customerEmail,
          phone: customerPhone,
        };
      } else if (selectedEntity === 'invoice') {
        route = '/api/intuit/invoices/create';
        setLastExecutedEndpoint(`POST https://sandbox-quickbooks.api.intuit.com/v3/company/${finalRealm}/invoice`);
        reqBody = {
          ...reqBody,
          customerId: invoiceCustomerId,
          customerName: invoiceCustomerName,
          amount: invoiceAmount,
          description: invoiceDescription,
          docNumber: invoiceDocNumber,
        };
      } else if (selectedEntity === 'charge') {
        route = '/api/intuit/create-charge';
        setLastExecutedEndpoint('POST https://sandbox.api.intuit.com/quickbooks/v4/payments/charges');
        reqBody = {
          ...reqBody,
          amount: chargeAmount,
          currency: chargeCurrency,
          description: chargeDescription,
        };
      }

      const res = await apiFetch<{ status: number; data: any }>(route, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      });

      setHttpStatus(res.status);
      if (!res.ok) {
        setError(res.error || `Error executing ${selectedEntity} creation`);
      } else {
        setApiResult(res.data?.data || res.data);
      }
    } catch (e: any) {
      setError(e.message || 'Network error executing request');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (apiResult) {
      navigator.clipboard.writeText(JSON.stringify(apiResult, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-[#238636]/20 border border-[#238636]/40 text-[#3FB950]">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              QuickBooks Entity Form Creator
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30">
              Live Sandbox API
            </span>
          </div>
          <p className="text-xs text-[#8B949E] max-w-3xl leading-relaxed">
            Direct form-based creators for QuickBooks Chart of Accounts, Customer ACH Bank Accounts, Customers, Invoices, and Payments. Complete input fields with 1-click execution to QuickBooks Sandbox.
          </p>
        </div>
      </div>

      {/* Connection Bar */}
      <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
              Bearer Access Token
            </label>
            <input
              type="password"
              id="form-token-input"
              value={customAccessToken || tokens?.access_token || ''}
              onChange={(e) => setCustomAccessToken(e.target.value)}
              placeholder="Paste Bearer Token or authenticate in Step 2..."
              className="w-full px-3 py-1.5 font-mono text-xs bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:border-[#79C0FF]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider mb-1.5">
              Sandbox Company Realm ID
            </label>
            <input
              type="text"
              id="form-realm-input"
              value={realmId}
              onChange={(e) => setRealmId(e.target.value)}
              placeholder="e.g. 4620816365..."
              className="w-full px-3 py-1.5 font-mono text-xs bg-[#010409] border border-[#30363D] rounded-lg text-[#C9D1D9] focus:outline-none focus:border-[#79C0FF]"
            />
          </div>
        </div>
      </div>

      {/* Entity Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { id: 'account', label: 'Chart of Accounts', icon: Building2, color: '#3FB950' },
          { id: 'bankAccount', label: 'Payments Bank (ACH)', icon: Landmark, color: '#79C0FF' },
          { id: 'customer', label: 'Customer', icon: User, color: '#D29922' },
          { id: 'invoice', label: 'Invoice', icon: FileText, color: '#A371F7' },
          { id: 'charge', label: 'Payment / Charge', icon: CreditCard, color: '#3FB950' },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = selectedEntity === item.id;
          return (
            <button
              key={item.id}
              id={`entity-tab-${item.id}`}
              onClick={() => {
                setSelectedEntity(item.id as EntityType);
                setError(null);
                setApiResult(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-[#238636] bg-[#238636]/10 ring-1 ring-[#3FB950]/30 text-white'
                  : 'border-[#30363D] bg-[#161B22] text-[#8B949E] hover:border-[#484f58] hover:text-[#C9D1D9]'
              }`}
            >
              <div className="flex items-center space-x-1.5 mb-1" style={{ color: item.color }}>
                <Icon className="w-4 h-4" />
                <span className="font-semibold text-xs">{item.label}</span>
              </div>
              <p className="text-[11px] text-[#8B949E]">POST /create</p>
            </button>
          );
        })}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Main Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form */}
        <div className="lg:col-span-7 bg-[#161B22] rounded-xl border border-[#30363D] p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <span>Configure & Send</span>
            <span className="text-xs text-[#8B949E] font-normal">
              ({selectedEntity === 'account' && 'Accounting Account API'}
              {selectedEntity === 'bankAccount' && 'Payments Customer Bank API'}
              {selectedEntity === 'customer' && 'Accounting Customer API'}
              {selectedEntity === 'invoice' && 'Accounting Invoice API'}
              {selectedEntity === 'charge' && 'Payments Charges API'})
            </span>
          </h3>

          {/* Form 1: Chart of Accounts */}
          {selectedEntity === 'account' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    id="input-form-account-name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Account Type *
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAccountType(val);
                      if (val === 'Bank') setAccountSubType('Checking');
                      else if (val === 'CreditCard') setAccountSubType('CreditCard');
                      else if (val === 'OtherCurrentAsset') setAccountSubType('OtherCurrentAssets');
                      else if (val === 'OtherCurrentLiability') setAccountSubType('NotesPayable');
                      else if (val === 'Expense') setAccountSubType('OfficeExpenses');
                      else if (val === 'Income') setAccountSubType('SalesOfProductIncome');
                    }}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  >
                    <option value="Bank">Bank (Checking, Savings, Cash)</option>
                    <option value="CreditCard">CreditCard</option>
                    <option value="OtherCurrentAsset">OtherCurrentAsset</option>
                    <option value="OtherCurrentLiability">OtherCurrentLiability</option>
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                    <option value="Equity">Equity</option>
                    <option value="FixedAsset">FixedAsset</option>
                    <option value="AccountsReceivable">AccountsReceivable</option>
                    <option value="AccountsPayable">AccountsPayable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Account SubType *
                  </label>
                  <input
                    type="text"
                    value={accountSubType}
                    onChange={(e) => setAccountSubType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Account Number (AcctNum)
                  </label>
                  <input
                    type="text"
                    value={accountAcctNum}
                    onChange={(e) => setAccountAcctNum(e.target.value)}
                    placeholder="e.g. 1010"
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={accountDescription}
                  onChange={(e) => setAccountDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                />
              </div>
            </div>
          )}

          {/* Form 2: Customer Bank Account (ACH / Payments API) */}
          {selectedEntity === 'bankAccount' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Bank Account Type *
                  </label>
                  <select
                    value={bankAccountType}
                    onChange={(e) => setBankAccountType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  >
                    <option value="COMMERCIAL_CHECKING">COMMERCIAL_CHECKING</option>
                    <option value="PERSONAL_CHECKING">PERSONAL_CHECKING</option>
                    <option value="COMMERCIAL_SAVINGS">COMMERCIAL_SAVINGS</option>
                    <option value="PERSONAL_SAVINGS">PERSONAL_SAVINGS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Routing Number *
                  </label>
                  <input
                    type="text"
                    value={bankRoutingNumber}
                    onChange={(e) => setBankRoutingNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={bankPhone}
                  onChange={(e) => setBankPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                />
              </div>
            </div>
          )}

          {/* Form 3: Customer */}
          {selectedEntity === 'customer' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={customerDisplayName}
                    onChange={(e) => setCustomerDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={customerCompanyName}
                    onChange={(e) => setCustomerCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Given Name
                  </label>
                  <input
                    type="text"
                    value={customerGivenName}
                    onChange={(e) => setCustomerGivenName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Family Name
                  </label>
                  <input
                    type="text"
                    value={customerFamilyName}
                    onChange={(e) => setCustomerFamilyName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form 4: Invoice */}
          {selectedEntity === 'invoice' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Customer ID (CustomerRef) *
                  </label>
                  <input
                    type="text"
                    value={invoiceCustomerId}
                    onChange={(e) => setInvoiceCustomerId(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={invoiceCustomerName}
                    onChange={(e) => setInvoiceCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Invoice Amount (USD) *
                  </label>
                  <input
                    type="text"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Document / Invoice #
                  </label>
                  <input
                    type="text"
                    value={invoiceDocNumber}
                    onChange={(e) => setInvoiceDocNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                  Line Item Description
                </label>
                <input
                  type="text"
                  value={invoiceDescription}
                  onChange={(e) => setInvoiceDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                />
              </div>
            </div>
          )}

          {/* Form 5: Charge / Payment */}
          {selectedEntity === 'charge' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Amount *
                  </label>
                  <input
                    type="text"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={chargeCurrency}
                    onChange={(e) => setChargeCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                  Charge Description
                </label>
                <input
                  type="text"
                  value={chargeDescription}
                  onChange={(e) => setChargeDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#010409] border border-[#30363D] rounded-lg text-white font-mono focus:border-[#79C0FF]"
                />
              </div>
            </div>
          )}

          {/* Send / Execute Button */}
          <div className="pt-3 border-t border-[#30363D] flex items-center justify-between">
            <div className="text-[11px] text-[#8B949E]">
              Click below to send live payload to QuickBooks
            </div>
            <button
              id="form-execute-btn"
              onClick={handleExecute}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all border border-[rgba(240,246,252,0.1)]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Request in Sandbox...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send to QuickBooks Sandbox</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Live Payload Preview & Live Response */}
        <div className="lg:col-span-5 space-y-4">
          {/* Payload Preview */}
          <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
                Live Outgoing Payload
              </h4>
              <span className="text-[11px] font-mono text-[#79C0FF]">application/json</span>
            </div>
            <pre className="p-3 bg-[#010409] border border-[#30363D] rounded-lg text-[11px] font-mono text-[#79C0FF] overflow-x-auto max-h-48">
              {JSON.stringify(getPayloadPreview(), null, 2)}
            </pre>
          </div>

          {/* Response Inspector */}
          <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#8B949E]" />
                <h4 className="text-xs font-semibold text-white">Live Response</h4>
              </div>

              <div className="flex items-center space-x-2">
                {httpStatus && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                      httpStatus >= 200 && httpStatus < 300
                        ? 'bg-[#238636]/15 text-[#3FB950] border-[#238636]/30'
                        : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                    }`}
                  >
                    HTTP {httpStatus}
                  </span>
                )}
                {apiResult && (
                  <button
                    onClick={handleCopyJson}
                    className="p-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8B949E] hover:text-white transition-colors"
                    title="Copy response JSON"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#3FB950]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {lastExecutedEndpoint && (
              <div className="text-[10px] font-mono text-[#8B949E] truncate bg-[#010409] px-2 py-1 rounded border border-[#30363D]">
                {lastExecutedEndpoint}
              </div>
            )}

            <div className="p-3 bg-[#010409] border border-[#30363D] rounded-lg font-mono text-[11px] text-[#C9D1D9] overflow-y-auto max-h-72">
              {apiResult ? (
                <pre>{JSON.stringify(apiResult, null, 2)}</pre>
              ) : (
                <span className="text-[#8B949E]/70 italic">
                  No request executed yet. Fill in the form and click "Send to QuickBooks Sandbox".
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
