import { Router, Request, Response } from 'express';
import { getFinicityEnvConfig } from './finicity-api.js';

export const envManagerRouter = Router();

export interface EnvVariableItem {
  key: string;
  category: 'google' | 'gemini' | 'finicity' | 'chase' | 'intuit' | 'moderntreasury' | 'paypal' | 'westernunion' | 'security';
  categoryLabel: string;
  description: string;
  value: string;
  isSecret: boolean;
  isSet: boolean;
  maskedValue: string;
  defaultValue?: string;
}

export function maskSecret(val: string): string {
  if (!val) return '';
  if (val.length <= 8) return '••••••••';
  return `${val.slice(0, 4)}••••••••${val.slice(-4)}`;
}

export function getAllEnvironmentVariables(): EnvVariableItem[] {
  return [
    // 1. Google Cloud Service Account & IAM
    {
      key: 'GOOGLE_PROJECT_ID',
      category: 'google',
      categoryLabel: 'Google Cloud & IAM',
      description: 'GCP Project ID for service principal and IAM token minting',
      value: process.env.GOOGLE_PROJECT_ID || 'aistudio-quickbooksoauth2-43d92844',
      isSecret: false,
      isSet: Boolean(process.env.GOOGLE_PROJECT_ID),
      maskedValue: process.env.GOOGLE_PROJECT_ID || 'aistudio-quickbooksoauth2-43d92844',
      defaultValue: 'aistudio-quickbooksoauth2-43d92844',
    },
    {
      key: 'GOOGLE_CLIENT_EMAIL',
      category: 'google',
      categoryLabel: 'Google Cloud & IAM',
      description: 'Service Account client email address',
      value: process.env.GOOGLE_CLIENT_EMAIL || 'service-principal@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com',
      isSecret: false,
      isSet: Boolean(process.env.GOOGLE_CLIENT_EMAIL),
      maskedValue: process.env.GOOGLE_CLIENT_EMAIL || 'service-principal@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com',
      defaultValue: 'service-principal@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com',
    },
    {
      key: 'GOOGLE_PRIVATE_KEY',
      category: 'google',
      categoryLabel: 'Google Cloud & IAM',
      description: 'RSA 2048-bit Private Key for OAuth JWT signing and token generation',
      value: process.env.GOOGLE_PRIVATE_KEY || '',
      isSecret: true,
      isSet: Boolean(process.env.GOOGLE_PRIVATE_KEY),
      maskedValue: maskSecret(process.env.GOOGLE_PRIVATE_KEY || ''),
    },
    {
      key: 'GOOGLE_HMAC_SERVICE_ACCOUNT',
      category: 'google',
      categoryLabel: 'Google Cloud & IAM',
      description: 'Service Account owning Cloud Storage HMAC keys',
      value: process.env.GOOGLE_HMAC_SERVICE_ACCOUNT || 'service-principal@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com',
      isSecret: false,
      isSet: Boolean(process.env.GOOGLE_HMAC_SERVICE_ACCOUNT),
      maskedValue: process.env.GOOGLE_HMAC_SERVICE_ACCOUNT || 'service-principal@aistudio-quickbooksoauth2-43d92844.iam.gserviceaccount.com',
    },
    {
      key: 'GOOGLE_HMAC_ACCESS_ID',
      category: 'google',
      categoryLabel: 'Google Cloud & IAM',
      description: 'HMAC Access ID (starts with GOOG1E...) for AWS S3 compatibility',
      value: process.env.GOOGLE_HMAC_ACCESS_ID || 'GOOG1E738194720491823901',
      isSecret: false,
      isSet: Boolean(process.env.GOOGLE_HMAC_ACCESS_ID),
      maskedValue: process.env.GOOGLE_HMAC_ACCESS_ID || 'GOOG1E738194720491823901',
      defaultValue: 'GOOG1E738194720491823901',
    },
    {
      key: 'GOOGLE_HMAC_SECRET',
      category: 'google',
      categoryLabel: 'Google Cloud & IAM',
      description: 'Base64 HMAC Secret Key for cryptographic request signing',
      value: process.env.GOOGLE_HMAC_SECRET || '',
      isSecret: true,
      isSet: Boolean(process.env.GOOGLE_HMAC_SECRET),
      maskedValue: maskSecret(process.env.GOOGLE_HMAC_SECRET || ''),
    },

    // 2. Google Gemini AI
    {
      key: 'GEMINI_API_KEY',
      category: 'gemini',
      categoryLabel: 'Google Gemini AI',
      description: 'Google AI Studio Gemini API Key for server-side ledger mapping & NLP ingest',
      value: process.env.GEMINI_API_KEY || '',
      isSecret: true,
      isSet: Boolean(process.env.GEMINI_API_KEY),
      maskedValue: maskSecret(process.env.GEMINI_API_KEY || ''),
    },

    // 3. Mastercard Open Finance / Finicity
    {
      key: 'FINICITY_API_BASE_URL',
      category: 'finicity',
      categoryLabel: 'Mastercard Open Finance (Finicity)',
      description: 'Mastercard Finicity API Host URL',
      value: process.env.FINICITY_API_BASE_URL || 'https://api.finicity.com',
      isSecret: false,
      isSet: Boolean(process.env.FINICITY_API_BASE_URL),
      maskedValue: process.env.FINICITY_API_BASE_URL || 'https://api.finicity.com',
      defaultValue: 'https://api.finicity.com',
    },
    {
      key: 'FINICITY_APP_KEY',
      category: 'finicity',
      categoryLabel: 'Mastercard Open Finance (Finicity)',
      description: 'Mastercard Finicity Application Key (Header: Finicity-App-Key)',
      value: process.env.FINICITY_APP_KEY || '2423653942467',
      isSecret: false,
      isSet: Boolean(process.env.FINICITY_APP_KEY),
      maskedValue: process.env.FINICITY_APP_KEY || '2423653942467',
      defaultValue: '2423653942467',
    },
    {
      key: 'FINICITY_PARTNER_ID',
      category: 'finicity',
      categoryLabel: 'Mastercard Open Finance (Finicity)',
      description: 'Mastercard Finicity Partner ID for Step 1 Authentication',
      value: process.env.FINICITY_PARTNER_ID || '2423653942467',
      isSecret: false,
      isSet: Boolean(process.env.FINICITY_PARTNER_ID),
      maskedValue: process.env.FINICITY_PARTNER_ID || '2423653942467',
      defaultValue: '2423653942467',
    },
    {
      key: 'FINICITY_PARTNER_SECRET',
      category: 'finicity',
      categoryLabel: 'Mastercard Open Finance (Finicity)',
      description: 'Mastercard Finicity Partner Secret credential',
      value: process.env.FINICITY_PARTNER_SECRET || '',
      isSecret: true,
      isSet: Boolean(process.env.FINICITY_PARTNER_SECRET),
      maskedValue: maskSecret(process.env.FINICITY_PARTNER_SECRET || ''),
    },
    {
      key: 'FINICITY_APP_TOKEN',
      category: 'finicity',
      categoryLabel: 'Mastercard Open Finance (Finicity)',
      description: 'Live 2-hour Finicity App Token (Header: Finicity-App-Token)',
      value: process.env.FINICITY_APP_TOKEN || '',
      isSecret: true,
      isSet: Boolean(process.env.FINICITY_APP_TOKEN),
      maskedValue: maskSecret(process.env.FINICITY_APP_TOKEN || ''),
    },
    {
      key: 'FINICITY_CUSTOMER_ID',
      category: 'finicity',
      categoryLabel: 'Mastercard Open Finance (Finicity)',
      description: 'Active testing customer ID for account aggregation',
      value: process.env.FINICITY_CUSTOMER_ID || '1005061234',
      isSecret: false,
      isSet: Boolean(process.env.FINICITY_CUSTOMER_ID),
      maskedValue: process.env.FINICITY_CUSTOMER_ID || '1005061234',
      defaultValue: '1005061234',
    },
    {
      key: 'FINICITY_CUSTOMER_USERNAME',
      category: 'finicity',
      categoryLabel: 'Mastercard Open Finance (Finicity)',
      description: 'Test customer profile username',
      value: process.env.FINICITY_CUSTOMER_USERNAME || 'customerusername1',
      isSecret: false,
      isSet: Boolean(process.env.FINICITY_CUSTOMER_USERNAME),
      maskedValue: process.env.FINICITY_CUSTOMER_USERNAME || 'customerusername1',
      defaultValue: 'customerusername1',
    },
    {
      key: 'FINICITY_ENVIRONMENT',
      category: 'finicity',
      categoryLabel: 'Mastercard Open Finance (Finicity)',
      description: 'Finicity Target Environment (sandbox / production)',
      value: process.env.FINICITY_ENVIRONMENT || 'sandbox',
      isSecret: false,
      isSet: Boolean(process.env.FINICITY_ENVIRONMENT),
      maskedValue: process.env.FINICITY_ENVIRONMENT || 'sandbox',
      defaultValue: 'sandbox',
    },

    // 4. Chase Open Banking & Loyalty
    {
      key: 'CHASE_API_BASE_URL',
      category: 'chase',
      categoryLabel: 'Chase Open Banking & Loyalty',
      description: 'Chase API Demo and Mock endpoint base',
      value: process.env.CHASE_API_BASE_URL || 'https://apidemo.chase.com',
      isSecret: false,
      isSet: Boolean(process.env.CHASE_API_BASE_URL),
      maskedValue: process.env.CHASE_API_BASE_URL || 'https://apidemo.chase.com',
      defaultValue: 'https://apidemo.chase.com',
    },
    {
      key: 'CHASE_DEVELOPER_BASE_URL',
      category: 'chase',
      categoryLabel: 'Chase Open Banking & Loyalty',
      description: 'Chase Developer Portal origin',
      value: process.env.CHASE_DEVELOPER_BASE_URL || 'https://developer.chase.com',
      isSecret: false,
      isSet: Boolean(process.env.CHASE_DEVELOPER_BASE_URL),
      maskedValue: process.env.CHASE_DEVELOPER_BASE_URL || 'https://developer.chase.com',
      defaultValue: 'https://developer.chase.com',
    },
    {
      key: 'CHASE_PLAYGROUND_ID_TOKEN',
      category: 'chase',
      categoryLabel: 'Chase Open Banking & Loyalty',
      description: 'Raw Chase Developer Playground Token for proxy verification',
      value: process.env.CHASE_PLAYGROUND_ID_TOKEN || '',
      isSecret: true,
      isSet: Boolean(process.env.CHASE_PLAYGROUND_ID_TOKEN),
      maskedValue: maskSecret(process.env.CHASE_PLAYGROUND_ID_TOKEN || ''),
    },
    {
      key: 'CHASE_AUTHORIZATION',
      category: 'chase',
      categoryLabel: 'Chase Open Banking & Loyalty',
      description: 'Primary Chase Authorization Bearer Token',
      value: process.env.CHASE_AUTHORIZATION || 'EB3ik8VN9sAV2YjUnZv5UUcAUzFg',
      isSecret: true,
      isSet: Boolean(process.env.CHASE_AUTHORIZATION),
      maskedValue: maskSecret(process.env.CHASE_AUTHORIZATION || 'EB3ik8VN9sAV2YjUnZv5UUcAUzFg'),
    },
    {
      key: 'CHASE_AUTHORIZATION2',
      category: 'chase',
      categoryLabel: 'Chase Open Banking & Loyalty',
      description: 'Chase Pay With Points RS256 JWT Authorization Token',
      value: process.env.CHASE_AUTHORIZATION2 || '',
      isSecret: true,
      isSet: Boolean(process.env.CHASE_AUTHORIZATION2),
      maskedValue: maskSecret(process.env.CHASE_AUTHORIZATION2 || ''),
    },
    {
      key: 'CHASE_TRACE_ID',
      category: 'chase',
      categoryLabel: 'Chase Open Banking & Loyalty',
      description: 'Trace-Id header for distributed transaction tracing',
      value: process.env.CHASE_TRACE_ID || '562952952929829',
      isSecret: false,
      isSet: Boolean(process.env.CHASE_TRACE_ID),
      maskedValue: process.env.CHASE_TRACE_ID || '562952952929829',
      defaultValue: '562952952929829',
    },
    {
      key: 'CHASE_ACCOUNT_REF_UUID',
      category: 'chase',
      categoryLabel: 'Chase Open Banking & Loyalty',
      description: 'Chase Account Reference UUID',
      value: process.env.CHASE_ACCOUNT_REF_UUID || 'd383fd33-7be1-4ff8-88b7-f2adca419296',
      isSecret: false,
      isSet: Boolean(process.env.CHASE_ACCOUNT_REF_UUID),
      maskedValue: process.env.CHASE_ACCOUNT_REF_UUID || 'd383fd33-7be1-4ff8-88b7-f2adca419296',
    },
    {
      key: 'CHASE_CLIENT_ID',
      category: 'chase',
      categoryLabel: 'Chase Open Banking & Loyalty',
      description: 'Chase App Client ID (e.g. SUNSHINE_WALLET)',
      value: process.env.CHASE_CLIENT_ID || 'SUNSHINE_WALLET',
      isSecret: false,
      isSet: Boolean(process.env.CHASE_CLIENT_ID),
      maskedValue: process.env.CHASE_CLIENT_ID || 'SUNSHINE_WALLET',
    },

    // 5. Intuit QuickBooks API
    {
      key: 'INTUIT_CLIENT_ID',
      category: 'intuit',
      categoryLabel: 'QuickBooks Online OAuth 2.0',
      description: 'Intuit Developer App Client ID',
      value: process.env.INTUIT_CLIENT_ID || 'ABySM9kH7sQ0wfw8Mb3SB30DqWCRQNG6cDQMQVf5gSMvugU5n8',
      isSecret: false,
      isSet: Boolean(process.env.INTUIT_CLIENT_ID),
      maskedValue: process.env.INTUIT_CLIENT_ID || 'ABySM9kH7sQ0wfw8Mb3SB30DqWCRQNG6cDQMQVf5gSMvugU5n8',
      defaultValue: 'ABySM9kH7sQ0wfw8Mb3SB30DqWCRQNG6cDQMQVf5gSMvugU5n8',
    },
    {
      key: 'INTUIT_CLIENT_SECRET',
      category: 'intuit',
      categoryLabel: 'QuickBooks Online OAuth 2.0',
      description: 'Intuit Developer App Client Secret',
      value: process.env.INTUIT_CLIENT_SECRET || '',
      isSecret: true,
      isSet: Boolean(process.env.INTUIT_CLIENT_SECRET),
      maskedValue: maskSecret(process.env.INTUIT_CLIENT_SECRET || ''),
    },
    {
      key: 'INTUIT_REDIRECT_URI',
      category: 'intuit',
      categoryLabel: 'QuickBooks Online OAuth 2.0',
      description: 'OAuth 2.0 Authorized Redirect URI',
      value: process.env.INTUIT_REDIRECT_URI || 'https://developer.intuit.com/app/developer/quickstart',
      isSecret: false,
      isSet: Boolean(process.env.INTUIT_REDIRECT_URI),
      maskedValue: process.env.INTUIT_REDIRECT_URI || 'https://developer.intuit.com/app/developer/quickstart',
      defaultValue: 'https://developer.intuit.com/app/developer/quickstart',
    },
    {
      key: 'INTUIT_ENVIRONMENT',
      category: 'intuit',
      categoryLabel: 'QuickBooks Online OAuth 2.0',
      description: 'Target QuickBooks environment (sandbox / production)',
      value: process.env.INTUIT_ENVIRONMENT || 'sandbox',
      isSecret: false,
      isSet: Boolean(process.env.INTUIT_ENVIRONMENT),
      maskedValue: process.env.INTUIT_ENVIRONMENT || 'sandbox',
      defaultValue: 'sandbox',
    },

    // 6. Modern Treasury Open Banking & Ledger
    {
      key: 'MODERN_TREASURY_ORGANIZATION_ID',
      category: 'moderntreasury',
      categoryLabel: 'Modern Treasury Ledgers & Banking',
      description: 'Modern Treasury Organization Identifier for Basic Auth',
      value: process.env.MODERN_TREASURY_ORGANIZATION_ID || '',
      isSecret: false,
      isSet: Boolean(process.env.MODERN_TREASURY_ORGANIZATION_ID),
      maskedValue: process.env.MODERN_TREASURY_ORGANIZATION_ID || 'Not Set',
    },
    {
      key: 'MODERN_TREASURY_API_KEY',
      category: 'moderntreasury',
      categoryLabel: 'Modern Treasury Ledgers & Banking',
      description: 'Modern Treasury Secret API Key for programmatic REST access',
      value: process.env.MODERN_TREASURY_API_KEY || '',
      isSecret: true,
      isSet: Boolean(process.env.MODERN_TREASURY_API_KEY),
      maskedValue: maskSecret(process.env.MODERN_TREASURY_API_KEY || ''),
    },
    {
      key: 'MODERN_TREASURY_AUTHORIZATION',
      category: 'moderntreasury',
      categoryLabel: 'Modern Treasury Ledgers & Banking',
      description: 'Explicit Basic Authorization header (Basic <base64>)',
      value: process.env.MODERN_TREASURY_AUTHORIZATION || '',
      isSecret: true,
      isSet: Boolean(process.env.MODERN_TREASURY_AUTHORIZATION),
      maskedValue: maskSecret(process.env.MODERN_TREASURY_AUTHORIZATION || ''),
    },
    {
      key: 'MODERN_TREASURY_BASE_URL',
      category: 'moderntreasury',
      categoryLabel: 'Modern Treasury Ledgers & Banking',
      description: 'Modern Treasury API Base Endpoint',
      value: process.env.MODERN_TREASURY_BASE_URL || 'https://app.moderntreasury.com',
      isSecret: false,
      isSet: Boolean(process.env.MODERN_TREASURY_BASE_URL),
      maskedValue: process.env.MODERN_TREASURY_BASE_URL || 'https://app.moderntreasury.com',
      defaultValue: 'https://app.moderntreasury.com',
    },

    // 7. PayPal Sandbox & Pay Later JS SDK v6
    {
      key: 'PAYPAL_CLIENT_ID',
      category: 'paypal',
      categoryLabel: 'PayPal Sandbox & Checkout v2',
      description: 'PayPal Developer Client ID',
      value: process.env.PAYPAL_CLIENT_ID || 'AebUugfXLhryBxMBCyjWa...',
      isSecret: false,
      isSet: Boolean(process.env.PAYPAL_CLIENT_ID),
      maskedValue: process.env.PAYPAL_CLIENT_ID || 'AebUugfXLhryBxMBCyjWa...',
      defaultValue: 'AebUugfXLhryBxMBCyjWa...',
    },
    {
      key: 'PAYPAL_CLIENT_SECRET',
      category: 'paypal',
      categoryLabel: 'PayPal Sandbox & Checkout v2',
      description: 'PayPal Developer Client Secret',
      value: process.env.PAYPAL_CLIENT_SECRET || '',
      isSecret: true,
      isSet: Boolean(process.env.PAYPAL_CLIENT_SECRET),
      maskedValue: maskSecret(process.env.PAYPAL_CLIENT_SECRET || ''),
    },
    {
      key: 'PAYPAL_SANDBOX_EMAIL',
      category: 'paypal',
      categoryLabel: 'PayPal Sandbox & Checkout v2',
      description: 'PayPal Sandbox Business Account Email',
      value: process.env.PAYPAL_SANDBOX_EMAIL || 'sb-4y30a52700589@business.example.com',
      isSecret: false,
      isSet: Boolean(process.env.PAYPAL_SANDBOX_EMAIL),
      maskedValue: process.env.PAYPAL_SANDBOX_EMAIL || 'sb-4y30a52700589@business.example.com',
      defaultValue: 'sb-4y30a52700589@business.example.com',
    },

    // 8. Western Union PSD2 Open Banking & Developer Portal
    {
      key: 'WESTERN_UNION_ENVIRONMENT',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'Western Union Gateway Environment (sandbox / production)',
      value: process.env.WESTERN_UNION_ENVIRONMENT || 'sandbox',
      isSecret: false,
      isSet: Boolean(process.env.WESTERN_UNION_ENVIRONMENT),
      maskedValue: process.env.WESTERN_UNION_ENVIRONMENT || 'sandbox',
      defaultValue: 'sandbox',
    },
    {
      key: 'WESTERN_UNION_BASE_URL',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'Western Union PSD2 Berlin Group Gateway URL',
      value: process.env.WESTERN_UNION_BASE_URL || 'https://api-sandbox.westernunion.com/psd2/v1',
      isSecret: false,
      isSet: Boolean(process.env.WESTERN_UNION_BASE_URL),
      maskedValue: process.env.WESTERN_UNION_BASE_URL || 'https://api-sandbox.westernunion.com/psd2/v1',
      defaultValue: 'https://api-sandbox.westernunion.com/psd2/v1',
    },
    {
      key: 'WESTERN_UNION_DEVELOPER_EMAIL',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'Western Union Developer Portal Account Email',
      value: process.env.WESTERN_UNION_DEVELOPER_EMAIL || 'developer@westernunion.com',
      isSecret: false,
      isSet: Boolean(process.env.WESTERN_UNION_DEVELOPER_EMAIL),
      maskedValue: process.env.WESTERN_UNION_DEVELOPER_EMAIL || 'developer@westernunion.com',
      defaultValue: 'developer@westernunion.com',
    },
    {
      key: 'WESTERN_UNION_DEVELOPER_PASSWORD',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'Western Union Developer Portal Account Password',
      value: process.env.WESTERN_UNION_DEVELOPER_PASSWORD || '',
      isSecret: true,
      isSet: Boolean(process.env.WESTERN_UNION_DEVELOPER_PASSWORD),
      maskedValue: maskSecret(process.env.WESTERN_UNION_DEVELOPER_PASSWORD || ''),
    },
    {
      key: 'WESTERN_UNION_OTP',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'Western Union One-Time Password / 2FA Verification Token (SCA Authentication)',
      value: process.env.WESTERN_UNION_OTP || '',
      isSecret: true,
      isSet: Boolean(process.env.WESTERN_UNION_OTP),
      maskedValue: maskSecret(process.env.WESTERN_UNION_OTP || ''),
    },
    {
      key: 'WESTERN_UNION_TPP_ID',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'Western Union Third Party Provider ID (e.g. TPP-WU-8890-EU)',
      value: process.env.WESTERN_UNION_TPP_ID || 'TPP-WU-8890-EU',
      isSecret: false,
      isSet: Boolean(process.env.WESTERN_UNION_TPP_ID),
      maskedValue: process.env.WESTERN_UNION_TPP_ID || 'TPP-WU-8890-EU',
      defaultValue: 'TPP-WU-8890-EU',
    },
    {
      key: 'WESTERN_UNION_CLIENT_ID',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'Western Union PSD2 OAuth2 Client ID',
      value: process.env.WESTERN_UNION_CLIENT_ID || 'wu_client_3840294820',
      isSecret: false,
      isSet: Boolean(process.env.WESTERN_UNION_CLIENT_ID),
      maskedValue: process.env.WESTERN_UNION_CLIENT_ID || 'wu_client_3840294820',
      defaultValue: 'wu_client_3840294820',
    },
    {
      key: 'WESTERN_UNION_CLIENT_SECRET',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'Western Union PSD2 OAuth2 Client Secret',
      value: process.env.WESTERN_UNION_CLIENT_SECRET || '',
      isSecret: true,
      isSet: Boolean(process.env.WESTERN_UNION_CLIENT_SECRET),
      maskedValue: maskSecret(process.env.WESTERN_UNION_CLIENT_SECRET || ''),
    },
    {
      key: 'WESTERN_UNION_ORGANIZATION_ID',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'eIDAS QSEAL Organization Identifier (e.g. PSDDE-BAFIN-12345678 or TppSaltTest000)',
      value: process.env.WESTERN_UNION_ORGANIZATION_ID || 'PSDDE-BAFIN-12345678',
      isSecret: false,
      isSet: Boolean(process.env.WESTERN_UNION_ORGANIZATION_ID),
      maskedValue: process.env.WESTERN_UNION_ORGANIZATION_ID || 'PSDDE-BAFIN-12345678',
      defaultValue: 'PSDDE-BAFIN-12345678',
    },
    {
      key: 'WESTERN_UNION_ORGANIZATION_NAME',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'eIDAS QSEAL Organization Name (e.g. Western Union FinTech Solutions)',
      value: process.env.WESTERN_UNION_ORGANIZATION_NAME || 'Western Union FinTech Solutions',
      isSecret: false,
      isSet: Boolean(process.env.WESTERN_UNION_ORGANIZATION_NAME),
      maskedValue: process.env.WESTERN_UNION_ORGANIZATION_NAME || 'Western Union FinTech Solutions',
      defaultValue: 'Western Union FinTech Solutions',
    },
    {
      key: 'WESTERN_UNION_COUNTRY',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'eIDAS Country Code (e.g. AT, RO, DE, US)',
      value: process.env.WESTERN_UNION_COUNTRY || 'AT',
      isSecret: false,
      isSet: Boolean(process.env.WESTERN_UNION_COUNTRY),
      maskedValue: process.env.WESTERN_UNION_COUNTRY || 'AT',
      defaultValue: 'AT',
    },
    {
      key: 'WESTERN_UNION_CERTIFICATE_SERIAL',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'X.509 Certificate Serial Number in Decimal format (e.g. 104928502 or 0)',
      value: process.env.WESTERN_UNION_CERTIFICATE_SERIAL || '104928502',
      isSecret: false,
      isSet: Boolean(process.env.WESTERN_UNION_CERTIFICATE_SERIAL),
      maskedValue: process.env.WESTERN_UNION_CERTIFICATE_SERIAL || '104928502',
      defaultValue: '104928502',
    },
    {
      key: 'WESTERN_UNION_ISSUER_DN',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'X.509 Certificate Issuer Distinguished Name',
      value: process.env.WESTERN_UNION_ISSUER_DN || '/organizationIdentifier=PSDDE-BAFIN-12345678/CN=Western Union FinTech Solutions Web CA/O=Western Union/C=AT',
      isSecret: false,
      isSet: Boolean(process.env.WESTERN_UNION_ISSUER_DN),
      maskedValue: process.env.WESTERN_UNION_ISSUER_DN || '/organizationIdentifier=PSDDE-BAFIN-12345678/CN=Western Union FinTech Solutions Web CA/O=Western Union/C=AT',
      defaultValue: '/organizationIdentifier=PSDDE-BAFIN-12345678/CN=Western Union FinTech Solutions Web CA/O=Western Union/C=AT',
    },
    {
      key: 'WESTERN_UNION_EIDAS_CERTIFICATE_PEM',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'eIDAS QSEAL X.509 Certificate PEM content',
      value: process.env.WESTERN_UNION_EIDAS_CERTIFICATE_PEM || '',
      isSecret: true,
      isSet: Boolean(process.env.WESTERN_UNION_EIDAS_CERTIFICATE_PEM),
      maskedValue: maskSecret(process.env.WESTERN_UNION_EIDAS_CERTIFICATE_PEM || ''),
    },
    {
      key: 'WESTERN_UNION_EIDAS_PRIVATE_KEY_PEM',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'eIDAS QSEAL RSA 2048-bit Private Key PEM content',
      value: process.env.WESTERN_UNION_EIDAS_PRIVATE_KEY_PEM || '',
      isSecret: true,
      isSet: Boolean(process.env.WESTERN_UNION_EIDAS_PRIVATE_KEY_PEM),
      maskedValue: maskSecret(process.env.WESTERN_UNION_EIDAS_PRIVATE_KEY_PEM || ''),
    },
    {
      key: 'WESTERN_UNION_REDIRECT_URI',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'Authorized OAuth2 / SCA Redirect URI',
      value: process.env.WESTERN_UNION_REDIRECT_URI || 'https://developer.westernunion.com/oauth2/callback',
      isSecret: false,
      isSet: Boolean(process.env.WESTERN_UNION_REDIRECT_URI),
      maskedValue: process.env.WESTERN_UNION_REDIRECT_URI || 'https://developer.westernunion.com/oauth2/callback',
      defaultValue: 'https://developer.westernunion.com/oauth2/callback',
    },
    {
      key: 'WESTERN_UNION_DEFAULT_IBAN',
      category: 'westernunion',
      categoryLabel: 'Western Union PSD2 & Developer Portal',
      description: 'Default Western Union Settlement IBAN',
      value: process.env.WESTERN_UNION_DEFAULT_IBAN || 'AT488800000001234567890',
      isSecret: false,
      isSet: Boolean(process.env.WESTERN_UNION_DEFAULT_IBAN),
      maskedValue: process.env.WESTERN_UNION_DEFAULT_IBAN || 'AT488800000001234567890',
      defaultValue: 'AT488800000001234567890',
    },

    // 9. Security & Master API Key
    {
      key: 'MASTER_API_KEY',
      category: 'security',
      categoryLabel: 'Security & Microservice Auth',
      description: 'Master server key for autonomous cron jobs and authenticated microservices',
      value: process.env.MASTER_API_KEY || '',
      isSecret: true,
      isSet: Boolean(process.env.MASTER_API_KEY),
      maskedValue: maskSecret(process.env.MASTER_API_KEY || ''),
    },
  ];
}

