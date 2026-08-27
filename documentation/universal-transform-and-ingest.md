# Universal AI Transform & Ingest

### `POST /api/intuit/universal/transform-and-ingest`

The core AI-powered ingestion engine. Ingests arbitrary JSON payloads from Citi, Chase, Visa, banking statements, personal loans, savings accounts, or IRAs and uses Gemini to map them into valid QuickBooks Online (QBO) V3 entity structures.

---

## 🔒 Authentication
- Required Header: `x-api-key: sk_live_...` or `Authorization: Bearer sk_live_...`

---

## 📥 Request Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `rawData` | `object \| array` | **Yes** | Arbitrary JSON payload from bank API or scrape |
| `targetEntity` | `string` | No | Target QBO Entity. Options: `"Account"`, `"Invoice"`, `"Customer"`, `"Payment"`. Default: `"Account"` |
| `realmId` | `string` | No | QuickBooks Company Realm ID (if syncing live) |
| `accessToken` | `string` | No | QuickBooks OAuth Bearer Token (if syncing live) |

---

## 📝 Request Example

```json
{
  "rawData": [
    {
      "accountGroup": "CREDITCARD",
      "creditCardAccountsDetails": [
        {
          "productName": "Costco Anywhere Visa® Card By Citi",
          "displayAccountNumber": "XXXXXXXXXXXX0019",
          "currentBalance": 7689.62,
          "creditLimit": 5000
        }
      ]
    },
    {
      "accountGroup": "SAVINGS",
      "savingsAccountsDetails": [
        {
          "productName": "Citi Platinum Savings Account",
          "displayAccountNumber": "XXXXXX8543",
          "currentBalance": 5142.00,
          "interestRate": 0.04
        }
      ]
    }
  ],
  "targetEntity": "Account"
}
```

---

## 📤 Response (`200 OK`)

```json
{
  "success": true,
  "durationMs": 92,
  "targetEntity": "Account",
  "transformedCount": 2,
  "transformedEntities": [
    {
      "Name": "Costco Anywhere Visa® Card By Citi-0019",
      "AccountType": "Credit Card",
      "AccountSubType": "CreditCard",
      "AcctNum": "0019",
      "Description": "Costco Anywhere Visa Card line",
      "CurrentBalance": 7689.62,
      "Classification": "Liability"
    },
    {
      "Name": "Citi Platinum Savings Account-8543",
      "AccountType": "Bank",
      "AccountSubType": "Savings",
      "AcctNum": "8543",
      "Description": "Citi Platinum High Yield Savings",
      "CurrentBalance": 5142.00,
      "Classification": "Asset"
    }
  ],
  "quickbooksResults": [
    {
      "Id": "SOV-814902",
      "SyncToken": "0",
      "MetaData": {
        "CreateTime": "2026-08-23T22:25:30.000Z",
        "Provenance": "0009-0009-5132-4316"
      },
      "Status": "PROVISIONED_VIA_AIBANKING_ENGINE"
    }
  ],
  "sovereignExecutionStamp": {
    "timestamp": "2026-08-23T22:25:30.000Z",
    "orcidKey": "0009-0009-5132-4316",
    "mode": "100% SWAGGER"
  }
}
```

---

## 💻 Code Examples

### cURL
```bash
curl -X POST https://aibanking.dev/api/intuit/universal/transform-and-ingest \
  -H "x-api-key: sk_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "rawData": {
      "productName": "Chase Sapphire Preferred",
      "accountNumber": "4111222233334444",
      "currentBalance": 1240.50
    },
    "targetEntity": "Account"
  }'
```

### TypeScript / Node.js
```typescript
import axios from 'axios';

async function ingestBankingData(bankPayload: any) {
  const response = await axios.post(
    'https://aibanking.dev/api/intuit/universal/transform-and-ingest',
    {
      rawData: bankPayload,
      targetEntity: 'Account'
    },
    {
      headers: {
        'x-api-key': process.env.AIBANKING_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('Transformed QBO Entities:', response.data.transformedEntities);
  return response.data;
}
```
