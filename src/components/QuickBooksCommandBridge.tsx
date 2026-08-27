import React, { useState } from 'react';
import {
  Database,
  Upload,
  Play,
  Terminal,
  Layers,
  ArrowRight,
  RefreshCw,
  FileCode,
  CreditCard,
  DollarSign,
  Sparkles,
  Building2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Trash2,
  BookOpen,
  FileText,
  Server,
  Key,
  Globe,
  Sliders,
  ChevronDown,
} from 'lucide-react';

interface QuickBooksCommandBridgeProps {
  tokens?: {
    accessToken: string | null;
    realmId: string | null;
  };
}

const PRESET_PAYLOADS = {
  Account: [
    {
      accountGroup: 'CREDITCARD',
      creditCardAccountsDetails: [
        {
          productName: 'Costco Anywhere Visa® Card By Citi',
          displayAccountNumber: 'XXXXXXXXXXXX0019',
          accountDescription: 'Costco Anywhere Visa® Card By Citi-0019',
          balanceType: 'ASSET',
          currencyCode: 'USD',
          currentBalance: 7689.62,
          creditLimit: 5000,
          purchasesAPR: 16.99,
        },
        {
          productName: 'Citi ThankYou® Premier Card',
          displayAccountNumber: 'XXXXXXXXXXXX3250',
          accountDescription: 'Citi ThankYou® Premier Card-3250',
          currentBalance: 2996.57,
          creditLimit: 1000,
        },
      ],
    },
    {
      accountGroup: 'SAVINGS',
      savingsAccountsDetails: [
        {
          productName: 'Citi Platinum Savings Account',
          displayAccountNumber: 'XXXXXX8543',
          currentBalance: 5142,
          availableBalance: 4335,
          interestRate: 0.04,
        },
      ],
    },
    {
      accountGroup: 'LOAN',
      loanAccountsDetails: [
        {
          productName: 'Personal Loan',
          displayAccountNumber: 'XXXXXX9001',
          currentBalance: 10250.0,
          interestRate: 5.89,
        },
      ],
    },
    {
      accountGroup: 'RETIREMENT',
      retirementAccountsDetails: [
        {
          productName: 'Rollover IRA',
          displayAccountNumber: 'XXX0000',
          currentBalance: 84250.0,
        },
      ],
    },
  ],
  Customer: [
    {
      customerGroup: 'CITIBANK_INDIVIDUAL_PROFILES',
      customers: [
        {
          displayName: 'Johnathan Sovereign',
          companyName: 'Sovereignty Ventures LLC',
          email: 'j.sovereign@citibank.com',
          phone: '+1 (800) 374-9700',
          balance: 12500.0,
          accountRef: 'XXXX-4316',
        },
        {
          displayName: 'Alexandra Vance',
          companyName: 'Vance Capital Corp',
          email: 'a.vance@citibank.com',
          phone: '+1 (888) 248-4226',
          balance: 45000.50,
          accountRef: 'XXXX-1010',
        },
      ],
    },
  ],
  Invoice: [
    {
      invoiceGroup: 'MONTHLY_BILLING_STATEMENTS',
      statementItems: [
        {
          customerName: 'Sovereignty Ventures LLC',
          customerRefId: '1',
          amountDue: 7689.62,
          dueDate: '2026-09-15',
          lineDescription: 'Citi Card Monthly Balance Settlement - Statement #4316',
        },
        {
          customerName: 'Vance Capital Corp',
          customerRefId: '2',
          amountDue: 2996.57,
          dueDate: '2026-09-20',
          lineDescription: 'Citi ThankYou Card Billing - Statement #3250',
        },
      ],
    },
  ],
  Payment: [
    {
      paymentGroup: 'DIRECT_ACH_SETTLEMENTS',
      settlements: [
        {
          customerName: 'Sovereignty Ventures LLC',
          customerRefId: '1',
          amountPaid: 7689.62,
          paymentDate: '2026-08-24',
          paymentMethod: 'ACH_ECHECK',
          referenceNumber: 'CITI-ACH-998812',
        },
      ],
    },
  ],
};