export function generateFullEnvFile(): string {
  const vars = getAllEnvironmentVariables();
  const categories = [
    { id: 'google', title: '1. Google Cloud Service Account & IAM' },
    { id: 'gemini', title: '2. Google Gemini AI' },
    { id: 'finicity', title: '3. Mastercard Open Finance / Finicity' },
    { id: 'chase', title: '4. Chase Open Banking & Loyalty Rewards' },
    { id: 'intuit', title: '5. Intuit QuickBooks Online OAuth 2.0' },
    { id: 'moderntreasury', title: '6. Modern Treasury Ledgers & Banking' },
    { id: 'paypal', title: '7. PayPal Sandbox & Pay Later JS SDK v6' },
    { id: 'westernunion', title: '8. Western Union PSD2 Open Banking & Developer Portal' },
    { id: 'security', title: '9. Security & Master API Key' },
  ];

  let output = `# ==============================================================================
# Unified Enterprise Multi-Bank Gateway Environment Template (.env)
# Generated: ${new Date().toISOString()}
# NOTE: Secrets and Private Keys are masked to prevent unauthorized credential downloads.
# ==============================================================================

`;

  for (const cat of categories) {
    output += `# ==============================================================================\n`;
    output += `# ${cat.title}\n`;
    output += `# ==============================================================================\n`;

    const catVars = vars.filter(v => v.category === cat.id);
    for (const v of catVars) {
      output += `# ${v.description}\n`;
      const safeVal = v.isSecret ? (v.isSet ? '••••••••' : '') : v.value;
      output += `${v.key}="${safeVal}"\n\n`;
    }
  }

  return output;
}

