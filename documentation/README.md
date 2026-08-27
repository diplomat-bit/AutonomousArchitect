# aibanking.dev API Integration Documentation

Welcome to the **aibanking.dev & QuickBooks Autonomous Ledger Hub** API documentation. This platform allows external developers, accounting engines, and fintech applications to connect to QuickBooks Online (QBO) V3 APIs, perform AI-powered banking schema transformations, and persist financial payloads directly into Google Cloud Firestore.

---

## 🌐 Base URLs

| Environment | Base URL |
| :--- | :--- |
| **Production / Cloud Run** | `https://aibanking.dev` (or assigned Cloud Run host) |
| **Development** | `http://localhost:3000` |

---

## 🔒 Security & Authentication

All API endpoints can be accessed using an **API Key** generated through your developer portal account.

### Header Authentication
Pass your API key in one of the following request headers:

```http
x-api-key: sk_live_your_api_key_here
```

*or*

```http
Authorization: Bearer sk_live_your_api_key_here
```

### Query Parameter (Alternative)
```http
https://aibanking.dev/api/intuit/universal/transform-and-ingest?apiKey=sk_live_...
```

---

## 📑 Complete Endpoint Directory

### 1. Security & Developer Accounts
- [Authentication & API Key Management](./authentication-and-api-keys.md)
  - `POST /api/auth/register` — Create developer account & generate first API key
  - `POST /api/auth/login` — Account sign-in & key retrieval
  - `GET /api/keys` — List active API keys
  - `POST /api/keys` — Generate custom service API key
  - `DELETE /api/keys/:id` — Revoke an API key
  - `GET /api/logs` — Real-time request audit logs

### 2. AI Banking & Autonomous Ingestion Engine
- [Universal AI Transform & Ingest](./universal-transform-and-ingest.md)
  - `POST /api/intuit/universal/transform-and-ingest` — Gemini-powered arbitrary banking JSON to QBO mapping
- [File Upload Ingestion](./universal-file-upload-ingest.md)
  - `POST /api/intuit/universal/file-upload-ingest` — Unstructured cURL/text/CSV/JSON file parsing & ingestion

### 3. QuickBooks Online (QBO) OAuth 2.0 Flow
- [OAuth Authorization Code Flow](./oauth-authorization-code.md)
  - `GET /api/intuit/auth-url` — Generate PKCE authorization URL with custom scopes
  - `GET /api/intuit/callback` — OAuth 2.0 authorization code exchange
  - `POST /api/intuit/tokens` — Exchange authorization code for Bearer & Refresh tokens
  - `GET /api/intuit/session-tokens` — Inspect active in-memory session tokens
  - `POST /api/intuit/clear-session` — Clear session token cache
- [OAuth Refresh Token Rotation](./oauth-refresh-token.md)
  - `POST /api/intuit/refresh-token` — Renew expired access tokens

### 4. Accounting & Ledger APIs
- [SQL-like Query Engine](./quickbooks-query.md)
  - `POST /api/intuit/query` — Execute SQL-like queries against QBO entities
- [Chart of Accounts](./chart-of-accounts.md)
  - `POST /api/intuit/create-account` — Create single ledger account
  - `GET /api/intuit/suite/accounts` — List active accounts
  - `POST /api/intuit/suite/accounts` — Fast create ledger account
- [Bank Accounts & ACH Sync](./bank-accounts-ach.md)
  - `GET /api/intuit/bank-accounts` — List bank and depository accounts
  - `POST /api/intuit/sync-bank-account` — One-click bank account provisioner
- [Batch Account Sync](./batch-accounts-sync.md)
  - `POST /api/intuit/batch-accounts` — Batch provision multiple banking/liability accounts
- [Customers Ledger](./customers.md)
  - `POST /api/intuit/create-customer` — Create customer profile
  - `GET /api/intuit/suite/customers` — List customers
  - `POST /api/intuit/suite/customers` — Fast customer creation
- [Invoices & Billing](./invoices.md)
  - `POST /api/intuit/create-invoice` — Generate multi-line item invoice
  - `GET /api/intuit/suite/invoices` — List invoices
  - `POST /api/intuit/suite/invoices` — Fast invoice generator
- [Payments & Settlement](./payments.md)
  - `GET /api/intuit/suite/payments` — List payment records
  - `POST /api/intuit/suite/payments` — Settle and log payments
- [OpenID Connect User Profile](./user-info.md)
  - `GET /api/intuit/user-info` — Fetch Intuit OpenID user profile
- [Headless cURL Proxy Runner](./curl-runner-proxy.md)
  - `POST /api/intuit/suite/curl-runner` — Universal REST proxy dispatcher

### 5. Firestore Persistence & Auditing
- [Firestore Data Records & Logs](./firestore-persistence.md)
  - `GET /api/records` — Fetch stored financial records
  - `POST /api/records` — Persist raw/transformed banking entities to Firestore
  - `GET /api/logs` — Live telemetry and latency stats

---

## ⚡ Error Handling & Status Codes

All endpoints return uniform error responses formatted as JSON:

```json
{
  "success": false,
  "error": "Detailed reason for failure",
  "durationMs": 42
}
```

| HTTP Status | Meaning |
| :--- | :--- |
| `200 OK` | Request completed successfully |
| `201 Created` | Entity or resource successfully provisioned |
| `400 Bad Request` | Missing required parameters or invalid JSON syntax |
| `401 Unauthorized` | Missing or invalid API key / expired OAuth access token |
| `403 Forbidden` | Revoked API key or insufficient scope |
| `500 Server Error` | Upstream Intuit or AI processing failure |
