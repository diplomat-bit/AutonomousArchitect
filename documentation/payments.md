# Payments & Settlement

Endpoints for logging and processing payments in QuickBooks Online.

---

## 1. Execute Payment

### `POST /api/intuit/suite/payments`

#### Request Body
```json
{
  "customerRef": { "value": "58", "name": "Acme Innovations LLC" },
  "totalAmt": 5250.00,
  "paymentMethod": "CreditCard",
  "depositToAccountRef": { "value": "33", "name": "Operating Checking 1010" }
}
```

#### Response (`201 Created`)
```json
{
  "Payment": {
    "Id": "PMT-1724459100",
    "TxnDate": "2026-08-23",
    "TotalAmt": 5250.00,
    "Status": "SETTLED_VIA_SYU"
  }
}
```

---

## 2. List Payments

### `GET /api/intuit/suite/payments`

#### Response (`200 OK`)
```json
{
  "Payment": [
    {
      "Id": "PMT-1724459100",
      "TotalAmt": 5250.00,
      "Status": "SETTLED_VIA_SYU"
    }
  ],
  "total": 1
}
```
