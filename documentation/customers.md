# Customers Ledger Operations

Endpoints for provisioning and querying Customer entities in QuickBooks Online.

---

## 1. Create Customer

### `POST /api/intuit/create-customer` or `POST /api/intuit/suite/customers`

#### Request Body
```json
{
  "displayName": "Acme Innovations LLC",
  "companyName": "Acme Innovations",
  "givenName": "Alice",
  "familyName": "Smith",
  "primaryEmailAddr": "alice@acme.com",
  "primaryPhone": "555-0199",
  "billAddr": {
    "line1": "100 Innovation Way",
    "city": "San Francisco",
    "countrySubDivisionCode": "CA",
    "postalCode": "94105"
  }
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "Customer": {
      "Id": "58",
      "DisplayName": "Acme Innovations LLC",
      "CompanyName": "Acme Innovations",
      "PrimaryEmailAddr": { "Address": "alice@acme.com" },
      "Active": true
    }
  }
}
```

---

## 2. List Customers

### `GET /api/intuit/suite/customers`

#### Response (`200 OK`)
```json
{
  "Customer": [
    {
      "Id": "58",
      "DisplayName": "Acme Innovations LLC",
      "CompanyName": "Acme Innovations"
    }
  ],
  "total": 1
}
```
