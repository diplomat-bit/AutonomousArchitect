# QuickBooks SQL-like Query Engine

### `POST /api/intuit/query`

Executes arbitrary SQL-like queries against Intuit QuickBooks Online V3 entities (e.g., `Account`, `Customer`, `Invoice`, `Payment`, `Item`, `Vendor`, `Employee`).

---

## 🔒 Authentication
- Header: `x-api-key: sk_live_...`

---

## 📥 Request Body

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `query` | `string` | **Yes** | QuickBooks SQL query (e.g., `"SELECT * FROM Account MAXRESULTS 20"`) |
| `realmId` | `string` | No | Target QuickBooks Company ID (uses active session if omitted) |
| `accessToken` | `string` | No | Bearer access token (uses active session if omitted) |
| `minorversion` | `string` | No | QBO API minor version (Default: `"73"`) |

```json
{
  "query": "SELECT * FROM Account WHERE AccountType = 'Bank' MAXRESULTS 10",
  "realmId": "9341452093841029"
}
```

---

## 📤 Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "QueryResponse": {
      "Account": [
        {
          "Id": "33",
          "Name": "Operating Checking 1010",
          "AccountType": "Bank",
          "AccountSubType": "Checking",
          "CurrentBalance": 24890.50,
          "Active": true
        }
      ],
      "startPosition": 1,
      "maxResults": 10,
      "totalCount": 1
    },
    "time": "2026-08-23T22:25:00.000Z"
  }
}
```

---

## 💻 cURL Example
```bash
curl -X POST https://aibanking.dev/api/intuit/query \
  -H "x-api-key: sk_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM Invoice ORDERBY MetaData.CreateTime DESC MAXRESULTS 5"
  }'
```
