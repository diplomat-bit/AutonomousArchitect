# Bank Accounts & ACH Sync

Endpoints for discovering and provisioning bank, checking, and depository accounts in QuickBooks Online.

---

## 1. List Depository Accounts

### `GET /api/intuit/bank-accounts`

Queries all accounts where `AccountType = 'Bank'` from the company chart of accounts.

#### Response (`200 OK`)
```json
{
  "success": true,
  "accounts": [
    {
      "Id": "33",
      "Name": "Citi Platinum Savings-8543",
      "AccountType": "Bank",
      "AccountSubType": "Savings",
      "CurrentBalance": 5142.00,
      "AcctNum": "8543"
    }
  ],
  "count": 1
}
```

---

## 2. Sync / Create Single Bank Account

### `POST /api/intuit/sync-bank-account`

#### Request Body
```json
{
  "name": "Chase Primary Checking-1010",
  "accountSubType": "Checking",
  "accountNumber": "1010",
  "description": "Primary Operating Ledger",
  "openingBalance": 15000.00
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Bank account synchronized successfully",
  "data": {
    "Account": {
      "Id": "143",
      "Name": "Chase Primary Checking-1010",
      "AccountType": "Bank",
      "AccountSubType": "Checking",
      "CurrentBalance": 15000.00
    }
  }
}
```
