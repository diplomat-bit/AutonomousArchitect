# Authentication & API Key Management

Secure your requests to the **aibanking.dev** platform using cryptographic API keys. Every API key request is authenticated, tracked, and stored in Google Cloud Firestore for audit compliance.

---

## 🔑 Key Hierarchy & Structure

- **Format:** `sk_live_<32-hex-characters>` (e.g. `sk_live_9f83a82e71d4b609c217a1b4c7d9e0f2`)
- **Headers Accepted:**
  - `x-api-key: sk_live_...`
  - `Authorization: Bearer sk_live_...`
- **Rate Limit:** 1,000 to 10,000 requests / hour per key.

---

## 1. Register Developer Account & Generate Master Key

### `POST /api/auth/register`

Creates a developer profile in Firestore and automatically returns an active production API key.

#### Request Body
```json
{
  "email": "developer@company.com",
  "name": "Jane Doe"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "user": {
    "id": "usr_1724458921_a8f9",
    "email": "developer@company.com",
    "name": "Jane Doe",
    "createdAt": "2026-08-23T22:25:00.000Z"
  },
  "initialApiKey": {
    "id": "key_1724458921_b12c",
    "key": "sk_live_9f83a82e71d4b609c217a1b4c7d9e0f2",
    "keyPrefix": "sk_live_9f83...e0f2",
    "name": "Production Default Key",
    "userId": "usr_1724458921_a8f9",
    "userEmail": "developer@company.com",
    "status": "active",
    "rateLimit": 1000,
    "totalCalls": 0,
    "createdAt": "2026-08-23T22:25:00.000Z",
    "lastUsedAt": null
  }
}
```

#### cURL Example
```bash
curl -X POST https://aibanking.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "developer@company.com", "name": "Jane Doe"}'
```

---

## 2. Generate Additional Service Keys

### `POST /api/keys`

Generate dedicated keys for individual microservices, staging environments, or CI/CD pipelines.

#### Headers
```http
x-api-key: sk_live_your_master_key
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "Staging Ingestion Microservice",
  "userEmail": "developer@company.com",
  "rateLimit": 5000
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "key": {
    "id": "key_1724458999_x99a",
    "key": "sk_live_4a1bc98ef7123984ca903b123847fedc",
    "keyPrefix": "sk_live_4a1b...fedc",
    "name": "Staging Ingestion Microservice",
    "status": "active",
    "rateLimit": 5000,
    "totalCalls": 0,
    "createdAt": "2026-08-23T22:26:00.000Z"
  },
  "message": "API Key generated successfully. Keep this key confidential."
}
```

---

## 3. List User API Keys

### `GET /api/keys?email=developer@company.com`

#### Response (`200 OK`)
```json
{
  "success": true,
  "keys": [
    {
      "id": "key_1724458921_b12c",
      "keyPrefix": "sk_live_9f83...e0f2",
      "name": "Production Default Key",
      "status": "active",
      "rateLimit": 1000,
      "totalCalls": 48,
      "lastUsedAt": "2026-08-23T22:24:12.000Z"
    }
  ],
  "total": 1
}
```

---

## 4. Revoke an API Key

### `DELETE /api/keys/:id`

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "API Key has been revoked."
}
```

---

## 5. Live Request Audit Logs

### `GET /api/logs?limit=50`

Returns the most recent API call telemetry, execution duration, and IP provenance stored in Firestore.

#### Response (`200 OK`)
```json
{
  "success": true,
  "logs": [
    {
      "id": "log_1724459000_1a2b",
      "timestamp": "2026-08-23T22:27:00.000Z",
      "apiKeyPrefix": "sk_live_9f83...",
      "userEmail": "developer@company.com",
      "endpoint": "/api/intuit/universal/transform-and-ingest",
      "method": "POST",
      "statusCode": 200,
      "durationMs": 84,
      "clientIp": "198.51.100.42",
      "payloadSummary": "rawData, targetEntity"
    }
  ],
  "totalCount": 1,
  "activeKeysCount": 2
}
```
