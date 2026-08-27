# Invoices & Billing Operations

Endpoints for generating and querying Multi-Line Invoices in QuickBooks Online.

---

## 1. Create Invoice

### `POST /api/intuit/create-invoice` or `POST /api/intuit/suite/invoices`

#### Request Body
```json
{
  "customerRef": { "value": "58", "name": "Acme Innovations LLC" },
  "txnDate": "2026-08-23",
  "dueDate": "2026-09-23",
  "lineItems": [
    {
      "description": "Enterprise AI Ledger Architecture Implementation",
      "amount": 4500.00,
      "quantity": 1,
      "unitPrice": 4500.00
    },
    {
      "description": "Cloud Firestore Persistence Provisioning",
      "amount": 750.00,
      "quantity": 1,
      "unitPrice": 750.00
    }
  ],
  "customerMemo": "Thank you for partnering with aibanking.dev"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "Invoice": {
      "Id": "194",
      "DocNumber": "DOC-8491",
      "TxnDate": "2026-08-23",
      "TotalAmt": 5250.00,
      "Balance": 5250.00,
      "CustomerRef": { "value": "58", "name": "Acme Innovations LLC" }
    }
  }
}
```

---

## 2. List Invoices

### `GET /api/intuit/suite/invoices`

#### Response (`200 OK`)
```json
{
  "Invoice": [
    {
      "Id": "194",
      "DocNumber": "DOC-8491",
      "TotalAmt": 5250.00,
      "Balance": 5250.00
    }
  ],
  "total": 1
}
```
