import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck, Key, Globe, CheckCircle2, Lock } from 'lucide-react';

export const ScopeReference: React.FC = () => {
  const scopesList = [
    {
      scope: 'com.intuit.quickbooks.accounting',
      name: 'QuickBooks Online Accounting API',
      description: 'Provides read and write access to QuickBooks Online accounting entities (CompanyInfo, Customers, Invoices, Accounts, Estimates, Bills, Payments, Reports).',
      access: 'Read / Write',
      category: 'Accounting'
    },
    {
      scope: 'com.intuit.quickbooks.payment',
      name: 'QuickBooks Payments API',
      description: 'Grants access to process credit card/bank charges, manage merchant accounts, tokenize cards, and query transaction history.',
      access: 'Charge / Read',
      category: 'Payments'
    },
    {
      scope: 'openid',
      name: 'OpenID Connect',
      description: 'Enables OpenID Connect authentication flow and returns signed ID Token (JWT) with user identifier (sub).',
      access: 'Authentication',
      category: 'Identity'
    },
    {
      scope: 'profile',
      name: 'User Profile',
      description: 'Returns the user’s first name (given_name) and last name (family_name).',
      access: 'Read Profile',
      category: 'Identity'
    },
    {
      scope: 'email',
      name: 'User Email',
      description: 'Returns the user’s primary verified email address and email_verified boolean claim.',
      access: 'Read Email',
      category: 'Identity'
    },
    {
      scope: 'phone',
      name: 'User Phone',
      description: 'Returns the user’s phone number and phone_number_verified claim.',
      access: 'Read Phone',
      category: 'Identity'
    },
    {
      scope: 'address',
      name: 'User Physical Address',
      description: 'Returns the user’s postal address structure (street_address, locality, region, postal_code, country).',
      access: 'Read Address',
      category: 'Identity'
    }
  ];

  const endpointsList = [
    {
      action: 'Authorization Endpoint',
      method: 'GET',
      url: 'https://appcenter.intuit.com/connect/oauth2',
      description: 'Browser endpoint for user consent, company selection, and authorization code emission.'
    },
    {
      action: 'Token Bearer Endpoint',
      method: 'POST',
      url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      description: 'Server-to-server exchange for authorization_code and refresh_token grants with Basic Auth.'
    },
    {
      action: 'QBO Company Info (Accounting API)',
      method: 'GET',
      url: 'https://sandbox-quickbooks.api.intuit.com/v3/company/{realmId}/companyinfo/{realmId}',
      description: 'Queries legal business name, address, fiscal year start, and company preferences.'
    },
    {
      action: 'Query Accounts (Accounting API)',
      method: 'GET',
      url: 'https://sandbox-quickbooks.api.intuit.com/v3/company/{realmId}/query?query=SELECT * FROM Account',
      description: 'Queries the chart of accounts (Asset, Liability, Equity, Expense, Revenue).'
    },
    {
      action: 'Read an Account (Accounting API)',
      method: 'GET',
      url: 'https://sandbox-quickbooks.api.intuit.com/v3/company/{realmId}/account/{accountId}',
      description: 'Retrieves details of a specific account object in the chart of accounts.'
    },
    {
      action: 'Create an Account (Accounting API)',
      method: 'POST',
      url: 'https://sandbox-quickbooks.api.intuit.com/v3/company/{realmId}/account',
      description: 'Creates a new account object in the chart of accounts with name, type, and subtype.'
    },
    {
      action: 'Full Update / Deactivate Account (Accounting API)',
      method: 'POST',
      url: 'https://sandbox-quickbooks.api.intuit.com/v3/company/{realmId}/account',
      description: 'Updates an existing account or deactivates it by setting Active to false.'
    },
    {
      action: 'OpenID User Info Endpoint',
      method: 'GET',
      url: 'https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo',
      description: 'Returns JSON payload containing claims according to consented identity scopes.'
    },
    {
      action: 'QuickBooks Payments Charges (v4)',
      method: 'POST',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/payments/charges',
      description: 'Creates sandbox credit card or e-commerce charges with idempotency Request-Id header.'
    },
    {
      action: 'Get Charge Details',
      method: 'GET',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/payments/charges/{id}',
      description: 'Retrieves info for an existing charge object.'
    },
    {
      action: 'Capture Charge',
      method: 'POST',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/payments/charges/{id}/capture',
      description: 'Captures and begins processing an authorized charge.'
    },
    {
      action: 'Refund Charge',
      method: 'POST',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/payments/charges/{id}/refunds',
      description: 'Fully or partially refunds an existing charge.'
    },
    {
      action: 'Get Charge Refund Details',
      method: 'GET',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/payments/charges/{id}/refunds/{refund_id}',
      description: 'Retrieves info for a previous full or partial refund object.'
    },
    {
      action: 'Void Charge',
      method: 'POST',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/payments/txn-requests/{charge_request_id}/void',
      description: 'Voids a pending charge using the original charge request ID.'
    },
    {
      action: 'Create Token',
      method: 'POST',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/payments/tokens',
      description: 'Creates opaque container tokens to mask cardholder or bank account info for PCI compliance.'
    },
    {
      action: 'Create Token (IE8/IE9)',
      method: 'POST',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/payments/tokens/ie',
      description: 'Legacy IE browser support endpoint for token creation.'
    },
    {
      action: 'Create ECheck',
      method: 'POST',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks',
      description: 'Creates and stores eCheck objects, debiting the associated bank account.'
    },
    {
      action: 'Get ECheck Details',
      method: 'GET',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks/{echeck_id}',
      description: 'Retrieves info for an existing eCheck transaction.'
    },
    {
      action: 'Refund or Void ECheck',
      method: 'POST',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks/{echeck_id}/refunds',
      description: 'Fully or partially refunds or voids an eCheck transaction.'
    },
    {
      action: 'Get ECheck Refund Details',
      method: 'GET',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/payments/echecks/{echeck_id}/refunds/{refund_id}',
      description: 'Retrieves info about refunded eChecks.'
    },
    {
      action: 'List Bank Accounts',
      method: 'GET',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/customers/{id}/bank-accounts',
      description: 'Retrieves up to 10 stored bank accounts for a customer or QuickBooks Online company.'
    },
    {
      action: 'Get Bank Account Details',
      method: 'GET',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/customers/{id}/bank-accounts/{bankaccount_id}',
      description: 'Retrieves info for a specific bank account object.'
    },
    {
      action: 'Create Bank Account',
      method: 'POST',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/customers/{id}/bank-accounts',
      description: 'Creates and stores new US-based bank account objects with request-Id idempotency.'
    },
    {
      action: 'Create Bank Account From Token',
      method: 'POST',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/customers/{id}/bank-accounts/createFromToken',
      description: 'Uses a system-generated token object to create a new bank account securely.'
    },
    {
      action: 'Delete Bank Account',
      method: 'DELETE',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/customers/{id}/bank-accounts/{bankaccount_id}',
      description: 'Deletes a stored bank account object.'
    },
    {
      action: 'List Cards',
      method: 'GET',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/customers/{id}/cards',
      description: 'Retrieves up to 10 stored credit or debit cards for a customer.'
    },
    {
      action: 'Get Card Details',
      method: 'GET',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/customers/{id}/cards/{card_id}',
      description: 'Retrieves info for a specific credit or debit card object.'
    },
    {
      action: 'Create Card',
      method: 'POST',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/customers/{id}/cards',
      description: 'Creates and stores new credit or debit card objects with request-Id idempotency.'
    },
    {
      action: 'Create Card From Token',
      method: 'POST',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/customers/{id}/cards/createFromToken',
      description: 'Uses a system-generated token to create a credit or debit card object.'
    },
    {
      action: 'Delete Card',
      method: 'DELETE',
      url: 'https://sandbox.api.intuit.com/quickbooks/v4/customers/{id}/cards/{card_id}',
      description: 'Deletes a specified credit or debit card object.'
    },
    {
      action: 'Revoke Token Endpoint',
      method: 'POST',
      url: 'https://developer.api.intuit.com/v2/oauth2/tokens/revoke',
      description: 'Immediately invalidates an access or refresh token upon user logout.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intuit Quick Start Overview */}
      <div className="bg-[#161B22] rounded-xl border border-[#30363D] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Intuit Developer Documentation & Scope Dictionary</h2>
            <p className="text-xs text-[#8B949E] mt-0.5">
              Verified official endpoints and permissions for QuickBooks Online & Payments Sandbox APIs.
            </p>
          </div>

          <a
            href="https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs font-semibold text-white border border-[#30363D] transition-colors"
          >
            <span>Official OAuth 2.0 Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Scopes Table */}
      <div className="bg-[#161B22] rounded-xl border border-[#30363D] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#30363D] bg-[#161B22] flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center space-x-1.5">
            <Lock className="w-4 h-4 text-[#3FB950]" />
            <span>Configured OAuth 2.0 Scopes</span>
          </h3>
          <span className="text-xs text-[#8B949E]">7 scopes requested</span>
        </div>

        <div className="divide-y divide-[#30363D]">
          {scopesList.map((s) => (
            <div key={s.scope} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <code className="text-xs font-mono font-bold text-[#3FB950] bg-[#238636]/15 px-2 py-0.5 rounded border border-[#238636]/30">
                    {s.scope}
                  </code>
                  <span className="text-xs font-medium text-white">{s.name}</span>
                </div>
                <p className="text-xs text-[#8B949E]">{s.description}</p>
              </div>
              <span className="self-start sm:self-center px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#21262d] text-[#C9D1D9] border border-[#30363D] shrink-0">
                {s.access}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Official Endpoints Table */}
      <div className="bg-[#161B22] rounded-xl border border-[#30363D] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#30363D] bg-[#161B22]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center space-x-1.5">
            <Globe className="w-4 h-4 text-[#79C0FF]" />
            <span>Official Sandbox API Endpoint Matrix</span>
          </h3>
        </div>

        <div className="divide-y divide-[#30363D]">
          {endpointsList.map((ep, i) => (
            <div key={i} className="p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{ep.action}</span>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                  ep.method === 'GET' 
                    ? 'bg-[#1f242c] text-[#79C0FF] border-[#30363D]' 
                    : 'bg-[#238636]/15 text-[#3FB950] border-[#238636]/30'
                }`}>
                  {ep.method}
                </span>
              </div>
              <div className="bg-[#010409] p-2.5 rounded font-mono text-xs text-[#79C0FF] border border-[#30363D] select-all break-all">
                {ep.url}
              </div>
              <p className="text-xs text-[#8B949E]">{ep.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