const API_ENDPOINTS_DOCS = [
  {
    path: '/api/google/hmac/generate-key',
    method: 'POST',
    title: 'Google Cloud Service Account HMAC Key Generator',
    description: 'Provisions and activates a Google Cloud Service Account HMAC key (GOOG1E Access ID + Base64 Secret) and registers it for GOOG4-HMAC-SHA256 authenticated API requests.',
    params: [
      { name: 'serviceAccountEmail', type: 'String', required: false, desc: 'Google Cloud Service Account email.' },
      { name: 'projectId', type: 'String', required: false, desc: 'Google Cloud project ID.' },
      { name: 'customAccessId', type: 'String', required: false, desc: 'Optional custom GOOG1E... access ID.' },
      { name: 'customSecret', type: 'String', required: false, desc: 'Optional custom base64 HMAC secret.' }
    ],
    responseExample: {
      success: true,
      hmacKey: {
        accessId: 'GOOG1E738194720491823901',
        secret: 'a7K9x...mQ4=',
        serviceAccountEmail: 'service-principal@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com',
        state: 'ACTIVE'
      },
      testAuthorizationHeader: 'GOOG4-HMAC-SHA256 Credential=GOOG1E738194720491823901/20260825/auto/storage/goog4_request...'
    }
  },
  {
    path: '/api/google/hmac/sign',
    method: 'POST',
    title: 'Google HMAC-SHA256 Request & Payload Signer',
    description: 'Computes cryptographic HMAC-SHA256 signatures and GOOG4-HMAC-SHA256 Authorization header representations for canonical request objects and API payloads.',
    params: [
      { name: 'data', type: 'Object | String', required: true, desc: 'The payload or canonical string to compute HMAC signature for.' },
      { name: 'method', type: 'String', required: false, desc: 'HTTP method (GET, POST, etc.) for canonical header.' },
      { name: 'path', type: 'String', required: false, desc: 'Target endpoint path for canonical request.' }
    ],
    responseExample: {
      success: true,
      accessId: 'GOOG1E738194720491823901',
      algorithm: 'HMAC-SHA256',
      signatureHex: '9f83a82e71d4b609c217e91823ab...',
      googleAuthHeader: 'GOOG4-HMAC-SHA256 Credential=GOOG1E738194720491823901...'
    }
  },
  {
    path: '/api/google/hmac/verify',
    method: 'POST',
    title: 'Google HMAC Signature Verifier',
    description: 'Performs constant-time timingSafeEqual verification of Google HMAC-SHA256 signatures against raw payloads or requests.',
    params: [
      { name: 'data', type: 'Object | String', required: true, desc: 'Original payload or data string.' },
      { name: 'signature', type: 'String', required: true, desc: 'HMAC-SHA256 hex or base64 signature to verify.' }
    ],
    responseExample: {
      success: true,
      valid: true,
      accessId: 'GOOG1E738194720491823901',
      message: 'Google HMAC signature verified successfully.'
    }
  },
  {
    path: '/api/google/service-account/configure',
    method: 'POST',
    title: 'Google Service Account & HMAC Credentials Configurator',
    description: 'Saves and activates user-provided Google Cloud Service Account JSON or individual credentials (Project ID, Client Email, RSA Private Key, HMAC Access ID, HMAC Secret) in runtime memory and returns formatted .env file content.',
    params: [
      { name: 'serviceAccountJson', type: 'String | Object', required: false, desc: 'Raw Google Cloud Service Account JSON.' },
      { name: 'projectId', type: 'String', required: false, desc: 'Google Cloud Project ID.' },
      { name: 'clientEmail', type: 'String', required: false, desc: 'Service Account email address (General RSA SA).' },
      { name: 'privateKey', type: 'String', required: false, desc: 'RSA PEM encoded private key.' },
      { name: 'hmacServiceAccount', type: 'String', required: false, desc: 'Dedicated HMAC Service Account email.' },
      { name: 'hmacAccessId', type: 'String', required: false, desc: 'Google Cloud HMAC Access ID (GOOG1E...).' },
      { name: 'hmacSecret', type: 'String', required: false, desc: 'Base64 Google HMAC Secret.' }
    ],
    responseExample: {
      success: true,
      message: 'Google Service Account & HMAC credentials successfully saved and activated in memory.',
      envText: 'GOOGLE_PROJECT_ID="aistudio-quickbooksoauth2-43d92844"\nGOOGLE_CLIENT_EMAIL="service-principal@..."\nGOOGLE_HMAC_ACCESS_ID="GOOG1E738194..."\nGOOGLE_HMAC_SECRET="..."',
      servicePrincipal: { projectId: 'aistudio-quickbooksoauth2-43d92844', clientEmail: 'service-principal@...', hasPrivateKey: true },
      hmacKey: { accessId: 'GOOG1E738194...', state: 'ACTIVE' }
    }
  },
  {
    path: '/api/google/service-account/import-json',
    method: 'POST',
    title: 'Google Cloud Service Account JSON Importer',
    description: 'Parses, validates, and registers a downloaded Google Cloud service-account-key.json file to immediately enable RSA signing and JWT assertion generation.',
    params: [
      { name: 'rawJson', type: 'String | Object', required: true, desc: 'Raw service account JSON contents.' }
    ],
    responseExample: {
      success: true,
      message: 'Google Cloud Service Account JSON imported and activated successfully.',
      parsed: { projectId: 'aistudio-quickbooksoauth2-43d92844', clientEmail: 'sa@...iam.gserviceaccount.com' },
      envText: 'GOOGLE_PROJECT_ID="aistudio-quickbooksoauth2-43d92844"...'
    }
  },
  {
    path: '/api/google/service-account/env-export',
    method: 'GET',
    title: 'Live Service Account & HMAC .env Exporter',
    description: 'Exports the live runtime Google Service Principal, RSA key, and HMAC credentials as a clean .env formatted configuration string ready for copying.',
    params: [],
    responseExample: {
      success: true,
      envText: 'GOOGLE_PROJECT_ID="aistudio-quickbooksoauth2-43d92844"\nGOOGLE_CLIENT_EMAIL="service-principal@..."\nGOOGLE_HMAC_ACCESS_ID="GOOG1E..."\nGOOGLE_HMAC_SECRET="..."',
      servicePrincipal: { projectId: 'aistudio-quickbooksoauth2-43d92844', clientEmail: 'service-principal@...' },
      hmacKey: { accessId: 'GOOG1E738194...', state: 'ACTIVE' }
    }
  },
  {
    path: '/api/google/service-account/generate-key',
    method: 'POST',
    title: 'Google Service Principal Credentials & API Key Generator',
    description: 'Uses Google RSA private key signing and service principal credentials to issue valid Google API Keys, HMAC keys, and signed JWT assertion tokens for server self-calling.',
    params: [
      { name: 'projectId', type: 'String', required: false, desc: 'Google Cloud Project ID.' },
      { name: 'clientEmail', type: 'String', required: false, desc: 'Google Service Account Client Email.' },
      { name: 'customPrivateKey', type: 'String', required: false, desc: 'Optional PEM encoded RSA private key.' }
    ],
    responseExample: {
      success: true,
      googleApiKey: 'AIzaSyC49k2xL90mQzP81a7b...',
      masterApiKey: 'sk_live_aibanking_9f83a82e71d4b609c217',
      googleHmac: { accessId: 'GOOG1E738194720491823901', state: 'ACTIVE' },
      servicePrincipal: { projectId: 'aistudio-quickbooksoauth2-43d92844', clientEmail: 'service-principal@...gserviceaccount.com' },
      jwtAssertion: 'eyJhbGciOiJSUzI1NiIs...'
    }
  },
  {
    path: '/accounts',
    method: 'GET',
    title: 'Chase Open Banking Search Accounts',
    description: 'Retrieve account details and balance list for Chase accounts. Supports playground-id-token and interactionId headers.',
    params: [
      { name: 'playground-id-token', type: 'Header String', required: false, desc: 'Token identifier for playground environment.' },
      { name: 'authorization', type: 'Header String', required: false, desc: 'Bearer or OAuth authorization token.' },
      { name: 'interactionId', type: 'Header String', required: false, desc: 'Unique interaction sequence identifier.' }
    ],
    responseExample: {
      status: 200,
      accounts: [
        { accountId: '121000358', accountName: 'Chase Sapphire Reserve Preferred', accountNumber: '987654321', accountType: 'CREDIT_CARD', currentBalance: 4250.75 }
      ]
    }
  },
  {
    path: '/accounts/{accountId}/payment-networks',
    method: 'GET',
    title: 'Chase Payment Networks Supported By Account',
    description: 'Returns supported payment networks (e.g. US_ACH, TOKENIZED_ACCOUNT_NUMBER) for a specific account ID.',
    params: [
      { name: 'accountId', type: 'Path Parameter', required: true, desc: 'Target account ID (e.g. 121000358).' },
      { name: 'playground-id-token', type: 'Header String', required: false, desc: 'Token identifier for playground environment.' }
    ],
    responseExample: {
      paymentNetworks: [
        { bankId: '121000358', identifier: '987654321', identifierType: 'TOKENIZED_ACCOUNT_NUMBER', type: 'US_ACH', transferIn: true, transferOut: true }
      ]
    }
  },
  {
    path: '/mock/aggregator-oauth/v1/authorize',
    method: 'GET',
    title: 'Chase Aggregator OAuth Authorization',
    description: 'Authorizes aggregator access for Sunshine Wallet payment settlement.',
    params: [
      { name: 'client_id', type: 'Query String', required: true, desc: 'Client identifier (e.g. SUNSHINE_WALLET).' },
      { name: 'scope', type: 'Query String', required: true, desc: 'Requested scope (e.g. aggregator).' }
    ],
    responseExample: {
      status: 'AUTHORIZED',
      code: 'chase_auth_code_88192',
      playgroundIdToken: 'copied-playground-token-id'
    }
  },
  {
    path: '/api/intuit/universal/transform-and-ingest',
    method: 'POST',
    title: 'Universal AI Schema Transformation & Ingest',
    description: 'Accepts arbitrary banking JSON (Citi, Chase, Visa, cURL dumps), performs AI-driven schema translation via Gemini 2.5/3.7, and provisions entities into QuickBooks Online.',
    params: [
      { name: 'rawData', type: 'Array | Object', required: true, desc: 'Raw financial payload, banking statement, or array of accounts.' },
      { name: 'targetEntity', type: 'String', required: false, desc: 'Target QBO schema: "Account", "Customer", "Invoice", or "Payment" (Default: "Account").' },
      { name: 'realmId', type: 'String', required: false, desc: 'Target QuickBooks Company Realm ID.' },
      { name: 'accessToken', type: 'String', required: false, desc: 'Valid OAuth 2.0 Access Token.' },
    ],
    responseExample: {
      success: true,
      durationMs: 412,
      targetEntity: 'Account',
      transformedCount: 4,
      transformedEntities: [
        { Name: 'Costco Anywhere Visa', AccountType: 'Credit Card', AcctNum: '0019', CurrentBalance: 7689.62 }
      ],
      quickbooksResults: [{ Id: 'SOV-817293', Status: 'PROVISIONED_VIA_AIBANKING_ENGINE' }]
    }
  },
  {
    path: '/api/intuit/ai-map-accounts',
    method: 'POST',
    title: 'AI Chart of Accounts Auto-Mapper',
    description: 'Parses unstructured text, cURL outputs, or raw bank feeds and maps them cleanly into QBO Chart of Accounts structure with classification rules.',
    params: [
      { name: 'rawInput', type: 'String | Object', required: true, desc: 'Text blob, statement, or raw JSON body.' },
      { name: 'contextHint', type: 'String', required: false, desc: 'Optional domain hint (e.g. "Citi Commercial Banking").' }
    ],
    responseExample: {
      success: true,
      accounts: [
        { Name: 'Citi Priority Checking', AccountType: 'Bank', AccountSubType: 'Checking', Balance: 8520 }
      ]
    }
  },
  {
    path: '/api/intuit/pull-all',
    method: 'POST',
    title: 'Full-Spectrum Sandbox Data Pull',
    description: 'Retrieves complete live sandbox state in a single call including Company Info, Customers, Chart of Accounts, Invoices, and Payments.',
    params: [
      { name: 'realmId', type: 'String', required: true, desc: 'QuickBooks Realm ID.' },
      { name: 'accessToken', type: 'String', required: true, desc: 'OAuth 2.0 Access Token.' }
    ],
    responseExample: {
      success: true,
      company: { CompanyName: 'Sandbox Company' },
      customers: [{ DisplayName: 'John Doe' }],
      accounts: [{ Name: 'Checking' }]
    }
  },
  {
    path: '/api/intuit/customers/create',
    method: 'POST',
    title: 'Create QuickBooks Customer',
    description: 'Provisions a new Customer entity into QuickBooks Online Chart of Accounts / Receivables.',
    params: [
      { name: 'displayName', type: 'String', required: true, desc: 'Customer full display name.' },
      { name: 'email', type: 'String', required: false, desc: 'Primary contact email.' },
      { name: 'companyName', type: 'String', required: false, desc: 'Business organization name.' },
      { name: 'realmId', type: 'String', required: true, desc: 'QBO Company Realm ID.' },
      { name: 'accessToken', type: 'String', required: true, desc: 'QBO OAuth 2.0 Access Token.' }
    ],
    responseExample: {
      Customer: { Id: '12', DisplayName: 'Johnathan Sovereign', Balance: 0 }
    }
  },
  {
    path: '/api/intuit/invoices/create',
    method: 'POST',
    title: 'Create QuickBooks Invoice',
    description: 'Generates a customer invoice with line item details and total billing amount.',
    params: [
      { name: 'customerId', type: 'String', required: true, desc: 'ID of target Customer.' },
      { name: 'amount', type: 'Number', required: false, desc: 'Invoice total amount (Default: $100.00).' },
      { name: 'description', type: 'String', required: false, desc: 'Line item description.' },
      { name: 'realmId', type: 'String', required: true, desc: 'QBO Company Realm ID.' },
      { name: 'accessToken', type: 'String', required: true, desc: 'QBO OAuth 2.0 Access Token.' }
    ],
    responseExample: {
      Invoice: { Id: '104', TotalAmt: 7689.62, DocNumber: '1004' }
    }
  }
];

