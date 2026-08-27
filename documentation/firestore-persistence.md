# Firestore Data Persistence & Audit Logs

Endpoints for persisting raw banking records, transformed QuickBooks Online entities, and accessing audit telemetry directly in Google Cloud Firestore.

---

## 1. Persist Banking Payload to Firestore

### `POST /api/records`

Saves any raw or transformed financial record into the Firestore `stored_records` collection.

#### Request Body
```json
{
  "accountGroup": "CREDITCARD",
  "entityType": "Account",
  "payload": {
    "productName": "Costco Anywhere Visa® Card By Citi",
    "displayAccountNumber": "XXXXXXXXXXXX0019",
    "currentBalance": 7689.62,
    "creditLimit": 5000
  },
  "provenance": "0009-0009-5132-4316"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "record": {
    "id": "rec_1724459200_a8bc",
    "accountGroup": "CREDITCARD",
    "entityType": "Account",
    "payload": { ... },
    "status": "PERSISTED_IN_FIRESTORE",
    "timestamp": "2026-08-23T22:28:00.000Z",
    "provenance": "0009-0009-5132-4316"
  }
}
```

---

## 2. Retrieve Stored Firestore Records

### `GET /api/records?limit=50`

#### Response (`200 OK`)
```json
{
  "success": true,
  "records": [
    {
      "id": "rec_1724459200_a8bc",
      "accountGroup": "CREDITCARD",
      "entityType": "Account",
      "status": "PERSISTED_IN_FIRESTORE",
      "timestamp": "2026-08-23T22:28:00.000Z"
    }
  ],
  "totalCount": 1
}
```

---

## 3. Retrieve Live API Logs

### `GET /api/logs?limit=100`

#### Response (`200 OK`)
```json
{
  "success": true,
  "logs": [
    {
      "id": "log_1724459201_99ff",
      "timestamp": "2026-08-23T22:28:01.000Z",
      "apiKeyPrefix": "sk_live_9f83...",
      "userEmail": "developer@company.com",
      "endpoint": "/api/records",
      "method": "POST",
      "statusCode": 201,
      "durationMs": 14,
      "clientIp": "127.0.0.1"
    }
  ],
  "totalCount": 1,
  "activeKeysCount": 2
}
```
