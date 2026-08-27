# Unstructured File Upload Ingestion

### `POST /api/intuit/universal/file-upload-ingest`

Accepts raw file contents (JSON, CSV, plaintext cURL console dumps, banking exports) and uses Gemini to extract account entities and prepare them for QuickBooks synchronization.

---

## 📥 Request Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fileContent` | `string \| object` | **Yes** | Raw text content of the uploaded file or paste buffer |
| `fileName` | `string` | No | Original file name (e.g., `"citi_statement.txt"`, `"curl_dump.log"`) |
| `fileType` | `string` | No | `"json"`, `"csv"`, or `"txt"`. Default: `"json"` |
| `realmId` | `string` | No | QuickBooks Company ID |
| `accessToken` | `string` | No | QuickBooks Bearer Token |

---

## 📝 Request Example

```json
{
  "fileName": "terminal_dump.txt",
  "fileType": "txt",
  "fileContent": "HTTP/1.1 200 OK\nContent-Type: application/json\n\n[{\"card\": \"Citi Premier\", \"acct\": \"3250\", \"bal\": 2996.57, \"limit\": 1000}]"
}
```

---

## 📤 Response (`200 OK`)

```json
{
  "success": true,
  "fileName": "terminal_dump.txt",
  "inferredEntities": 1,
  "data": [
    {
      "Name": "Citi Premier-3250",
      "AccountType": "Credit Card",
      "AccountSubType": "CreditCard",
      "AcctNum": "3250",
      "Description": "Citi Premier Card Line",
      "CurrentBalance": 2996.57,
      "Classification": "Liability"
    }
  ],
  "status": "PARSED_AND_READY_FOR_QUICKBOOKS"
}
```

---

## 💻 cURL Example
```bash
curl -X POST https://aibanking.dev/api/intuit/universal/file-upload-ingest \
  -H "x-api-key: sk_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "bank_statement.csv",
    "fileType": "csv",
    "fileContent": "Date,Account,Amount,Type\n2026-08-01,Savings-8543,5142.00,Deposit"
  }'
```
