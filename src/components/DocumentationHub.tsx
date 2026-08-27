import React, { useState } from 'react';
import {
  BookOpen,
  FileCode,
  Shield,
  Zap,
  Terminal,
  Database,
  Key,
  Layers,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Search,
  BookMarked,
  Cpu,
  Globe,
  Lock,
  RefreshCw,
  User,
  FileText,
  DollarSign,
  CreditCard,
} from 'lucide-react';

export default function DocumentationHub() {
  const [selectedDoc, setSelectedDoc] = useState<
    | 'finicity'
    | 'mastercard_mgmt'
    | 'bridge_batch'
    | 'overview'
    | 'auth'
    | 'chase'
    | 'universal'
    | 'fileupload'
    | 'oauth'
    | 'refresh'
    | 'query'
    | 'accounts'
    | 'bankach'
    | 'batch'
    | 'customers'
    | 'invoices'
    | 'payments'
    | 'userinfo'
    | 'curlproxy'
    | 'firestore'
    | 'openapi'
  >('finicity');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const docCategories = [
    {
      title: 'Mastercard & Chase Open Banking',
      items: [
        { id: 'finicity', label: 'Mastercard Open Finance (Finicity)', icon: Layers },
        { id: 'mastercard_mgmt', label: 'Mastercard Developers Project API', icon: Cpu },
        { id: 'chase', label: 'Chase Loyalty & Pay With Points', icon: CreditCard },
      ],
    },
    {
      title: 'Getting Started & Security',
      items: [
        { id: 'overview', label: 'Platform Architecture & Guide', icon: BookOpen },
        { id: 'auth', label: 'Authentication & API Keys', icon: Key },
      ],
    },
    {
      title: 'AI Ingestion & Universal Transform',
      items: [
        { id: 'universal', label: 'Universal AI Transform & Ingest', icon: Sparkles },
        { id: 'bridge_batch', label: 'High-Speed Batch QuickBooks Bridge', icon: Zap },
        { id: 'fileupload', label: 'Unstructured File Upload Ingestion', icon: FileCode },
      ],
    },
    {
      title: 'QuickBooks OAuth 2.0 Auth Flow',
      items: [
        { id: 'oauth', label: 'OAuth Authorization Code Flow', icon: Shield },
        { id: 'refresh', label: 'OAuth Refresh Token Rotation', icon: Zap },
      ],
    },
    {
      title: 'Accounting & Ledger APIs',
      items: [
        { id: 'query', label: 'QuickBooks SQL Query Engine', icon: Database },
        { id: 'accounts', label: 'Chart of Accounts Management', icon: Layers },
        { id: 'bankach', label: 'Bank Accounts & ACH Sync', icon: Globe },
        { id: 'batch', label: 'Batch Accounts Synchronization', icon: Cpu },
        { id: 'customers', label: 'Customers Ledger Operations', icon: User },
        { id: 'invoices', label: 'Invoices & Multi-Line Billing', icon: FileText },
        { id: 'payments', label: 'Payments & Settlement Engine', icon: DollarSign },
        { id: 'userinfo', label: 'OpenID Connect User Profile', icon: Lock },
        { id: 'curlproxy', label: 'Headless cURL Proxy Runner', icon: Terminal },
      ],
    },
    {
      title: 'Storage & Specifications',
      items: [
        { id: 'firestore', label: 'Firestore Persistence & Audit Logs', icon: Database },
        { id: 'openapi', label: 'OpenAPI 3.0 YAML Specification', icon: FileCode },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[750px]">
      {/* Left Sidebar Navigation */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <BookMarked className="w-4 h-4 text-emerald-400" /> Documentation Hub
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
          {docCategories.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                {cat.title}
              </div>
              <div className="space-y-0.5">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = selectedDoc === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedDoc(item.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                        {item.label}
                      </span>
                      <ChevronRight className={`w-3 h-3 ${isActive ? 'text-emerald-400' : 'opacity-0'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content Area */}
      <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6 overflow-y-auto max-h-[800px]">
        {selectedDoc === 'finicity' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-red-500/20 text-red-300 font-mono px-2.5 py-1 rounded border border-red-500/30">
                  Mastercard Open Finance
                </span>
                <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2.5 py-1 rounded border border-amber-500/30">
                  Finicity v2/v3 Aggregation
                </span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono px-2.5 py-1 rounded border border-indigo-500/30">
                  api.finicity.com
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Mastercard Open Finance (Finicity) API</h1>
              <p className="text-slate-400 text-sm">
                Complete 5-step lifecycle documentation for Partner Authentication, Testing Customer provisioning, Mastercard Data Connect link generation, FinBank simulation, account aggregation, and historical transaction querying.
              </p>
            </div>

            {/* 5-Step Lifecycle Guide */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">1. Five-Step Integration Lifecycle</h3>
              
              {/* Step 1 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-500/20 text-red-400 font-bold font-mono px-2 py-0.5 rounded text-xs">POST</span>
                    <span className="text-white font-bold text-sm">Step 1: /aggregation/v2/partners/authentication</span>
                  </div>
                  <button onClick={() => copyCode(`curl --location --request POST 'https://api.finicity.com/aggregation/v2/partners/authentication' \\\n--header 'Content-Type: application/json' \\\n--header 'Finicity-App-Key: {{appKey}}' \\\n--header 'Accept: application/json' \\\n--data-raw '{\n    "partnerId": "{{partnerId}}",\n    "partnerSecret": "{{partnerSecret}}"\n}'`)} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 font-mono">
                    <Copy className="w-3.5 h-3.5" /> Copy cURL
                  </button>
                </div>
                <p className="text-slate-400 text-xs">Creates a Finicity App Token valid for 2 hours (best practice: refresh after 90 minutes).</p>
                <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto">
{`curl --location --request POST 'https://api.finicity.com/aggregation/v2/partners/authentication' \\
--header 'Content-Type: application/json' \\
--header 'Finicity-App-Key: {{appKey}}' \\
--header 'Accept: application/json' \\
--data-raw '{
    "partnerId": "{{partnerId}}",
    "partnerSecret": "{{partnerSecret}}"
}'`}
                </pre>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500/20 text-indigo-400 font-bold font-mono px-2 py-0.5 rounded text-xs">POST</span>
                    <span className="text-white font-bold text-sm">Step 2: /aggregation/v2/customers/testing</span>
                  </div>
                  <button onClick={() => copyCode(`curl --location --request POST 'https://api.finicity.com/aggregation/v2/customers/testing' \\\n--header 'Content-Type: application/json' \\\n--header 'Accept: application/json' \\\n--header 'Finicity-App-Key: {{appKey}}' \\\n--header 'Finicity-App-Token: {{appToken}}' \\\n--data-raw '{\n    "username": "customerusername1"\n}'`)} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 font-mono">
                    <Copy className="w-3.5 h-3.5" /> Copy cURL
                  </button>
                </div>
                <p className="text-slate-400 text-xs">Creates a testing customer record compatible with FinBank test profiles.</p>
                <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-purple-400 overflow-x-auto">
{`curl --location --request POST 'https://api.finicity.com/aggregation/v2/customers/testing' \\
--header 'Content-Type: application/json' \\
--header 'Accept: application/json' \\
--header 'Finicity-App-Key: {{appKey}}' \\
--header 'Finicity-App-Token: {{appToken}}' \\
--data-raw '{
    "username": "customerusername1"
}'`}
                </pre>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 font-bold font-mono px-2 py-0.5 rounded text-xs">POST</span>
                    <span className="text-white font-bold text-sm">Step 3: /connect/v2/generate</span>
                  </div>
                  <button onClick={() => copyCode(`curl --location --request POST 'https://api.finicity.com/connect/v2/generate' \\\n--header 'Content-Type: application/json' \\\n--header 'Accept: application/json' \\\n--header 'Finicity-App-Token: {{appToken}}' \\\n--header 'Finicity-App-Key: {{appKey}}' \\\n--data-raw '{\n    "partnerId": "{{partnerId}}",\n    "customerId": "{{customerId}}"\n}'`)} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 font-mono">
                    <Copy className="w-3.5 h-3.5" /> Copy cURL
                  </button>
                </div>
                <p className="text-slate-400 text-xs">Generates a Data Connect URL link presented to customer to authenticate bank credentials.</p>
                <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-blue-400 overflow-x-auto">
{`curl --location --request POST 'https://api.finicity.com/connect/v2/generate' \\
--header 'Content-Type: application/json' \\
--header 'Accept: application/json' \\
--header 'Finicity-App-Token: {{appToken}}' \\
--header 'Finicity-App-Key: {{appKey}}' \\
--data-raw '{
    "partnerId": "{{partnerId}}",
    "customerId": "{{customerId}}"
}'`}
                </pre>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-white font-bold text-sm">Step 4: Sign In to FinBank Profiles - A</h4>
                <p className="text-slate-400 text-xs">Test institution credentials:</p>
                <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-amber-300">
                  Username: profile_03 | Password: profile_03
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 font-bold font-mono px-2 py-0.5 rounded text-xs">POST</span>
                    <span className="text-white font-bold text-sm">Step 5: /aggregation/v1/customers/&#123;customerId&#125;/accounts</span>
                  </div>
                  <button onClick={() => copyCode(`curl --location -g --request POST 'https://api.finicity.com/aggregation/v1/customers/{{customerId}}/accounts' \\\n--header 'Content-Type: application/json' \\\n--header 'Accept: application/json' \\\n--header 'Finicity-App-Token: {{appToken}}' \\\n--header 'Finicity-App-Key: {{appKey}}' \\\n--data-raw '{}'`)} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 font-mono">
                    <Copy className="w-3.5 h-3.5" /> Copy cURL
                  </button>
                </div>
                <p className="text-slate-400 text-xs">Refreshes and aggregates all customer financial accounts (Checking, Savings, 401k, ROTH).</p>
                <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto">
{`curl --location -g --request POST 'https://api.finicity.com/aggregation/v1/customers/{{customerId}}/accounts' \\
--header 'Content-Type: application/json' \\
--header 'Accept: application/json' \\
--header 'Finicity-App-Token: {{appToken}}' \\
--header 'Finicity-App-Key: {{appKey}}' \\
--data-raw '{}'`}
                </pre>
              </div>

              {/* Transactions */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-500/20 text-purple-400 font-bold font-mono px-2 py-0.5 rounded text-xs">GET</span>
                    <span className="text-white font-bold text-sm">Fetch Transactions: /aggregation/v3/customers/&#123;customerId&#125;/transactions</span>
                  </div>
                  <button onClick={() => copyCode(`curl --location --request GET 'https://api.finicity.com/aggregation/v3/customers/{{customerId}}/transactions?fromDate=1646136000&toDate=1665234244&includePending=true&sort=desc&limit=25' \\\n--header 'Finicity-App-Key: {{appKey}}' \\\n--header 'Accept: application/json' \\\n--header 'Finicity-App-Token: {{appToken}}'`)} className="text-slate-400 hover:text-white text-xs flex items-center gap-1 font-mono">
                    <Copy className="w-3.5 h-3.5" /> Copy cURL
                  </button>
                </div>
                <p className="text-slate-400 text-xs">Returns paginated transactions with Unix epoch date filters and categorization.</p>
                <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-purple-300 overflow-x-auto">
{`curl --location --request GET 'https://api.finicity.com/aggregation/v3/customers/{{customerId}}/transactions?fromDate=1646136000&toDate=1665234244&includePending=true&sort=desc&limit=25' \\
--header 'Finicity-App-Key: {{appKey}}' \\
--header 'Accept: application/json' \\
--header 'Finicity-App-Token: {{appToken}}'`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {selectedDoc === 'mastercard_mgmt' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2.5 py-1 rounded border border-amber-500/30">
                  Mastercard Developers API
                </span>
                <span className="text-xs bg-red-500/20 text-red-300 font-mono px-2.5 py-1 rounded border border-red-500/30">
                  Project & Credential Lifecycle
                </span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono px-2.5 py-1 rounded border border-indigo-500/30">
                  developer.mastercard.com
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Mastercard Developers Project Lifecycle API</h1>
              <p className="text-slate-400 text-sm">
                Programmatic API reference for creating projects, provisioning Sandbox/Production environments, generating Partner/Signing/MTLS credentials, and attaching dynamic services (Open Finance 1443, Mastercard Encryption 405).
              </p>
            </div>

            {/* Project Types Matrix */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">1. Project Authentication Types</h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 text-[11px]">
                    <tr>
                      <th className="p-3">Type</th>
                      <th className="p-3">Schema</th>
                      <th className="p-3">Usage</th>
                      <th className="p-3">Compatible Services</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    <tr>
                      <td className="p-3 text-red-400 font-bold">OPEN_BANKING_PARTNER</td>
                      <td className="p-3 text-slate-400">NewOpenBankingPartnerProject</td>
                      <td className="p-3">Mastercard Open Finance suite of APIs</td>
                      <td className="p-3 text-emerald-400">OPEN_BANKING_PARTNER</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-blue-400 font-bold">OAUTH10A</td>
                      <td className="p-3 text-slate-400">NewOAuth10AProject</td>
                      <td className="p-3">Mastercard APIs with OAuth 1.0a</td>
                      <td className="p-3 text-indigo-400">OAUTH10A, DUAL_OAUTH</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-purple-400 font-bold">MTLS</td>
                      <td className="p-3 text-slate-400">NewMTLSProject</td>
                      <td className="p-3">APIs using MTLS protocol (X.509/CSR)</td>
                      <td className="p-3 text-purple-400">MTLS</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-emerald-400 font-bold">OAUTH2_FAPI</td>
                      <td className="p-3 text-slate-400">NewOAuth2FapiProject</td>
                      <td className="p-3">OAuth 2.0 + FAPI security profiles</td>
                      <td className="p-3 text-indigo-400">OAUTH2_FAPI, DUAL_OAUTH</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create Project API */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold font-mono px-2 py-0.5 rounded text-xs">POST</span>
                  <span className="text-white font-bold text-sm">Create Project: /developer/projects</span>
                </div>
                <button
                  onClick={() =>
                    copyCode(`curl --location --request POST 'https://api.mastercard.com/developer/projects' \\\n--header 'Content-Type: application/json' \\\n--header 'Accept: application/json' \\\n--data-raw '{\n  "type": "OPEN_BANKING_PARTNER",\n  "name": "My Open Finance Project",\n  "region": "US",\n  "service": {\n    "serviceId": 1443\n  },\n  "environment": "SANDBOX",\n  "credential": {\n    "type": "PARTNER",\n    "description": "Partner credential for banking aggregation"\n  },\n  "company": {\n    "name": "Client Company Name",\n    "isGovernmentEntity": false,\n    "address": {\n      "type": "Headquarters",\n      "addressLine1": "420 8th Street S.E",\n      "addressLine2": "Brooklyn, NY",\n      "city": "NYC",\n      "state": "NY",\n      "postalCode": "90210",\n      "countryCode": "USA"\n    }\n  },\n  "commercialCountries": ["USA"]\n}'`)
                  }
                  className="text-slate-400 hover:text-white text-xs flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy cURL
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-3">
                <div className="text-slate-400 text-xs">// Request Payload</div>
                <pre className="text-amber-300 overflow-x-auto">
{`{
  "type": "OPEN_BANKING_PARTNER",
  "name": "My Open Finance Project",
  "region": "US",
  "service": {
    "serviceId": 1443
  },
  "environment": "SANDBOX",
  "credential": {
    "type": "PARTNER",
    "description": "A custom description for the credential"
  },
  "company": {
    "name": "Client Company Name",
    "isGovernmentEntity": false,
    "address": {
      "type": "Headquarters",
      "addressLine1": "420 8th Street S.E",
      "addressLine2": "Brooklyn, NY",
      "city": "NYC",
      "state": "NY",
      "postalCode": "90210",
      "countryCode": "USA"
    }
  },
  "commercialCountries": ["USA"]
}`}
                </pre>

                <div className="text-slate-400 text-xs pt-2">// 200 OK Response</div>
                <pre className="text-emerald-400 overflow-x-auto">
{`{
  "id": "1c1ea17e-260d-11ee-be56-0242ac120002",
  "name": "My Open Finance Project",
  "type": "OPEN_BANKING_PARTNER",
  "region": "US",
  "environments": [
    {
      "name": "SANDBOX",
      "credentials": [
        {
          "id": "04bcdc45-9a96-4516-a7b0-49a26440d405",
          "type": "PARTNER",
          "partnerId": "2445583866521",
          "appKey": "555617add4733a9befefa2560cdcfb71",
          "plan": "Test Drive",
          "status": "APPROVED",
          "secrets": [
            {
              "secret": "SdknnFTYoAlWgFakTHy1",
              "expirationDate": "2028-10-25T15:24:20Z"
            }
          ]
        }
      ],
      "projectServices": [{ "serviceId": 1443, "status": "APPROVED" }]
    }
  ],
  "services": [{ "id": 1443, "name": "Open Finance" }]
}`}
                </pre>
              </div>
            </div>

            {/* Environment Promotion & Service Attach */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500/20 text-blue-400 font-bold font-mono px-2 py-0.5 rounded text-[11px]">POST</span>
                  <span className="text-white font-bold text-xs">/projects/&#123;id&#125;/environments</span>
                </div>
                <p className="text-slate-400 text-xs">Promotes a project to "PRODUCTION" and mints production PARTNER or MTLS keys.</p>
                <pre className="bg-slate-900 p-2.5 rounded text-[11px] font-mono text-blue-300">
{`{
  "name": "PRODUCTION",
  "credential": {
    "type": "PARTNER",
    "description": "Production credentials"
  }
}`}
                </pre>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-500/20 text-purple-400 font-bold font-mono px-2 py-0.5 rounded text-[11px]">POST</span>
                  <span className="text-white font-bold text-xs">/projects/&#123;id&#125;/environments/SANDBOX/services</span>
                </div>
                <p className="text-slate-400 text-xs">Enrolls dynamic service IDs (e.g. 405 Mastercard Encryption) with CSR keys.</p>
                <pre className="bg-slate-900 p-2.5 rounded text-[11px] font-mono text-purple-300">
{`{
  "serviceId": 405,
  "environment": {
    "name": "SANDBOX",
    "serviceDetails": {
      "credentials": [{ "type": "MASTERCARD_ENCRYPTION", "alias": "my-key", "csr": "..." }]
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {selectedDoc === 'bridge_batch' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2.5 py-1 rounded border border-emerald-500/30">
                  High-Speed Bridge
                </span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono px-2.5 py-1 rounded border border-indigo-500/30">
                  POST /api/bridge/import-transactions
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Direct Batch Ledger Bridge</h1>
              <p className="text-slate-400 text-sm">
                Single-call parallel batch ingestion for raw Finicity, Citi, Chase, and credit card payloads directly into QuickBooks Journal Entries or Chart of Accounts.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-3">
              <div className="text-slate-400 text-xs">// cURL Invocation</div>
              <pre className="text-emerald-400 overflow-x-auto">
{`curl -X POST https://aibanking.dev/api/bridge/import-transactions \\
  -H "Content-Type: application/json" \\
  -d '{
    "transactions": [
      { "id": "TX-01", "description": "Client Advisory Retainer", "amount": 5400.00, "date": "2026-08-27" },
      { "id": "TX-02", "description": "Cloud Hosting Compute", "amount": -850.25, "date": "2026-08-26" }
    ],
    "source": "FINICITY_LIVE",
    "targetType": "JournalEntry",
    "realmId": "9341453267972001"
  }'`}
              </pre>
            </div>
          </div>
        )}

        {selectedDoc === 'chase' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-500/20 text-blue-300 font-mono px-2.5 py-1 rounded border border-blue-500/30">
                  Open Banking & Loyalty
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2.5 py-1 rounded border border-emerald-500/30">
                  apidemo.chase.com
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Chase Loyalty & Pay With Points API</h1>
              <p className="text-slate-400 text-sm">
                Complete specifications, HTTP headers, request payloads, ES5/ES6/cURL examples, and environment variables for Chase points redemptions and balance checks.
              </p>
            </div>

            {/* Endpoints Table */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">1. Core Endpoints</h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-xs font-mono">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">POST</span>
                    <span className="text-slate-200">/mock/card/loyalty/redeem-rewards/transactions/v1/transactions/</span>
                  </div>
                  <span className="text-slate-500">Redeem rewards transaction</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded">GET</span>
                    <span className="text-slate-200">/merchants/users/{'{accountReferenceUuid}'}/rewards-balance</span>
                  </div>
                  <span className="text-slate-500">Query member rewards balance</span>
                </div>
              </div>
            </div>

            {/* Required Headers */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">2. Required HTTP Headers</h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1.5">
                <div><span className="text-blue-400">Content-Type:</span> application/json</div>
                <div><span className="text-blue-400">playground-id-token:</span> {'{copied-playground-token-id}'}</div>
                <div><span className="text-blue-400">authorization:</span> EB3ik8VN9sAV2YjUnZv5UUcAUzFg</div>
                <div><span className="text-blue-400">authorization2:</span> Bearer eyJraWQiOiJrZXkwMSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0...</div>
                <div><span className="text-blue-400">trace-id:</span> 562952952929829</div>
                <div><span className="text-blue-400">channel-type:</span> (optional / empty)</div>
                <div><span className="text-blue-400">account-reference-universal-unique-identifier:</span> d383fd33-7be1-4ff8-88b7-f2adca419296</div>
                <div><span className="text-blue-400">external-transaction-identifier:</span> ETI202007020791</div>
                <div><span className="text-blue-400">external-account-identifier:</span> XXXX.XXXX.aerra@jpmchase.com</div>
              </div>
            </div>

            {/* ES6 & ES5 Examples */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">3. ES6 fetch Implementation</h3>
              <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-purple-300">
                <button
                  onClick={() =>
                    copyCode(`var url = 'https://apidemo.chase.com/mock/card/loyalty/redeem-rewards/transactions/v1/transactions/';

fetch(url, {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "playground-id-token": "{copied-playground-token-id}",
    "authorization": "EB3ik8VN9sAV2YjUnZv5UUcAUzFg",
    "authorization2": "Bearer eyJraWQiOiJrZXkwMSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJwd3B0ZXN0IiwiYXVkIjoiY2hhc2UiLCJpc3MiOiJQV1BURVNUIiwiZXhwIjoxNjE3MjM2OTkwLCJpYXQiOjE2MTcyMDA5OTAsImp0aSI6ImUzY2NmMGU2LWM5MmYtNDI2My04MGM2LTI0ODI1OTdiZmEzMiJ9.dUmOrjpXKAkra1opeuLVAV78MKGaI9kPe0VrH56NEdhseBedqiWB8cPQT6ujzTt2s2sREvdam9p85Vynvn10rYKbMdgShv0lEsYrbG3GcRcieYAW4DlgLZ6VlSbwiaw_DIbvLugOuVrcCR6MFj4qJmW3yz6NM5Us_sW4MJKdkbCuMreg5ciOj_32krJj7AwCBpllz7RFK5G_VjAlbBdoTgIIu0WoPYxhxr3D0BDQavhApQHCsEmti5Bh-okYUucx3YK_ZTPO_MTPwWY7T0_wRelgt6vOCyZPlzdAH_NDOADrk5dO7ajSH4tPL1z-wIuidGMAVWH5FTKPtSgxah1_FQ",
    "trace-id": "562952952929829",
    "channel-type": "",
    "account-reference-universal-unique-identifier": "d383fd33-7be1-4ff8-88b7-f2adca419296",
    "external-transaction-identifier": "ETI202007020791",
    "external-account-identifier": "XXXX.XXXX.aerra@jpmchase.com"
  },
  body: JSON.stringify({
    "externalOrderNumber": "I202007020302",
    "orderDate": "2021-02-11T22:25:50.52Z",
    "externalTransactionTypeCode": "5070",
    "usdRewardsTransactionAmount": 7.95,
    "rewardsConversionRate": 80,
    "merchantCategoryCode": "2020"
  })
})
  .then(response => console.log(response.status))
  .then(data => console.log(data))
  .catch(error => console.error(error));`)
                  }
                  className="absolute right-3 top-3 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
                </button>
                <pre>{`fetch('https://apidemo.chase.com/mock/card/loyalty/redeem-rewards/transactions/v1/transactions/', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "playground-id-token": "{copied-playground-token-id}",
    "authorization": "EB3ik8VN9sAV2YjUnZv5UUcAUzFg",
    "authorization2": "Bearer eyJraWQiOiJrZXkwMSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0...",
    "trace-id": "562952952929829",
    "channel-type": "",
    "account-reference-universal-unique-identifier": "d383fd33-7be1-4ff8-88b7-f2adca419296",
    "external-transaction-identifier": "ETI202007020791",
    "external-account-identifier": "XXXX.XXXX.aerra@jpmchase.com"
  },
  body: JSON.stringify({
    "externalOrderNumber": "I202007020302",
    "orderDate": "2021-02-11T22:25:50.52Z",
    "externalTransactionTypeCode": "5070",
    "usdRewardsTransactionAmount": 7.95,
    "rewardsConversionRate": 80,
    "merchantCategoryCode": "2020"
  })
})`}</pre>
              </div>
            </div>

            {/* Environment Variables .env Block */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">4. Required Environment Variables (.env)</h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300">
                <pre>{`CHASE_API_BASE_URL="https://apidemo.chase.com"
CHASE_DEVELOPER_BASE_URL="https://developer.chase.com"
CHASE_PLAYGROUND_ID_TOKEN="{copied-playground-token-id}"
CHASE_AUTHORIZATION="EB3ik8VN9sAV2YjUnZv5UUcAUzFg"
CHASE_AUTHORIZATION2="Bearer eyJraWQiOiJrZXkwMSIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0..."
CHASE_TRACE_ID="562952952929829"
CHASE_CHANNEL_TYPE=""
CHASE_ACCOUNT_REF_UUID="d383fd33-7be1-4ff8-88b7-f2adca419296"
CHASE_EXTERNAL_TX_ID="ETI202007020791"
CHASE_EXTERNAL_ACCOUNT_ID="XXXX.XXXX.aerra@jpmchase.com"
CHASE_EXTERNAL_ORDER_NUMBER="I202007020302"
CHASE_ORDER_DATE="2021-02-11T22:25:50.52Z"
CHASE_EXTERNAL_TX_TYPE_CODE="5070"
CHASE_USD_REWARDS_AMOUNT="7.95"
CHASE_REWARDS_CONVERSION_RATE="80"
CHASE_MERCHANT_CATEGORY_CODE="2020"`}</pre>
              </div>
            </div>
          </div>
        )}

        {selectedDoc === 'overview' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2.5 py-1 rounded border border-emerald-500/30">
                Architecture & Guides
              </span>
              <h1 className="text-3xl font-bold text-white tracking-tight">aibanking.dev Enterprise Ledger API</h1>
              <p className="text-slate-400 text-sm">
                Welcome to the official developer documentation. Learn how to securely integrate autonomous AI banking ingestion, QuickBooks V3 accounting, and Cloud Firestore persistence into your financial workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">AI Schema Transformation</h4>
                <p className="text-xs text-slate-400">
                  Gemini-powered NLP engine maps arbitrary bank statement JSON (Citi, Chase, Visa) into QBO entity schemas instantly.
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-bold text-white">Cryptographic API Keys</h4>
                <p className="text-xs text-slate-400">
                  Secure access control with hashed API tokens, rate-limiting per second, and real-time audit logs stored in Firestore.
                </p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <Database className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-bold text-white">Durable Firestore Storage</h4>
                <p className="text-xs text-slate-400">
                  Every transaction, API call, and ledger synchronization is persistently backed up in Google Cloud Firestore.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="text-lg font-bold text-white">Quick Start cURL Example</h3>
              <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300">
                <button
                  onClick={() =>
                    copyCode(
                      'curl -X POST https://aibanking.dev/api/intuit/universal/transform-and-ingest \\\n  -H "x-api-key: sk_live_your_key" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"rawData": {"card": "Citi Visa", "balance": 1500}}\''
                    )
                  }
                  className="absolute right-3 top-3 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy
                </button>
                <pre>{`curl -X POST https://aibanking.dev/api/intuit/universal/transform-and-ingest \\
  -H "x-api-key: sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"rawData": {"card": "Citi Visa", "balance": 1500}}'`}</pre>
              </div>
            </div>
          </div>
        )}

        {selectedDoc === 'auth' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <span className="text-xs bg-blue-500/20 text-blue-300 font-mono px-2.5 py-1 rounded border border-blue-500/30">
                Security & Accounts
              </span>
              <h1 className="text-3xl font-bold text-white tracking-tight">Authentication & API Keys</h1>
              <p className="text-slate-400 text-sm">
                Secure your application endpoints using cryptographic `sk_live_` API keys.
              </p>
            </div>

            <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
              <h3 className="text-base font-bold text-white">Header Authorization</h3>
              <p>Pass your key in the `x-api-key` header or Bearer token format:</p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300">
                x-api-key: sk_live_aibanking_9f83a82e71d4b609c217
              </div>

              <h3 className="text-base font-bold text-white pt-2">Register Account (`POST /api/auth/register`)</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-blue-400 font-bold">POST /api/auth/register</div>
                <div>Body: {`{ "email": "dev@company.com", "name": "Jane" }`}</div>
              </div>
            </div>
          </div>
        )}

        {selectedDoc === 'universal' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2.5 py-1 rounded border border-emerald-500/30">
                AI Ingestion Engine
              </span>
              <h1 className="text-3xl font-bold text-white tracking-tight">Universal AI Transform & Ingest</h1>
              <p className="text-slate-400 text-sm">
                Endpoint: <code className="text-emerald-300 font-mono bg-slate-950 px-2 py-0.5 rounded">POST /api/intuit/universal/transform-and-ingest</code>
              </p>
            </div>
            <div className="space-y-4 text-slate-300 text-sm">
              <p>Transforms arbitrary banking payloads into QBO V3 Account, Invoice, Customer, or Payment schemas using Gemini.</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300">
                {`// Request Body Example\n{\n  "rawData": { "bank": "Chase", "checking": 12500 },\n  "targetEntity": "Account"\n}`}
              </div>
            </div>
          </div>
        )}

        {selectedDoc === 'openapi' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <span className="text-xs bg-purple-500/20 text-purple-300 font-mono px-2.5 py-1 rounded border border-purple-500/30">
                Specification
              </span>
              <h1 className="text-3xl font-bold text-white tracking-tight">OpenAPI 3.0 YAML Specification</h1>
              <p className="text-slate-400 text-sm">
                Download or inspect the complete OpenAPI contract for client SDK code generation.
              </p>
            </div>
            <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 max-h-96 overflow-auto">
              <button
                onClick={() => copyCode('openapi: 3.0.3\ninfo:\n  title: aibanking.dev API\n  version: 1.0.0')}
                className="absolute right-3 top-3 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} Copy YAML
              </button>
              <pre>{`openapi: 3.0.3
info:
  title: aibanking.dev & QuickBooks Autonomous Ledger Hub API
  description: Enterprise fintech API gateway for AI-powered banking schema transformation and QuickBooks V3 integration.
  version: 1.0.0
servers:
  - url: https://aibanking.dev
paths:
  /api/auth/register:
    post:
      summary: Register Developer Account & Generate Master Key
  /api/intuit/universal/transform-and-ingest:
    post:
      summary: AI Banking Schema Transform & Ingest
  /api/records:
    get:
      summary: Retrieve Firestore Stored Records`}</pre>
            </div>
          </div>
        )}

        {selectedDoc !== 'overview' && selectedDoc !== 'auth' && selectedDoc !== 'universal' && selectedDoc !== 'openapi' && selectedDoc !== 'finicity' && selectedDoc !== 'mastercard_mgmt' && selectedDoc !== 'bridge_batch' && selectedDoc !== 'chase' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <span className="text-xs bg-blue-500/20 text-blue-300 font-mono px-2.5 py-1 rounded border border-blue-500/30">
                API Reference: {selectedDoc.toUpperCase()}
              </span>
              <h1 className="text-3xl font-bold text-white tracking-tight">Endpoint Documentation</h1>
              <p className="text-slate-400 text-sm">
                Detailed parameters, request headers, response schemas, and code examples for {selectedDoc}.
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl space-y-4">
              <div className="text-emerald-400 font-mono text-xs font-bold">POST /api/intuit/{selectedDoc}</div>
              <p className="text-slate-300 text-xs leading-relaxed">
                This endpoint handles secure server-side processing for {selectedDoc}, verifying developer API keys and storing audit telemetry in Cloud Firestore.
              </p>
              <div className="p-4 bg-slate-900 rounded-lg font-mono text-xs text-slate-300">
                {JSON.stringify({ endpoint: `/api/intuit/${selectedDoc}`, status: 'ACTIVE', securedBy: 'Firestore API Key' }, null, 2)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
