# Headless cURL Proxy Runner

### `POST /api/intuit/suite/curl-runner`

A universal proxy dispatcher that accepts arbitrary HTTP methods, target URLs (such as QuickBooks sandbox endpoints, banking nodes, or custom webhook gateways), headers, and payloads, executes the request server-side, and returns structured responses.

---

## 🔒 Authentication
- Required Header: `x-api-key: sk_live_...`

---

## 📥 Request Body

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `endpoint` | `string` | **Yes** | Full destination URL |
| `method` | `string` | No | `"GET"`, `"POST"`, `"PUT"`, `"DELETE"`. Default: `"GET"` |
| `headers` | `object` | No | Custom headers to pass downstream |
| `body` | `any` | No | Request body object or string |

```json
{
  "endpoint": "https://sandbox-quickbooks.api.intuit.com/v3/company/9341452093841029/companyinfo/9341452093841029?minorversion=73",
  "method": "GET",
  "headers": {
    "Accept": "application/json"
  }
}
```

---

## 📤 Response (`200 OK`)

```json
{
  "success": true,
  "remoteStatus": 200,
  "payload": {
    "CompanyInfo": {
      "CompanyName": "Sandbox Company_US_1",
      "LegalName": "Sandbox Company_US_1 Inc"
    }
  }
}
```

---

## 💻 cURL Example
```bash
curl -X POST https://aibanking.dev/api/intuit/suite/curl-runner \
  -H "x-api-key: sk_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://sandbox-quickbooks.api.intuit.com/v3/company/9341452093841029/query?query=SELECT * FROM Account&minorversion=73",
    "method": "GET"
  }'
```