/**
 * GET /api/env/download
 * Explicitly blocks environment variable file downloads for security compliance
 */
envManagerRouter.get('/download', (req: Request, res: Response) => {
  res.status(403).json({
    success: false,
    error: 'Environment variable downloads are permanently disabled by security policy to prevent credential exfiltration.',
    code: 'DOWNLOAD_RESTRICTED',
  });
});

/**
 * GET /api/env/all
 */
envManagerRouter.get('/all', (req: Request, res: Response) => {
  const rawItems = getAllEnvironmentVariables();
  const rawEnvText = generateFullEnvFile();

  // Sanitize secret values so plain-text credentials are never dumped over the wire
  const items = rawItems.map(item => ({
    ...item,
    value: item.isSecret ? (item.isSet ? '••••••••' : '') : item.value,
  }));

  const totalCount = items.length;
  const setVarsCount = items.filter(i => i.isSet).length;
  const missingVarsCount = totalCount - setVarsCount;

  res.json({
    success: true,
    totalCount,
    setVarsCount,
    missingVarsCount,
    downloadProtected: true,
    items,
    rawEnvText,
  });
});

/**
 * POST /api/env/update
 */
envManagerRouter.post('/update', (req: Request, res: Response) => {
  try {
    const { updates } = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ success: false, error: 'Expected updates object with key/value pairs' });
    }

    // Apply updates to runtime process.env (ignore placeholders like ••••••••)
    for (const [k, v] of Object.entries(updates)) {
      if (typeof v === 'string' && !v.includes('••••••••')) {
        process.env[k] = v.trim();
      }
    }

    const rawItems = getAllEnvironmentVariables();
    const rawEnvText = generateFullEnvFile();

    const items = rawItems.map(item => ({
      ...item,
      value: item.isSecret ? (item.isSet ? '••••••••' : '') : item.value,
    }));

    res.json({
      success: true,
      message: `Updated environment variables successfully!`,
      downloadProtected: true,
      items,
      rawEnvText,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
