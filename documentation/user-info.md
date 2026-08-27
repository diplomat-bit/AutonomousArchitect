# OpenID Connect User Profile

### `GET /api/intuit/user-info`

Fetches verified OpenID Connect profile metadata for the authenticated Intuit accountant or business administrator.

---

## 🔒 Authentication
- Required Header: `x-api-key: sk_live_...` or active OAuth Bearer session

---

## 📤 Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "sub": "9341452093841029",
    "email": "sovereignties3@gmail.com",
    "emailVerified": true,
    "givenName": "Sovereign",
    "familyName": "Architect",
    "phoneNumber": "+15555550123"
  }
}
```

---

## 💻 cURL Example
```bash
curl -X GET https://aibanking.dev/api/intuit/user-info \
  -H "x-api-key: sk_live_your_key"
```
