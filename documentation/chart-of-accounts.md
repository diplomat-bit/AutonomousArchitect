# Chart of Accounts Management

Endpoints for creating, updating, and querying Chart of Accounts (COA) entities in QuickBooks Online.

---

## 1. Create Account

### `POST /api/intuit/create-account` or `POST /api/intuit/suite/accounts`

#### Request Body
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Unique name of the account |
| `accountType` | `string` | **Yes** | `Bank`, `Credit Card`, `Other Current Asset`, `Expense`, `Income`, etc. |
| `accountSubType` | `string` | No | Sub-classification (e.g. `Checking`, `Savings`, `CreditCard`) |
| `acctNum` | `string` | No | Display account number or last 4 digits |
| `description` | `string` | No | Ledger account memo |
| `currency` | `string` | No | ISO-4217 Currency (e.g. `"USD"`) |
| `openingBalance` | `number` | No | Initial balance |

```json
{
  "name": "Costco Anywhere Visa-0019",
  "accountType": "Credit Card",
  "accountSubType": "CreditCard",
  "acctNum": "0019",
  "description": "Costco Commercial Card Line",
  "openingBalance": 7689.62
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "Account": {
      "Id": "142",
      "Name": "Costco Anywhere Visa-0019",
      "AccountType": "Credit Card",
      "AccountSubType": "CreditCard",
      "AcctNum": "0019",
      "CurrentBalance": 7689.62,
      "Active": true
    }
  }
}
```

---

## 2. List Accounts

### `GET /api/intuit/suite/accounts`

#### Response (`200 OK`)
```json
{
  "Account": [
    {
      "Id": "142",
      "Name": "Costco Anywhere Visa-0019",
      "AccountType": "Credit Card",
      "CurrentBalance": 7689.62
    }
  ],
  "total": 1
}
```