export default function QuickBooksCommandBridge({ tokens }: QuickBooksCommandBridgeProps) {
  const [targetEntity, setTargetEntity] = useState<'Account' | 'Invoice' | 'Customer' | 'Payment'>('Account');
  const [rawInput, setRawInput] = useState<string>(JSON.stringify(PRESET_PAYLOADS.Account, null, 2));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'raw' | 'preview' | 'curl' | 'docs' | 'sdk'>('raw');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // cURL Runner State
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/intuit/universal/transform-and-ingest');
  const [curlMethod, setCurlMethod] = useState<'GET' | 'POST' | 'PUT'>('POST');
  const [curlResponse, setCurlResponse] = useState<any>(null);
  const [curlLoading, setCurlLoading] = useState(false);

  // Language Code Snippet State
  const [sdkLang, setSdkLang] = useState<'curl' | 'node' | 'python' | 'go'>('curl');

  const handleEntityChange = (entity: 'Account' | 'Invoice' | 'Customer' | 'Payment') => {
    setTargetEntity(entity);
    setRawInput(JSON.stringify(PRESET_PAYLOADS[entity], null, 2));
    setStatusMessage(`Loaded preset payload template for entity target: "${entity}"`);
  };

  const executeTransformationAndSync = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      let parsedData: any;
      try {
        parsedData = JSON.parse(rawInput);
      } catch (err: any) {
        // If raw string / cURL dump, send as file upload content
        const fileRes = await fetch('/api/intuit/universal/file-upload-ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileContent: rawInput,
            fileName: 'raw_snippet.txt',
            fileType: 'txt',
            realmId: tokens?.realmId,
            accessToken: tokens?.accessToken,
          }),
        });
        const fileData = await fileRes.json();
        setResult(fileData);
        setActiveTab('preview');
        setStatusMessage('Parsed unstructured raw data successfully!');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/intuit/universal/transform-and-ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawData: parsedData,
          targetEntity,
          realmId: tokens?.realmId,
          accessToken: tokens?.accessToken,
        }),
      });
      const data = await res.json();
      setResult(data);
      setActiveTab('preview');
      setStatusMessage(
        data.success
          ? `Successfully transformed ${data.transformedCount || 0} ${targetEntity} entities in ${data.durationMs}ms.`
          : `Execution completed: ${data.error || 'Check result panel.'}`
      );
    } catch (err: any) {
      alert('Execution error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawInput(content);
      setStatusMessage(`Loaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    };
    reader.readAsText(file);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runDirectCurl = async () => {
    setCurlLoading(true);
    try {
      let bodyData = null;
      if (curlMethod !== 'GET') {
        try {
          bodyData = JSON.parse(rawInput);
        } catch {
          bodyData = { rawData: rawInput };
        }
      }

      const fullUrl = selectedEndpoint.startsWith('http') ? selectedEndpoint : `https://aibanking.dev${selectedEndpoint}`;

      const res = await fetch('/api/intuit/suite/curl-runner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: fullUrl,
          method: curlMethod,
          body: bodyData,
          headers: tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {},
        }),
      });
      const data = await res.json();
      setCurlResponse(data);
    } catch (err: any) {
      setCurlResponse({ error: err.message });
    } finally {
      setCurlLoading(false);
    }
  };

  const generatedCurlExample = `curl -X POST https://aibanking.dev/api/intuit/universal/transform-and-ingest \\
  -H "Content-Type: application/json" \\
  -d '{
    "rawData": ${rawInput.trim()},
    "targetEntity": "${targetEntity}"
  }'`;

  const getSdkCodeSnippet = () => {
    if (sdkLang === 'node') {
      return `import axios from 'axios';

const runIngest = async () => {
  const response = await axios.post('https://aibanking.dev/api/intuit/universal/transform-and-ingest', {
    rawData: ${rawInput.trim()},
    targetEntity: '${targetEntity}',
    realmId: '${tokens?.realmId || 'YOUR_REALM_ID'}',
    accessToken: '${tokens?.accessToken || 'YOUR_ACCESS_TOKEN'}'
  });

  console.log('Transformed Entities:', response.data.transformedEntities);
};

runIngest();`;
    }

    if (sdkLang === 'python') {
      return `import requests

url = "https://aibanking.dev/api/intuit/universal/transform-and-ingest"
payload = {
    "rawData": ${rawInput.trim()},
    "targetEntity": "${targetEntity}",
    "realmId": "${tokens?.realmId || 'YOUR_REALM_ID'}",
    "accessToken": "${tokens?.accessToken || 'YOUR_ACCESS_TOKEN'}"
}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
    }

    if (sdkLang === 'go') {
      return `package main

import (
	"bytes"
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "https://aibanking.dev/api/intuit/universal/transform-and-ingest"
	var jsonStr = []byte(\`${generatedCurlExample}\`)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}`;
    }

    return generatedCurlExample;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                QuickBooks Autonomous Ledger Bridge
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                  Universal Ingest
                </span>
              </h1>
            </div>
          </div>
          <p className="text-slate-400 text-sm max-w-3xl">
            Modern Treasury-grade financial API and autonomous schema transformation engine. Directly ingests Citi, Chase, and Visa banking feeds into QuickBooks Online.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 font-medium text-sm transition">
            <Upload className="w-4 h-4 text-emerald-400" /> Upload Raw Payload
            <input type="file" accept=".json,.txt,.csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={executeTransformationAndSync}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            Run AI Transform & Ingest
          </button>
        </div>
      </div>

      {/* Target Entity Selector & Provenance Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-sans uppercase font-bold text-[11px] tracking-wider">Target Entity Schema:</span>
          {(['Account', 'Customer', 'Invoice', 'Payment'] as const).map((ent) => (
            <button
              key={ent}
              onClick={() => handleEntityChange(ent)}
              className={`px-3 py-1 rounded-lg transition ${
                targetEntity === ent
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
              }`}
            >
              {ent}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sovereign Key: <strong className="text-slate-200">0009-0009-5132-4316</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" /> Environment: <strong className="text-slate-200">100% SWAGGER AUTO-SETTLE</strong>
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('raw')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'raw' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" /> 1. Raw Ingestion Payload
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'preview' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" /> 2. Transformed QBO Entities {result?.transformedCount ? `(${result.transformedCount})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('curl')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'curl' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" /> 3. Live cURL & API Terminal
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'docs' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" /> 4. Modern Treasury API Docs
        </button>
        <button
          onClick={() => setActiveTab('sdk')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'sdk' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" /> 5. SDK Code Generator
        </button>
      </div>

      {/* Main Tab Content */}

      {/* Tab 1: Raw Ingestion Payload & Preview Split */}
      {activeTab === 'raw' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[650px]">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Terminal className="w-4 h-4 text-emerald-400" />
                INCOMING_PAYLOAD_BUFFER.json
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRawInput(JSON.stringify(PRESET_PAYLOADS[targetEntity], null, 2))}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Reset Preset
                </button>
                <button
                  onClick={() => setRawInput('')}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste raw Citi, Chase, Visa API responses or cURL payloads here..."
              className="flex-1 w-full bg-slate-950 font-mono text-xs text-emerald-300 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed"
            />
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[650px] overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                TRANSFORMED_QBO_ENTITIES.json
              </div>
              <div className="flex items-center gap-2">
                {result?.durationMs && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                    {result.durationMs}ms Execution
                  </span>
                )}
                {result && (
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                    title="Copy Result"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-auto font-mono text-xs">
              {result ? (
                <div className="space-y-4">
                  {result.transformedEntities && Array.isArray(result.transformedEntities) && (
                    <div className="space-y-2">
                      <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                        Mapped QBO {targetEntity} Entities ({result.transformedEntities.length}):
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {result.transformedEntities.map((ent: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between"
                          >
                            <div className="space-y-0.5">
                              <div className="text-slate-200 font-semibold flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                                {ent.Name || ent.DisplayName || `Entity #${idx + 1}`}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {ent.AccountType ? (
                                  <>Type: <span className="text-emerald-300">{ent.AccountType}</span> ({ent.AccountSubType || 'Standard'}) • Acct: #{ent.AcctNum || 'N/A'}</>
                                ) : ent.CompanyName ? (
                                  <>Company: <span className="text-emerald-300">{ent.CompanyName}</span> • Email: {ent.PrimaryEmailAddr?.Address || 'N/A'}</>
                                ) : (
                                  <>Total: <span className="text-emerald-300">${ent.TotalAmt || ent.Balance || 0}</span></>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-slate-200 font-bold">
                                ${Number(ent.CurrentBalance || ent.Balance || ent.TotalAmt || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </div>
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                                {ent.Classification || targetEntity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                      Raw Response Body:
                    </div>
                    <pre className="text-slate-300">{JSON.stringify(result, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                  <Database className="w-10 h-10 opacity-30 text-emerald-400" />
                  <p className="text-center text-xs max-w-sm">
                    Hit <strong>Run AI Transform & Ingest</strong> to transform Citi cards, savings, loans, and IRAs directly into QuickBooks Online entities.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Preview Dedicated View */}
      {activeTab === 'preview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" /> Transformed QBO Entity Pipeline
              </h3>
              <p className="text-xs text-slate-400">Live preview of mapped objects ready for QuickBooks Online Chart of Accounts or Receivables.</p>
            </div>
            {result && (
              <button
                onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Response
              </button>
            )}
          </div>

          {result ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(result.transformedEntities || []).map((ent: any, i: number) => (
                  <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono text-emerald-400 font-bold">#{i + 1} {targetEntity}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded">
                        PROVISIONED
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm truncate">
                      {ent.Name || ent.DisplayName || 'QBO Entity'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {ent.AccountType ? `${ent.AccountType} (${ent.AccountSubType})` : ent.CompanyName || 'Citi Banking'}
                    </div>
                    <div className="text-base font-mono font-bold text-emerald-400 pt-2 border-t border-slate-800">
                      ${Number(ent.CurrentBalance || ent.Balance || ent.TotalAmt || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="text-xs font-mono text-slate-400 mb-2 font-bold uppercase">Full JSON Response Stream</div>
                <pre className="text-xs font-mono text-emerald-300 overflow-x-auto p-3 bg-slate-900 rounded-lg">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 space-y-3 bg-slate-950 rounded-xl border border-slate-800">
              <Sparkles className="w-10 h-10 mx-auto opacity-30 text-emerald-400" />
              <p className="text-sm">No active transformation executed yet. Click "Run AI Transform & Ingest" from the top banner to generate QBO objects.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Interactive cURL Terminal */}
      {activeTab === 'curl' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> Live Terminal Ingestion cURL
              </h3>
              <button
                onClick={() => copyToClipboard(generatedCurlExample)}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy cURL
              </button>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
              {generatedCurlExample}
            </pre>
            
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="text-xs text-slate-400 font-semibold block">Select API Endpoint to Test:</label>
              <select
                value={selectedEndpoint}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedEndpoint(val);
                  if (val.includes('accounts') || val.includes('authorize') || val.endsWith('/active')) {
                    setCurlMethod('GET');
                  } else {
                    setCurlMethod('POST');
                  }
                  if (val === '/api/google/hmac/sign') {
                    setRawInput(JSON.stringify({
                      data: { action: "TRANSFER", from: "121000358", to: "021000021", amount: 2500.00, currency: "USD" },
                      method: "POST",
                      path: "/api/banking/transfer"
                    }, null, 2));
                  } else if (val === '/api/google/hmac/verify') {
                    setRawInput(JSON.stringify({
                      data: { action: "TRANSFER", from: "121000358", to: "021000021", amount: 2500.00, currency: "USD" },
                      signature: "9f83a82e71d4b609c217e91823abcde874619482710348719283746192837461"
                    }, null, 2));
                  } else if (val === '/api/google/hmac/generate-key') {
                    setRawInput(JSON.stringify({
                      serviceAccountEmail: "service-principal@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com",
                      projectId: "aistudio-quickbooksoauth2-43d92844"
                    }, null, 2));
                  } else if (val === '/api/google/service-account/configure') {
                    setRawInput(JSON.stringify({
                      projectId: "aistudio-quickbooksoauth2-43d92844",
                      clientEmail: "service-principal@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com",
                      hmacAccessId: "GOOG1E738194720491823901",
                      hmacSecret: "a7K9x...mQ4="
                    }, null, 2));
                  } else if (val === '/api/google/service-account/import-json') {
                    setRawInput(JSON.stringify({
                      rawJson: {
                        type: "service_account",
                        project_id: "aistudio-quickbooksoauth2-43d92844",
                        private_key_id: "9f83a82e71d4b609c217",
                        private_key: "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD...\\n-----END PRIVATE KEY-----\\n",
                        client_email: "sa@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com",
                        client_id: "10982374619283746"
                      }
                    }, null, 2));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl font-mono"
              >
                <option value="/api/google/service-account/configure">POST /api/google/service-account/configure (Save & Activate SA & HMAC)</option>
                <option value="/api/google/service-account/import-json">POST /api/google/service-account/import-json (Import SA JSON File)</option>
                <option value="/api/google/service-account/env-export">GET /api/google/service-account/env-export (Export .env Configuration)</option>
                <option value="/api/google/hmac/generate-key">POST /api/google/hmac/generate-key (Google Cloud HMAC Key Gen)</option>
                <option value="/api/google/hmac/sign">POST /api/google/hmac/sign (Google HMAC-SHA256 Signer)</option>
                <option value="/api/google/hmac/verify">POST /api/google/hmac/verify (Google HMAC Signature Verifier)</option>
                <option value="/api/google/hmac/active">GET /api/google/hmac/active (Active Google Cloud HMAC Key)</option>
                <option value="/api/google/service-account/generate-key">POST /api/google/service-account/generate-key (Google Key & Service Principal Gen)</option>
                <option value="/api/google/verify-key">POST /api/google/verify-key (Verify Google/Self API Key)</option>
                <option value="/accounts">GET /accounts (Chase Search Accounts)</option>
                <option value="/accounts/121000358/payment-networks">GET /accounts/121000358/payment-networks (Chase Payment Networks)</option>
                <option value="https://apidemo.chase.com/mock/aggregator-oauth/v1/authorize?response_type=code&client_id=SUNSHINE_WALLET&redirect_uri=showcaseApp/payment-settlement/eligible-accounts&state=apigeeapp&scope=aggregator">GET https://apidemo.chase.com/mock/aggregator-oauth/v1/authorize (Chase Aggregator Authorize)</option>
                <option value="/api/intuit/universal/transform-and-ingest">POST /api/intuit/universal/transform-and-ingest (Universal Ingest)</option>
                <option value="/api/intuit/ai-map-accounts">POST /api/intuit/ai-map-accounts (AI Account Mapper)</option>
                <option value="/api/intuit/pull-all">POST /api/intuit/pull-all (Full-Spectrum Sandbox Sync)</option>
                <option value="/api/intuit/customers/create">POST /api/intuit/customers/create (Create Customer)</option>
                <option value="/api/intuit/accounts/create">POST /api/intuit/accounts/create (Create Account)</option>
                <option value="/api/intuit/invoices/create">POST /api/intuit/invoices/create (Create Invoice)</option>
              </select>

              <div className="flex gap-2">
                <select
                  value={curlMethod}
                  onChange={(e) => setCurlMethod(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl font-mono"
                >
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                  <option value="PUT">PUT</option>
                </select>
                <input
                  type="text"
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl font-mono"
                />
                <button
                  onClick={runDirectCurl}
                  disabled={curlLoading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {curlLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  Execute
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-blue-400" /> REMOTE_RESPONSE_STAMP.json
              </span>
            </div>
            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-auto font-mono text-xs text-slate-300">
              {curlResponse ? (
                <pre>{JSON.stringify(curlResponse, null, 2)}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Terminal className="w-8 h-8 opacity-30" />
                  <p className="text-xs">Execute a cURL or proxy request to view live stream output.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Modern Treasury Grade API Documentation */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Modern Treasury Style API Reference Specification</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl">
              Complete REST API specification for autonomous banking ingestion, OAuth 2.0 authentication, and QuickBooks Online entity provisioning.
            </p>
          </div>

          <div className="space-y-6">
            {API_ENDPOINTS_DOCS.map((doc, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {doc.method}
                    </span>
                    <span className="font-mono text-sm font-bold text-white">{doc.path}</span>
                  </div>
                  <span className="text-xs text-slate-400">{doc.title}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{doc.description}</p>

                {/* Parameters Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Request Body Parameters</h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase">
                        <tr>
                          <th className="p-3">Parameter</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Required</th>
                          <th className="p-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                        {doc.params.map((p, pIdx) => (
                          <tr key={pIdx} className="hover:bg-slate-950/50">
                            <td className="p-3 font-bold text-emerald-400">{p.name}</td>
                            <td className="p-3 text-slate-400">{p.type}</td>
                            <td className="p-3">
                              {p.required ? (
                                <span className="text-rose-400 font-bold">REQUIRED</span>
                              ) : (
                                <span className="text-slate-500">OPTIONAL</span>
                              )}
                            </td>
                            <td className="p-3 text-slate-300 font-sans">{p.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Response Example */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">200 OK Response Schema Example</h4>
                  <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto">
                    {JSON.stringify(doc.responseExample, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: SDK Code Snippets */}
      {activeTab === 'sdk' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" /> Multi-Language SDK Snippets
              </h3>
              <p className="text-xs text-slate-400">Copy pre-formatted SDK code to integrate the Universal Ingestion engine into your application.</p>
            </div>
            <div className="flex items-center gap-2">
              {(['curl', 'node', 'python', 'go'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSdkLang(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition uppercase ${
                    sdkLang === lang
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
              <button
                onClick={() => copyToClipboard(getSdkCodeSnippet())}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <pre className="p-5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {getSdkCodeSnippet()}
          </pre>
        </div>
      )}
    </div>
  );
}
