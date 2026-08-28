import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Send,
  Download,
  Code2,
  FileText,
  Lock,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Building2,
  DollarSign,
  Zap,
  Terminal,
  FileCode,
  Sparkles,
  Info,
  CreditCard,
  Hash,
  Mail,
  UserCheck,
  Smartphone
} from 'lucide-react';
import { TokenResponse } from '../types';
import { apiFetch } from '../utils/apiClient';

interface WesternUnionPsd2ConsoleProps {
  tokens?: TokenResponse | null;
  realmId?: string;
  onNavigateToBridge?: () => void;
}

export const WesternUnionPsd2Console: React.FC<WesternUnionPsd2ConsoleProps> = ({
  tokens,
  realmId,
  onNavigateToBridge,
}) => {
  // Navigation
  const [activeSubTab, setActiveSubTab] = useState<
    'auth-credentials' | 'signature' | 'registration' | 'api-runner' | 'code-gen' | 'bridge'
  >('auth-credentials');

  // Config & State
  const [configData, setConfigData] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Developer Portal Auth / SCA State
  const [authEmail, setAuthEmail] = useState('developer@westernunion.com');
  const [authPassword, setAuthPassword] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authStep, setAuthStep] = useState<'login' | 'otp' | 'authenticated'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authResult, setAuthResult] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Signature Generator State
  const [requestBodyInput, setRequestBodyInput] = useState<string>(
    JSON.stringify(
      {
        tppName: 'SaltTest PSD2 Application',
        roles: ['AISP', 'PISP'],
        organizationId: 'TppSaltTest000',
        redirectUri: 'https://developer.westernunion.com/oauth2/callback',
      },
      null,
      2
    )
  );
  const [customRequestId, setCustomRequestId] = useState<string>('5b2d13ae-f7e8-4088-b98f-0acf05ac3303');
  const [customDate, setCustomDate] = useState<string>('Wed, 23 Mar 2022 10:03:06 GMT');
  const [selectedCertId, setSelectedCertId] = useState<string>('cert-live-wu-001');
  const [customSerial, setCustomSerial] = useState<string>('0');
  const [customIssuerDn, setCustomIssuerDn] = useState<string>(
    '/organizationIdentifier=TppSaltTest000/CN=certSIGNSALTTEST Web CA/O=SaltTest/C=RO'
  );
  const [signatureOutput, setSignatureOutput] = useState<any>(null);
  const [signingLoading, setSigningLoading] = useState(false);

  // Certificate Generator / Import State
  const [genOrgName, setGenOrgName] = useState('Western Union Global FinTech TPP');
  const [genOrgId, setGenOrgId] = useState('PSD2-WU-TPP-884920');
  const [genCountry, setGenCountry] = useState('AT');
  const [genRoles, setGenRoles] = useState<string[]>(['AISP', 'PISP']);
  const [genEnvironment, setGenEnvironment] = useState<'SANDBOX' | 'PRODUCTION'>('SANDBOX');
  const [certGenLoading, setCertGenLoading] = useState(false);
  const [certGenResult, setCertGenResult] = useState<any>(null);

  // TPP Registration State
  const [tppNameInput, setTppNameInput] = useState('Western Union Digital Remittance Gateway');
  const [tppRoles, setTppRoles] = useState<string[]>(['AISP', 'PISP']);
  const [tppRedirectUri, setTppRedirectUri] = useState('https://developer.westernunion.com/oauth2/callback');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registeredTppResult, setRegisteredTppResult] = useState<any>(null);

  // API Runner State
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/v1/accounts');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiRequestBody, setApiRequestBody] = useState<string>('{}');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Code Gen State
  const [codeLanguage, setCodeLanguage] = useState<'ruby' | 'node' | 'curl' | 'python' | 'java'>('ruby');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await apiFetch<any>('/api/wu-psd2/config');
      if (res.ok && res.data) {
        setConfigData(res.data);
        if (res.data.authStatus) {
          if (res.data.authStatus.developerEmail) {
            setAuthEmail(res.data.authStatus.developerEmail);
          }
          if (res.data.authStatus.currentOtp && res.data.authStatus.currentOtp !== 'Auto-generated / Waiting for SMS/Auth App') {
            setAuthOtp(res.data.authStatus.currentOtp);
          }
        }
        if (res.data.certificates && res.data.certificates.length > 0) {
          const first = res.data.certificates[0];
          setSelectedCertId(first.id);
          setCustomSerial(first.serialNumber);
          setCustomIssuerDn(first.issuerDn);
        }
      }
    } catch (e) {
      console.error('Failed to load Western Union PSD2 configuration', e);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleAuthLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await apiFetch<any>('/api/wu-psd2/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      if (res.ok && res.data?.success) {
        setAuthResult(res.data);
        setAuthStep('otp');
        if (res.data.session?.suggestedOtp) {
          setAuthOtp(res.data.session.suggestedOtp);
        }
      } else {
        setAuthError(res.data?.error || 'Failed to authenticate with Western Union Developer Portal');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Network error during Western Union login');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthVerifyOtp = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await apiFetch<any>('/api/wu-psd2/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: authEmail, otp: authOtp }),
      });
      if (res.ok && res.data?.success) {
        setAuthResult(res.data);
        setAuthStep('authenticated');
        fetchConfig();
      } else {
        setAuthError(res.data?.error || 'Invalid or expired OTP code');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error verifying SCA OTP token');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateSignature = async () => {
    setSigningLoading(true);
    try {
      let parsedBody: any = {};
      try {
        parsedBody = requestBodyInput.trim() ? JSON.parse(requestBodyInput) : {};
      } catch {
        parsedBody = requestBodyInput;
      }

      const res = await apiFetch<any>('/api/wu-psd2/generate-signature', {
        method: 'POST',
        body: JSON.stringify({
          body: parsedBody,
          customRequestId: customRequestId || undefined,
          customDate: customDate || undefined,
          serialNumber: customSerial || undefined,
          issuerDn: customIssuerDn || undefined,
          selectedCertId,
        }),
      });

      if (res.ok && res.data?.data) {
        setSignatureOutput(res.data.data);
      }
    } catch (e) {
      console.error('Error generating signature', e);
    } finally {
      setSigningLoading(false);
    }
  };

  // Generate initial signature on load
  useEffect(() => {
    handleGenerateSignature();
  }, [selectedCertId]);

  const handleCreateEidasCert = async () => {
    setCertGenLoading(true);
    try {
      const res = await apiFetch<any>('/api/wu-psd2/certificates/generate', {
        method: 'POST',
        body: JSON.stringify({
          organizationName: genOrgName,
          organizationId: genOrgId,
          country: genCountry,
          roles: genRoles,
          environment: genEnvironment,
        }),
      });

      if (res.ok && res.data?.certificate) {
        setCertGenResult(res.data.certificate);
        fetchConfig();
      }
    } catch (e) {
      console.error('Error creating eIDAS certificate', e);
    } finally {
      setCertGenLoading(false);
    }
  };

  const handleRegisterTpp = async () => {
    setRegisterLoading(true);
    try {
      const res = await apiFetch<any>('/api/wu-psd2/tpp/register', {
        method: 'POST',
        body: JSON.stringify({
          tppName: tppNameInput,
          certificateId: selectedCertId,
          roles: tppRoles,
          redirectUris: [tppRedirectUri],
          environment: genEnvironment,
        }),
      });

      if (res.ok && res.data?.tpp) {
        setRegisteredTppResult(res.data);
        fetchConfig();
      }
    } catch (e) {
      console.error('Error registering TPP', e);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRunApi = async () => {
    setApiLoading(true);
    setApiResponse(null);
    try {
      let body: any = undefined;
      if (apiMethod === 'POST') {
        try {
          body = JSON.parse(apiRequestBody);
        } catch {
          body = {};
        }
      }

      const res = await apiFetch<any>(`/api/wu-psd2${selectedEndpoint}`, {
        method: apiMethod,
        body: body ? JSON.stringify(body) : undefined,
      });

      setApiResponse({
        status: res.status,
        statusText: res.status === 200 || res.status === 201 ? 'OK' : 'ERROR',
        headers: {
          'X-Request-ID': customRequestId || '5b2d13ae-f7e8-4088-b98f-0acf05ac3303',
          'Content-Type': 'application/json',
          'PSD2-Auth': 'BERLIN_GROUP_QSEAL_VALIDATED',
          'Western-Union-Gateway': 'PROV-SANDBOX-EU-01',
        },
        data: res.data,
      });
    } catch (e: any) {
      setApiResponse({
        status: 500,
        statusText: 'Internal Error',
        data: { error: e.message },
      });
    } finally {
      setApiLoading(false);
    }
  };

  // Preset quick endpoints for API runner
  const apiPresets = [
    {
      name: '🏛️ Accounts List (AISP)',
      endpoint: '/v1/accounts',
      method: 'GET' as const,
      desc: 'Retrieves all available Western Union multi-currency bank accounts (EUR, USD, GBP).',
      scopes: ['account'],
      body: '{}',
    },
    {
      name: '💰 Account Balances (AISP)',
      endpoint: '/v1/accounts/wu-acc-eur-881920/balances',
      method: 'GET' as const,
      desc: 'Fetches real-time available and expected EUR balances with IBAN.',
      scopes: ['account'],
      body: '{}',
    },
    {
      name: '📜 Booked Transactions (AISP)',
      endpoint: '/v1/accounts/wu-acc-eur-881920/transactions',
      method: 'GET' as const,
      desc: 'Returns booked settlement transactions, invoice receipts, and remittances.',
      scopes: ['transactions'],
      body: '{}',
    },
    {
      name: '🆔 KYC Verification (AISP)',
      endpoint: '/v1/kyc',
      method: 'GET' as const,
      desc: 'Retrieves customer identity, PEP compliance status, and eIDAS proof.',
      scopes: ['kyc'],
      body: '{}',
    },
    {
      name: '💸 SEPA Credit Transfer (PISP)',
      endpoint: '/v1/payments/sepa-credit-transfers',
      method: 'POST' as const,
      desc: 'Initiates a Berlin Group standard SEPA payment directly from debtor account.',
      scopes: ['payments'],
      body: JSON.stringify(
        {
          instructedAmount: { amount: '450.00', currency: 'EUR' },
          debtorAccount: { iban: 'AT488800000001234567890' },
          creditorAccount: { iban: 'DE89370400440532013000' },
          creditorName: 'Sierra Green Turf Supply GmbH',
          remittanceInformationUnstructured: 'Topsoil & Landscape Supplies Ref: QBO-49',
        },
        null,
        2
      ),
    },
    {
      name: '🌍 WU Cross-Border Remittance (PISP)',
      endpoint: '/v1/payments/cross-border-transfers',
      method: 'POST' as const,
      desc: 'Executes an international Western Union Money Transfer with instant MTCN generation.',
      scopes: ['payments'],
      body: JSON.stringify(
        {
          senderCountry: 'AT',
          receiverCountry: 'PH',
          sendAmount: '500.00',
          sendCurrency: 'EUR',
          receiveCurrency: 'PHP',
          receiverName: 'Maria Santos',
          payoutMethod: 'DIRECT_TO_BANK',
        },
        null,
        2
      ),
    },
    {
      name: '🛡️ Funds Confirmation (PIISP/CBPII)',
      endpoint: '/v1/funds-confirmations',
      method: 'POST' as const,
      desc: 'Verifies whether sufficient funds exist for a corporate card debit.',
      scopes: ['funds_availability'],
      body: JSON.stringify(
        {
          cardNumber: '549201******3250',
          instructedAmount: { amount: '1200.00', currency: 'EUR' },
        },
        null,
        2
      ),
    },
    {
      name: '📋 Create 90-Day Consent (AISP)',
      endpoint: '/v1/consents',
      method: 'POST' as const,
      desc: 'Creates a recurring Berlin Group SCA consent for account aggregation.',
      scopes: ['account', 'transactions'],
      body: JSON.stringify(
        {
          recurringIndicator: true,
          validUntil: '2027-12-31',
          frequencyPerDay: 4,
        },
        null,
        2
      ),
    }
  ];

  const handleSelectPreset = (preset: typeof apiPresets[0]) => {
    setSelectedEndpoint(preset.endpoint);
    setApiMethod(preset.method);
    setApiRequestBody(preset.body);
    setApiResponse(null);
  };

  const getCodeSnippet = () => {
    const xReqId = customRequestId || '5b2d13ae-f7e8-4088-b98f-0acf05ac3303';
    const dateStr = customDate || 'Wed, 23 Mar 2022 10:03:06 GMT';
    const serial = customSerial || '0';
    const issuer = customIssuerDn || '/organizationIdentifier=TppSaltTest000/CN=certSIGNSALTTEST Web CA/O=SaltTest/C=RO';

    if (codeLanguage === 'ruby') {
      return `# ================================================================
# Western Union PSD2 - Berlin Group Signature in Ruby (Official Spec)
# ================================================================
require 'securerandom'
require 'digest'
require 'time'
require 'base64'
require 'openssl'
require 'net/http'
require 'json'

# 1. Prepare Request Body & Unique ID
request_body = ${JSON.stringify(JSON.parse(requestBodyInput || '{}'), null, 2)}
request_body_json = request_body.to_json

# X-Request-ID: Unique GUID for the API call
x_request_id = SecureRandom.uuid

# Digest: SHA-256= + Base64(SHA256(body))
digest = "SHA-256=" + Digest::SHA256.base64digest(request_body_json)

# Date: HTTP-Date format (RFC 7231)
date = Time.now.httpdate

# TPP-Signature-Certificate: Base64 encoded PEM certificate
cert_pem = File.read("eidas_qseal_certificate.pem")
tpp_signature_certificate = Base64.strict_encode64(cert_pem)

# 2. Build SIGNING_HEADERS String
signing_headers = "x-request-id: #{x_request_id}\\n" +
                  "digest: #{digest}\\n" +
                  "date: #{date}"

# 3. Sign with TPP Private Key (RSA-SHA256)
private_key = OpenSSL::PKey::RSA.new(File.read("tpp_private_key.pem"))
signature_bytes = private_key.sign(OpenSSL::Digest::SHA256.new, signing_headers)
raw_signature = Base64.strict_encode64(signature_bytes)

# 4. Construct Signature Header with Decimal Serial & Issuer DN
signature_key_id = "SN=${serial},DN=${issuer}"
signature_header = "Signature keyId='#{signature_key_id}'," +
                   "algorithm='rsa-sha256'," +
                   "headers='x-request-id digest date'," +
                   "signature='#{raw_signature}'"

# 5. Dispatch API Call to Western Union Provider Sandbox
uri = URI("https://api-sandbox.westernunion.com/psd2/v1/tpp/register")
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

headers = {
  "X-Request-ID" => x_request_id,
  "Digest" => digest,
  "Date" => date,
  "TPP-Signature-Certificate" => tpp_signature_certificate,
  "Signature" => signature_header,
  "Content-Type" => "application/json",
  "Accept" => "application/json"
}

req = Net::HTTP::Post.new(uri.request_uri, headers)
req.body = request_body_json
response = http.request(req)

puts "Response Code: #{response.code}"
puts "Response Body: #{response.body}"`;
    }

    if (codeLanguage === 'node') {
      return `// ================================================================
// Western Union PSD2 - Berlin Group Signature in Node.js / TypeScript
// ================================================================
import crypto from 'crypto';
import fs from 'fs';

interface BerlinGroupHeaders {
  'X-Request-ID': string;
  'Digest': string;
  'Date': string;
  'TPP-Signature-Certificate': string;
  'Signature': string;
  'Content-Type': string;
}

export function createBerlinGroupHeaders(
  body: any,
  certPem: string,
  privateKeyPem: string,
  serialNumberDecimal: string = '${serial}',
  issuerDn: string = '${issuer}'
): BerlinGroupHeaders {
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);

  // 1. X-Request-ID (UUID v4)
  const xRequestId = crypto.randomUUID();

  // 2. Digest (SHA-256= + Base64(SHA256))
  const hashBase64 = crypto.createHash('sha256').update(bodyStr, 'utf8').digest('base64');
  const digest = \`SHA-256=\${hashBase64}\`;

  // 3. Date (RFC 7231 / HTTP-Date)
  const date = new Date().toUTCString();

  // 4. TPP-Signature-Certificate (Strict Base64 encoded PEM)
  const tppCertBase64 = Buffer.from(certPem.trim(), 'utf8').toString('base64');

  // 5. SIGNING_HEADERS
  const signingString = \`x-request-id: \${xRequestId}\\ndigest: \${digest}\\ndate: \${date}\`;

  // 6. Sign with RSA-SHA256
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingString, 'utf8');
  signer.end();
  const rawSignature = signer.sign(privateKeyPem, 'base64');

  // 7. Full Signature Header
  const signatureKeyId = \`SN=\${serialNumberDecimal},DN=\${issuerDn}\`;
  const signatureHeader = \`Signature keyId='\${signatureKeyId}',algorithm='rsa-sha256',headers='x-request-id digest date',signature='\${rawSignature}'\`;

  return {
    'X-Request-ID': xRequestId,
    'Digest': digest,
    'Date': date,
    'TPP-Signature-Certificate': tppCertBase64,
    'Signature': signatureHeader,
    'Content-Type': 'application/json',
  };
}

// Example execution:
const certPem = fs.readFileSync('eidas_qseal.pem', 'utf8');
const keyPem = fs.readFileSync('tpp_private_key.pem', 'utf8');
const payload = ${JSON.stringify(JSON.parse(requestBodyInput || '{}'), null, 2)};

const headers = createBerlinGroupHeaders(payload, certPem, keyPem);
console.log('Constructed Berlin Group Headers:', headers);`;
    }

    if (codeLanguage === 'curl') {
      const digest = signatureOutput?.rawDigest || 'SHA-256=yL4tyKu3UC0isKZgiGYDu1guWcLIJyZkLQUb1e35zYw=';
      const sigHeader = signatureOutput?.headers?.Signature || `Signature keyId='SN=${serial},DN=${issuer}',algorithm='rsa-sha256',headers='x-request-id digest date',signature='...'`;
      const tppCert = signatureOutput?.headers?.['TPP-Signature-Certificate']?.slice(0, 40) + '...';

      return `# ================================================================
# Western Union PSD2 - cURL Request with Berlin Group Signature
# ================================================================
curl -X POST "https://api-sandbox.westernunion.com/psd2/v1/tpp/register" \\
  -H "X-Request-ID: ${xReqId}" \\
  -H "Digest: ${digest}" \\
  -H "Date: ${dateStr}" \\
  -H "TPP-Signature-Certificate: ${tppCert}" \\
  -H "Signature: ${sigHeader}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '${requestBodyInput.replace(/\n/g, ' ')}'`;
    }

    if (codeLanguage === 'python') {
      return `# ================================================================
# Western Union PSD2 - Berlin Group Signature in Python 3
# ================================================================
import uuid
import hashlib
import base64
import json
import datetime
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import load_pem_private_key

body = ${JSON.stringify(JSON.parse(requestBodyInput || '{}'), null, 2)}
body_bytes = json.dumps(body).encode('utf-8')

# 1. X-Request-ID
x_request_id = str(uuid.uuid4())

# 2. Digest
digest = "SHA-256=" + base64.b64encode(hashlib.sha256(body_bytes).digest()).decode('utf-8')

# 3. HTTP Date
now = datetime.datetime.now(datetime.timezone.utc)
date_str = now.strftime('%a, %d %b %Y %H:%M:%S GMT')

# 4. TPP-Signature-Certificate
with open("eidas_qseal.pem", "rb") as f:
    cert_pem = f.read()
tpp_cert_b64 = base64.b64encode(cert_pem).decode('utf-8')

# 5. Signing String
signing_headers = f"x-request-id: {x_request_id}\\ndigest: {digest}\\ndate: {date_str}"

# 6. RSA-SHA256 Sign
with open("tpp_private.key", "rb") as f:
    private_key = load_pem_private_key(f.read(), password=None)

sig_bytes = private_key.sign(
    signing_headers.encode('utf-8'),
    padding.PKCS1v15(),
    hashes.SHA256()
)
raw_signature = base64.b64encode(sig_bytes).decode('utf-8')

# 7. Signature Header
signature_key_id = "SN=${serial},DN=${issuer}"
signature_header = f"Signature keyId='{signature_key_id}',algorithm='rsa-sha256',headers='x-request-id digest date',signature='{raw_signature}'"

print("Signature Header:", signature_header)`;
    }

    return `// Western Union PSD2 - Java 17 / 21 Berlin Group Signature Implementation
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.Signature;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.UUID;

public class WesternUnionPsd2Signer {
    public static void main(String[] args) throws Exception {
        String body = "${requestBodyInput.replace(/"/g, '\\"').replace(/\n/g, '')}";
        
        // 1. X-Request-ID
        String xRequestId = UUID.randomUUID().toString();
        
        // 2. Digest
        MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
        byte[] hash = sha256.digest(body.getBytes(StandardCharsets.UTF_8));
        String digest = "SHA-256=" + Base64.getEncoder().encodeToString(hash);
        
        // 3. Date
        String date = DateTimeFormatter.RFC_1123_DATE_TIME.format(ZonedDateTime.now(ZoneOffset.UTC));
        
        // 4. Signing String
        String signingHeaders = "x-request-id: " + xRequestId + "\\n" +
                               "digest: " + digest + "\\n" +
                               "date: " + date;
        
        System.out.println("Ready for RSA-SHA256 sign: " + signingHeaders);
    }
}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#161B22] via-[#1a212d] to-[#161B22] rounded-xl border border-[#30363D] p-6 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black font-black shadow-md">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Western Union PSD2 Developer Portal & Open Banking Gateway
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400" />
                  BERLIN GROUP NEXTGENPSD2
                </span>
              </h2>
            </div>
            <p className="text-xs text-[#8B949E] max-w-3xl leading-relaxed">
              Complete implementation of Western Union's European PSD2 Open Banking API specification. Register TPPs with eIDAS QSEAL test/production certificates, calculate role-based scopes (AISP, PISP, PIISP), construct Berlin Group cryptographic signatures with SHA-256 digests and RSA-SHA256 headers, and execute SEPA transfers & cross-border remittances.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://developer.westernunion.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs font-medium text-[#C9D1D9] border border-[#30363D] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>WU Dev Portal</span>
            </a>
            {onNavigateToBridge && (
              <button
                onClick={onNavigateToBridge}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-xs font-bold text-white shadow-xs border border-[#3FB950]/30 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>QBO Bridge</span>
              </button>
            )}
          </div>
        </div>

        {/* Scope Mapping & Spec Quick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#30363D]">
          <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D]">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] mb-1">
              <span className="font-semibold text-white flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                AISP Certificate
              </span>
              <span className="text-blue-400 font-mono text-[10px]">ACCOUNT</span>
            </div>
            <div className="text-xs text-[#C9D1D9]">
              Scopes: <span className="font-mono text-blue-300 font-bold">account, transactions, kyc</span>
            </div>
            <div className="text-[10px] text-[#8B949E] mt-1">
              Account Info & Balance Ingest
            </div>
          </div>

          <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D]">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] mb-1">
              <span className="font-semibold text-white flex items-center gap-1">
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                PISP Certificate
              </span>
              <span className="text-emerald-400 font-mono text-[10px]">PAYMENTS</span>
            </div>
            <div className="text-xs text-[#C9D1D9]">
              Scopes: <span className="font-mono text-emerald-300 font-bold">payments, funds_availability</span>
            </div>
            <div className="text-[10px] text-[#8B949E] mt-1">
              SEPA & WU Global Remittances
            </div>
          </div>

          <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D]">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] mb-1">
              <span className="font-semibold text-white flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                eIDAS QSEAL Auth
              </span>
              <span className="text-purple-400 font-mono text-[10px]">SIGNATURE</span>
            </div>
            <div className="text-xs text-[#C9D1D9]">
              Algorithm: <span className="font-mono text-purple-300 font-bold">rsa-sha256 (2048/4096)</span>
            </div>
            <div className="text-[10px] text-[#8B949E] mt-1">
              Strict Base64 X.509 Header
            </div>
          </div>

          <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D]">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] mb-1">
              <span className="font-semibold text-white flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Environment
              </span>
              <span className="text-amber-400 font-mono text-[10px]">SANDBOX</span>
            </div>
            <div className="text-xs text-[#C9D1D9]">
              Endpoint: <span className="font-mono text-amber-300 font-bold text-[11px]">/psd2/v1</span>
            </div>
            <div className="text-[10px] text-[#8B949E] mt-1">
              Provider Sandbox eIDAS Active
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#30363D] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('auth-credentials')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'auth-credentials'
              ? 'bg-amber-500 text-black shadow-xs font-bold'
              : 'text-[#8B949E] hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Portal Auth & Environment (.env)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('signature')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'signature'
              ? 'bg-amber-500 text-black shadow-xs font-bold'
              : 'text-[#8B949E] hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Berlin Group Signature Engine</span>
        </button>

        <button
          onClick={() => setActiveSubTab('registration')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'registration'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-[#8B949E] hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>TPP Registration & eIDAS QSEAL</span>
        </button>

        <button
          onClick={() => setActiveSubTab('api-runner')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'api-runner'
              ? 'bg-[#238636] text-white shadow-xs font-bold'
              : 'text-[#8B949E] hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Open Banking API Suite (AISP/PISP)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('code-gen')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'code-gen'
              ? 'bg-purple-600 text-white shadow-xs font-bold'
              : 'text-[#8B949E] hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>SDK & Code Generator</span>
        </button>
      </div>

      {/* SUB-TAB 0: Portal Auth & Environment Variables */}
      {activeSubTab === 'auth-credentials' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Portal Authentication (Email / Password / OTP) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Western Union Developer Portal Login</h3>
                      <p className="text-[11px] text-[#8B949E]">
                        SCA 2-Factor Authentication (Email, Password & SMS/Auth OTP)
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${configData?.authStatus?.isAuthenticated ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {configData?.authStatus?.isAuthenticated ? 'SESSION READY' : 'CONFIG LOADED'}
                  </span>
                </div>

                {authError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Login Form */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      WESTERN_UNION_DEVELOPER_EMAIL
                    </label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="developer@westernunion.com"
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363D] rounded-lg text-xs text-white focus:border-amber-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      WESTERN_UNION_DEVELOPER_PASSWORD
                    </label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363D] rounded-lg text-xs text-white focus:border-amber-500 focus:outline-hidden font-mono"
                    />
                    <div className="text-[10px] text-[#8B949E] mt-1 flex items-center justify-between">
                      <span>Live status: {configData?.authStatus?.hasPassword ? '✅ Password defined in process.env' : '⚠️ Password pending in environment'}</span>
                      <span className="font-mono">{configData?.authStatus?.maskedPassword}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleAuthLogin}
                      disabled={authLoading || !authEmail}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {authLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Step 1: Authenticate & Dispatch SCA OTP</span>
                    </button>
                  </div>

                  {/* OTP Challenge Verification */}
                  <div className="p-4 bg-[#0d1117] rounded-xl border border-[#30363D] space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-white uppercase tracking-wider flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        WESTERN_UNION_OTP (2FA Challenge Code)
                      </label>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        6-Digit SCA Code
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={authOtp}
                        onChange={(e) => setAuthOtp(e.target.value)}
                        placeholder="e.g. 583920"
                        maxLength={6}
                        className="flex-1 px-3 py-2 bg-[#161B22] border border-[#30363D] rounded-lg text-sm text-center font-mono font-bold tracking-widest text-emerald-400 focus:border-emerald-500 focus:outline-hidden"
                      />
                      <button
                        onClick={handleAuthVerifyOtp}
                        disabled={authLoading || !authOtp}
                        className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify OTP</span>
                      </button>
                    </div>

                    <div className="text-[10px] text-[#8B949E] flex items-center justify-between">
                      <span>Current OTP in runtime:</span>
                      <span className="font-mono text-amber-300 font-bold">{configData?.authStatus?.currentOtp || authOtp || 'Not dispatched'}</span>
                    </div>
                  </div>

                  {authResult && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs space-y-1">
                      <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        {authResult.message}
                      </div>
                      {authResult.sessionToken && (
                        <div className="text-[11px] font-mono text-[#C9D1D9] break-all">
                          Session: {authResult.sessionToken}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: Environment Variables Readout & Copy Table */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    Western Union Environment (.env) Variables
                  </h3>
                  <button
                    onClick={() => {
                      const maskedPw = authPassword ? '••••••••' : '';
                      const maskedOtp = authOtp ? '••••••••' : '';
                      const envText = `# Western Union PSD2 Open Banking Environment Template
WESTERN_UNION_ENVIRONMENT="${configData?.portal?.environment || 'sandbox'}"
WESTERN_UNION_BASE_URL="${configData?.portal?.baseUrl || 'https://api-sandbox.westernunion.com/psd2/v1'}"
WESTERN_UNION_DEVELOPER_EMAIL="${authEmail || 'developer@westernunion.com'}"
WESTERN_UNION_DEVELOPER_PASSWORD="${maskedPw}"
WESTERN_UNION_OTP="${maskedOtp}"
WESTERN_UNION_TPP_ID="${configData?.authStatus?.tppId || 'TPP-WU-8890-EU'}"
WESTERN_UNION_CLIENT_ID="${configData?.authStatus?.clientId || 'wu_client_3840294820'}"
WESTERN_UNION_CLIENT_SECRET="••••••••"
WESTERN_UNION_ORGANIZATION_ID="${configData?.authStatus?.organizationId || 'PSDDE-BAFIN-12345678'}"
WESTERN_UNION_ORGANIZATION_NAME="${configData?.authStatus?.organizationName || 'Western Union FinTech Solutions'}"
WESTERN_UNION_COUNTRY="${configData?.authStatus?.country || 'AT'}"
WESTERN_UNION_CERTIFICATE_SERIAL="104928502"
WESTERN_UNION_ISSUER_DN="/organizationIdentifier=PSDDE-BAFIN-12345678/CN=Western Union FinTech Solutions Web CA/O=Western Union/C=AT"
WESTERN_UNION_REDIRECT_URI="${configData?.authStatus?.redirectUri || 'https://developer.westernunion.com/oauth2/callback'}"
WESTERN_UNION_DEFAULT_IBAN="${configData?.authStatus?.defaultIban || 'AT488800000001234567890'}"`;
                      handleCopy(envText, 'all_wu_env');
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] text-[#C9D1D9] text-[11px] font-medium rounded-lg border border-[#30363D] cursor-pointer"
                  >
                    {copiedKey === 'all_wu_env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy All Variables</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#30363D] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-300 font-semibold">WESTERN_UNION_ENVIRONMENT</span>
                      <p className="text-[10px] text-[#8B949E]">Target PSD2 Gateway mode</p>
                    </div>
                    <span className="font-mono text-white text-[11px] font-bold bg-[#161B22] px-2 py-0.5 rounded border border-[#30363D]">{configData?.portal?.environment || 'sandbox'}</span>
                  </div>

                  <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#30363D] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-300 font-semibold">WESTERN_UNION_DEVELOPER_EMAIL</span>
                      <p className="text-[10px] text-[#8B949E]">Developer Portal Login Account</p>
                    </div>
                    <span className="font-mono text-white text-[11px]">{authEmail || 'developer@westernunion.com'}</span>
                  </div>

                  <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#30363D] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-300 font-semibold">WESTERN_UNION_DEVELOPER_PASSWORD</span>
                      <p className="text-[10px] text-[#8B949E]">Developer Portal Password</p>
                    </div>
                    <span className="font-mono text-white text-[11px]">{authPassword ? '••••••••••••' : configData?.authStatus?.maskedPassword}</span>
                  </div>

                  <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#30363D] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-300 font-semibold">WESTERN_UNION_OTP</span>
                      <p className="text-[10px] text-[#8B949E]">2FA SCA Challenge / Verification Code</p>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">{authOtp || configData?.authStatus?.currentOtp || 'Not Set'}</span>
                  </div>

                  <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#30363D] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-300 font-semibold">WESTERN_UNION_TPP_ID</span>
                      <p className="text-[10px] text-[#8B949E]">Registered Third Party Provider ID</p>
                    </div>
                    <span className="font-mono text-white text-[11px]">{configData?.authStatus?.tppId || 'TPP-WU-8890-EU'}</span>
                  </div>

                  <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#30363D] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-300 font-semibold">WESTERN_UNION_BASE_URL</span>
                      <p className="text-[10px] text-[#8B949E]">Berlin Group Gateway URL</p>
                    </div>
                    <span className="font-mono text-[#79C0FF] text-[10px]">{configData?.portal?.baseUrl || 'https://api-sandbox.westernunion.com/psd2/v1'}</span>
                  </div>

                  <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#30363D] flex items-center justify-between">
                    <div>
                      <span className="font-mono text-amber-300 font-semibold">WESTERN_UNION_ORGANIZATION_ID</span>
                      <p className="text-[10px] text-[#8B949E]">eIDAS Certificate Authority Identifier</p>
                    </div>
                    <span className="font-mono text-white text-[11px]">{configData?.authStatus?.organizationId || 'PSDDE-BAFIN-12345678'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: Berlin Group Signature Generator & Inspector */}
      {activeSubTab === 'signature' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Request Configuration (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-400" />
                    Signature Parameters
                  </h3>
                  <button
                    onClick={handleGenerateSignature}
                    disabled={signingLoading}
                    className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${signingLoading ? 'animate-spin' : ''}`} />
                    <span>Recalculate</span>
                  </button>
                </div>

                {/* Certificate Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8B949E] font-medium">eIDAS Signing Certificate:</label>
                  <select
                    value={selectedCertId}
                    onChange={(e) => setSelectedCertId(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363D] text-xs text-white rounded-lg p-2.5 focus:outline-hidden focus:border-amber-400"
                  >
                    {configData?.certificates?.map((cert: any) => (
                      <option key={cert.id} value={cert.id}>
                        {cert.tppName} (Serial: {cert.serialNumber}) [{cert.roles.join('+')}]
                      </option>
                    )) || (
                      <option value="cert-salttest-001">SaltTest Reference (Serial: 0)</option>
                    )}
                  </select>
                </div>

                {/* X-Request-ID Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-[#8B949E] font-medium">X-Request-ID (UUID):</label>
                    <button
                      onClick={() => setCustomRequestId(crypto.randomUUID())}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Generate New UUID
                    </button>
                  </div>
                  <input
                    type="text"
                    value={customRequestId}
                    onChange={(e) => setCustomRequestId(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363D] font-mono text-xs text-white rounded-lg p-2 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                {/* Date Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-[#8B949E] font-medium">Date (RFC 7231 / HTTP-Date):</label>
                    <button
                      onClick={() => setCustomDate(new Date().toUTCString())}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Set to Current GMT
                    </button>
                  </div>
                  <input
                    type="text"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363D] font-mono text-xs text-white rounded-lg p-2 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                {/* Serial & Issuer DN */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1 col-span-1">
                    <label className="text-[11px] text-[#8B949E]">SN (Decimal):</label>
                    <input
                      type="text"
                      value={customSerial}
                      onChange={(e) => setCustomSerial(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363D] font-mono text-xs text-white rounded-lg p-2"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[11px] text-[#8B949E]">DN (Issuer):</label>
                    <input
                      type="text"
                      value={customIssuerDn}
                      onChange={(e) => setCustomIssuerDn(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363D] font-mono text-[11px] text-white rounded-lg p-2"
                    />
                  </div>
                </div>

                {/* Request Payload Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-[#8B949E] font-medium">Request Body (Calculates Digest):</label>
                    <button
                      onClick={() => {
                        setRequestBodyInput(
                          JSON.stringify(
                            {
                              tppName: 'SaltTest TPP Application',
                              roles: ['AISP', 'PISP'],
                              organizationId: 'TppSaltTest000',
                            },
                            null,
                            2
                          )
                        );
                      }}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Load Sample
                    </button>
                  </div>
                  <textarea
                    value={requestBodyInput}
                    onChange={(e) => setRequestBodyInput(e.target.value)}
                    className="w-full h-32 bg-[#0d1117] border border-[#30363D] font-mono text-xs text-white rounded-lg p-2.5 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <button
                  onClick={handleGenerateSignature}
                  disabled={signingLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Lock className="w-4 h-4 text-black" />
                  <span>Compute Berlin Group Signature</span>
                </button>
              </div>
            </div>

            {/* Right Col: Mathematical Cryptographic Breakdown (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Cryptographic Headers Breakdown
                  </h3>
                  <button
                    onClick={() => {
                      if (signatureOutput?.headers) {
                        handleCopy(JSON.stringify(signatureOutput.headers, null, 2), 'all_headers');
                      }
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-xs text-[#C9D1D9] border border-[#30363D] cursor-pointer"
                  >
                    {copiedKey === 'all_headers' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'all_headers' ? 'Copied JSON!' : 'Copy Headers JSON'}</span>
                  </button>
                </div>

                {/* 1. X-Request-ID */}
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#8B949E]">
                    <span className="font-mono text-blue-400 font-bold">X-Request-ID</span>
                    <button
                      onClick={() => handleCopy(signatureOutput?.headers?.['X-Request-ID'] || '', 'xreq')}
                      className="text-[10px] text-[#8B949E] hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'xreq' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-white break-all bg-[#161B22] p-2 rounded border border-[#30363D]">
                    {signatureOutput?.headers?.['X-Request-ID'] || customRequestId}
                  </div>
                </div>

                {/* 2. Digest */}
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#8B949E]">
                    <span className="font-mono text-purple-400 font-bold">Digest (SHA-256= + Base64)</span>
                    <button
                      onClick={() => handleCopy(signatureOutput?.headers?.Digest || '', 'digest')}
                      className="text-[10px] text-[#8B949E] hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'digest' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-purple-300 break-all bg-[#161B22] p-2 rounded border border-[#30363D]">
                    {signatureOutput?.headers?.Digest || 'SHA-256=...'}
                  </div>
                </div>

                {/* 3. Date */}
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#8B949E]">
                    <span className="font-mono text-emerald-400 font-bold">Date</span>
                    <button
                      onClick={() => handleCopy(signatureOutput?.headers?.Date || '', 'date')}
                      className="text-[10px] text-[#8B949E] hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'date' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="font-mono text-xs text-white break-all bg-[#161B22] p-2 rounded border border-[#30363D]">
                    {signatureOutput?.headers?.Date || customDate}
                  </div>
                </div>

                {/* 4. SIGNING_HEADERS String */}
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#8B949E]">
                    <span className="font-mono text-amber-400 font-bold">SIGNING_HEADERS (Exact Payload Fed to RSA-SHA256)</span>
                    <button
                      onClick={() => handleCopy(signatureOutput?.signingString || '', 'sign_str')}
                      className="text-[10px] text-[#8B949E] hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'sign_str' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="font-mono text-[11px] text-amber-300 whitespace-pre-wrap bg-[#161B22] p-2.5 rounded border border-[#30363D] leading-relaxed">
                    {signatureOutput?.signingString || 'x-request-id: ...\ndigest: ...\ndate: ...'}
                  </pre>
                </div>

                {/* 5. Complete Signature Header */}
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#8B949E]">
                    <span className="font-mono text-rose-400 font-bold">Signature (Full Berlin Group Header)</span>
                    <button
                      onClick={() => handleCopy(signatureOutput?.headers?.Signature || '', 'sig_hdr')}
                      className="text-[10px] text-[#8B949E] hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'sig_hdr' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Header</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-rose-300 break-all bg-[#161B22] p-2.5 rounded border border-[#30363D] leading-relaxed max-h-36 overflow-y-auto">
                    {signatureOutput?.headers?.Signature || 'Signature keyId=...'}
                  </div>
                </div>

                {/* 6. TPP-Signature-Certificate */}
                <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363D] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#8B949E]">
                    <span className="font-mono text-teal-400 font-bold">TPP-Signature-Certificate (Strict Base64 PEM)</span>
                    <button
                      onClick={() => handleCopy(signatureOutput?.headers?.['TPP-Signature-Certificate'] || '', 'tpp_cert')}
                      className="text-[10px] text-[#8B949E] hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'tpp_cert' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Base64</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-teal-300 break-all bg-[#161B22] p-2 rounded border border-[#30363D] max-h-20 overflow-y-auto">
                    {signatureOutput?.headers?.['TPP-Signature-Certificate'] || 'LS0tLS1CRUdJTi...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TPP Registration & eIDAS Certificate Management */}
      {activeSubTab === 'registration' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step 1: Generate or Import eIDAS QSEAL Certificate */}
            <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 font-bold text-xs">
                  STEP 1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Generate eIDAS QSEAL Test Certificate</h3>
                  <p className="text-[11px] text-[#8B949E]">
                    Create a compliant X.509 certificate with PSD2 Qualified Seal extensions.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs text-[#8B949E]">TPP Organization Name:</label>
                  <input
                    type="text"
                    value={genOrgName}
                    onChange={(e) => setGenOrgName(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363D] text-xs text-white rounded-lg p-2.5 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[#8B949E]">Organization ID:</label>
                    <input
                      type="text"
                      value={genOrgId}
                      onChange={(e) => setGenOrgId(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363D] text-xs text-white rounded-lg p-2.5 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8B949E]">Country (EU / EEA):</label>
                    <select
                      value={genCountry}
                      onChange={(e) => setGenCountry(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363D] text-xs text-white rounded-lg p-2.5 focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="AT">Austria (AT) - WU Intl Bank</option>
                      <option value="RO">Romania (RO) - SaltTest Ref</option>
                      <option value="DE">Germany (DE)</option>
                      <option value="FR">France (FR)</option>
                      <option value="IE">Ireland (IE)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#8B949E]">PSD2 Authorized Roles (Affects Scopes):</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: 'AISP', label: 'AISP (Account Info)', scopes: 'account, transactions, kyc' },
                      { role: 'PISP', label: 'PISP (Payments)', scopes: 'payments, funds_avail' },
                      { role: 'PIISP', label: 'PIISP (Card Issuer)', scopes: 'funds_availability' }
                    ].map((r) => (
                      <label
                        key={r.role}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex flex-col justify-between ${
                          genRoles.includes(r.role)
                            ? 'bg-blue-950/40 border-blue-500 text-white'
                            : 'bg-[#0d1117] border-[#30363D] text-[#8B949E]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{r.role}</span>
                          <input
                            type="checkbox"
                            checked={genRoles.includes(r.role)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setGenRoles([...genRoles, r.role]);
                              } else {
                                setGenRoles(genRoles.filter((x) => x !== r.role));
                              }
                            }}
                            className="rounded border-[#30363D] text-blue-500 focus:ring-0"
                          />
                        </div>
                        <span className="text-[10px] text-[#8B949E] mt-1">{r.scopes}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateEidasCert}
                  disabled={certGenLoading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  {certGenLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Generate RSA-2048 eIDAS QSEAL Certificate</span>
                </button>
              </div>

              {certGenResult && (
                <div className="p-3.5 bg-[#0d1117] rounded-xl border border-blue-500/40 text-xs space-y-2">
                  <div className="flex items-center justify-between text-blue-400 font-bold">
                    <span>✓ eIDAS Certificate Ready</span>
                    <span className="text-[10px] font-mono text-[#8B949E]">Serial: {certGenResult.serialNumber}</span>
                  </div>
                  <div className="text-[11px] text-[#8B949E]">
                    Issuer DN: <span className="font-mono text-white text-[10px]">{certGenResult.issuerDn}</span>
                  </div>
                  <div className="text-[11px] text-[#8B949E]">
                    Assigned Scopes: <span className="font-mono text-emerald-400 font-bold">{certGenResult.assignedScopes.join(', ')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Register TPP with Western Union PSD2 */}
            <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                  STEP 2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Execute TPP Registration Request</h3>
                  <p className="text-[11px] text-[#8B949E]">
                    Submits signed registration payload to Western Union Provider Sandbox.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs text-[#8B949E]">TPP Application Name:</label>
                  <input
                    type="text"
                    value={tppNameInput}
                    onChange={(e) => setTppNameInput(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363D] text-xs text-white rounded-lg p-2.5 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#8B949E]">OAuth 2.0 Redirect URI:</label>
                  <input
                    type="text"
                    value={tppRedirectUri}
                    onChange={(e) => setTppRedirectUri(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363D] font-mono text-xs text-white rounded-lg p-2.5 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#8B949E]">Select Verified eIDAS Certificate:</label>
                  <select
                    value={selectedCertId}
                    onChange={(e) => setSelectedCertId(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363D] text-xs text-white rounded-lg p-2.5 focus:outline-hidden focus:border-emerald-500"
                  >
                    {configData?.certificates?.map((cert: any) => (
                      <option key={cert.id} value={cert.id}>
                        {cert.tppName} (Serial: {cert.serialNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363D] text-xs text-[#8B949E] space-y-1">
                  <div className="font-semibold text-white">Target Endpoint:</div>
                  <div className="font-mono text-[11px] text-amber-400">POST https://api-sandbox.westernunion.com/psd2/v1/tpp/register</div>
                  <div className="text-[10px] text-[#8B949E]">
                    Headers will include signed Digest, Date, Base64 QSEAL Certificate, and RSA-SHA256 Signature.
                  </div>
                </div>

                <button
                  onClick={handleRegisterTpp}
                  disabled={registerLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#3FB950] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  {registerLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Dispatch TPP Register API Request</span>
                </button>
              </div>

              {registeredTppResult && (
                <div className="p-4 bg-[#0d1117] rounded-xl border border-emerald-500/40 text-xs space-y-3">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      TPP Registered Successfully
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                      ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#8B949E]">Client ID:</span>
                      <div className="font-mono text-white font-bold truncate">{registeredTppResult.tpp?.clientId}</div>
                    </div>
                    <div>
                      <span className="text-[#8B949E]">TPP ID:</span>
                      <div className="font-mono text-purple-300 font-bold truncate">{registeredTppResult.tpp?.tppId}</div>
                    </div>
                  </div>

                  <div className="text-[11px]">
                    <span className="text-[#8B949E]">Assigned Scopes:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {registeredTppResult.assignedScopes?.map((sc: string) => (
                        <span key={sc} className="px-2 py-0.5 rounded font-mono text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {sc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PSD2 Open Banking API Suite (AISP/PISP Runner) */}
      {activeSubTab === 'api-runner' && (
        <div className="space-y-6">
          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Western Union PSD2 Endpoint Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {apiPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1.5 cursor-pointer ${
                    selectedEndpoint === p.endpoint
                      ? 'bg-[#21262d] border-amber-400 text-white shadow-xs ring-1 ring-amber-400'
                      : 'bg-[#161B22] border-[#30363D] hover:border-[#8B949E] text-[#C9D1D9]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{p.name}</span>
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${p.method === 'GET' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {p.method}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B949E] line-clamp-2">
                    {p.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Request / Response Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Request Configuration (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#3FB950]" />
                  Execute PSD2 API Call
                </h3>

                <div className="flex items-center space-x-2">
                  <select
                    value={apiMethod}
                    onChange={(e) => setApiMethod(e.target.value as any)}
                    className="bg-[#0d1117] border border-[#30363D] font-mono font-bold text-xs text-amber-400 rounded-lg p-2.5"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                  <input
                    type="text"
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="flex-1 bg-[#0d1117] border border-[#30363D] font-mono text-xs text-white rounded-lg p-2.5 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                {apiMethod === 'POST' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#8B949E]">JSON Request Body:</label>
                    <textarea
                      value={apiRequestBody}
                      onChange={(e) => setApiRequestBody(e.target.value)}
                      className="w-full h-40 bg-[#0d1117] border border-[#30363D] font-mono text-xs text-white rounded-lg p-2.5 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                )}

                <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363D] text-[11px] text-[#8B949E] space-y-1">
                  <div className="text-white font-medium">Automatic Berlin Group Signature Injection:</div>
                  <div className="text-[10px]">
                    ✓ Generates X-Request-ID GUID<br />
                    ✓ Computes SHA-256 Digest header<br />
                    ✓ Formats GMT Date header<br />
                    ✓ Attaches Base64 QSEAL Certificate & RSA-SHA256 signature
                  </div>
                </div>

                <button
                  onClick={handleRunApi}
                  disabled={apiLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#3FB950] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  {apiLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Send API Request to Western Union</span>
                </button>
              </div>
            </div>

            {/* Right: Response Inspector (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-blue-400" />
                    PSD2 Gateway Response Output
                  </h3>
                  {apiResponse && (
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${apiResponse.status >= 200 && apiResponse.status < 300 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                        HTTP {apiResponse.status} {apiResponse.statusText}
                      </span>
                    </div>
                  )}
                </div>

                {!apiResponse ? (
                  <div className="text-center py-16 text-xs text-[#8B949E] space-y-2">
                    <Globe className="w-8 h-8 text-[#8B949E]/40 mx-auto" />
                    <p>Select a Western Union PSD2 endpoint and click "Send API Request".</p>
                    <p className="text-[11px]">Supports AISP accounts & transactions, PISP SEPA payments, and WU remittances.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Response Headers */}
                    <div className="p-3 bg-[#0d1117] rounded-lg border border-[#30363D] text-[11px] space-y-1 font-mono">
                      <div className="text-[#8B949E] uppercase text-[10px]">Response Headers:</div>
                      {Object.entries(apiResponse.headers || {}).map(([k, v]) => (
                        <div key={k} className="text-[#8B949E]">
                          <span className="text-[#79C0FF]">{k}:</span> <span className="text-white">{String(v)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Response Body */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8B949E]">Response Body JSON:</span>
                        <button
                          onClick={() => handleCopy(JSON.stringify(apiResponse.data, null, 2), 'resp_json')}
                          className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                        >
                          {copiedKey === 'resp_json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Copy Response</span>
                        </button>
                      </div>
                      <pre className="p-3.5 bg-[#0d1117] rounded-xl border border-[#30363D] font-mono text-xs text-white overflow-x-auto max-h-96 leading-relaxed">
                        {JSON.stringify(apiResponse.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SDK & Code Generator */}
      {activeSubTab === 'code-gen' && (
        <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#30363D]">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                Berlin Group Signature Code Implementations
              </h3>
              <p className="text-[11px] text-[#8B949E]">
                Production-ready implementations in Ruby, Node.js/TypeScript, cURL, Python, and Java.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {(['ruby', 'node', 'curl', 'python', 'java'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCodeLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer uppercase ${
                    codeLanguage === lang
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-[#21262d] text-[#8B949E] hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 bg-[#0d1117] rounded-xl border border-[#30363D] font-mono text-xs text-[#C9D1D9] overflow-x-auto max-h-[500px] leading-relaxed">
              {getCodeSnippet()}
            </pre>
            <button
              onClick={() => handleCopy(getCodeSnippet(), 'code_snip')}
              className="absolute top-3 right-3 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs font-medium text-[#C9D1D9] border border-[#30363D] transition-colors cursor-pointer"
            >
              {copiedKey === 'code_snip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'code_snip' ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default WesternUnionPsd2Console;
