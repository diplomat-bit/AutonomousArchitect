# OAuth 2.0 Refresh Token Rotation

### `POST /api/intuit/refresh-token`

Refreshes an expired QuickBooks Online Access Token without requiring user re-authentication.

---

## 🔒 Authentication
- Header: `x-api-key: sk_live_...`

---

## 📥 Request Body

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `refreshToken` | `string` | No | If omitted, uses active cached server token |
| `clientId` | `string` | No | Intuit Client ID override |
| `clientSecret` | `string` | No | Intuit Client Secret override |

```json
{
  "refreshToken": "AB1169385019284109283401928"
}
```

---

## 📤 Response (`200 OK`)

```json
{
  "success": true,
  "access_token": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0...",
  "refresh_token": "AB1169386000000000000000000",
  "token_type": "bearer",
  "expires_in": 3600,
  "x_refresh_token_expires_in": 8726400,
  "realmId": "9341452093841029"
}
```

---

## 💻 cURL Example
```bash
curl -X POST https://aibanking.dev/api/intuit/refresh-token \
  -H "x-api-key: sk_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "AB1169385019284109283401928"}'
```
