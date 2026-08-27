# Batch Accounts Synchronization

### `POST /api/intuit/batch-accounts`

Batch-creates or updates multiple financial accounts in a single atomic API call, handling error isolation per account.

---

## 🔒 Authentication
- Header: `x-api-key: sk_live_...`

---

## 📥 Request Body

```json
{
  "accounts": [
    {
      "name": "Costco Anywhere Visa-0019",
      "accountType": "Credit Card",
      "accountSubType": "CreditCard",
      "acctNum": "0019",
      "openingBalance": 7689.62
    },
    {
      "name": "Citi Platinum Savings-8543",
      "accountType": "Bank",
      "accountSubType": "Savings",
      "acctNum": "8543",
      "openingBalance": 5142.00
    },
    {
      "name": "Personal Loan-9001",
      "accountType": "Other Current Liability",
      "accountSubType": "NotesPayable",
      "acctNum": "9001",
      "openingBalance": 10250.00
    }
  ]
}
```

---

## 📤 Response (`200 OK`)

```json
{
  "success": true,
  "summary": {
    "total": 3,
    "created": 3,
    "failed": 0
  },
  "results": [
    { "name": "Costco Anywhere Visa-0019", "status": "success", "id": "144" },
    { "name": "Citi Platinum Savings-8543", "status": "success", "id": "145" },
    { "name": "Personal Loan-9001", "status": "success", "id": "146" }
  ]
}
```
