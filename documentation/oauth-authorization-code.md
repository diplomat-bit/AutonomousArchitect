# QuickBooks OAuth 2.0 Authorization Flow

Endpoints for initiating and completing the 3-legged OAuth 2.0 authorization code flow with Intuit AppCenter.

---

## 1. Generate Authorization URL

### `GET /api/intuit/auth-url`

Builds a cryptographically signed OAuth authorization URL for redirecting users to Intuit's consent screen.

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `clientId` | `string` | No | Override Intuit Client ID (defaults to server config) |
| `redirectUri` | `string` | No | Custom OAuth redirect URI |
| `scopes` | `string` | No | Space-separated OAuth scopes. Default: `com.intuit.quickbooks.accounting openid email profile` |
| `state` | `string` | No | Custom CSRF anti-tamper state token |

#### Response (`200 OK`)
```json
{
  "success": true,
  "authUrl": "https://appcenter.intuit.com/connect/oauth2?client_id=ABySM...&response_type=code&scope=com.intuit.quickbooks.accounting+openid&redirect_uri=https%3A%2F%2Fdeveloper.intuit.com...&state=abc123state",
  "state": "abc123state"
}
```

---

## 2. Exchange Authorization Code for Bearer Tokens

### `POST /api/intuit/tokens`

Exchanges the ephemeral `code` returned by Intuit for long-lived OAuth Bearer Tokens.

#### Request Body
```json
{
  "code": "AB1169384910283401923841029",
  "realmId": "9341452093841029",
  "redirectUri": "https://developer.intuit.com/app/developer/quickstart",
  "clientId": "ABySM...",
  "clientSecret": "..."
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "access_token": "eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0...",
  "refresh_token": "AB1169385019284109283401928",
  "token_type": "bearer",
  "expires_in": 3600,
  "x_refresh_token_expires_in": 8726400,
  "realmId": "9341452093841029",
  "id_token": "ey..."
}
```

---

## 3. Inspect In-Memory Active Session Tokens

### `GET /api/intuit/session-tokens`

Inspects the server's currently active cached OAuth tokens.

#### Response (`200 OK`)
```json
{
  "success": true,
  "activeTokens": {
    "accessToken": "ey...",
    "refreshToken": "AB...",
    "tokenType": "bearer",
    "expiresIn": 3600,
    "realmId": "9341452093841029",
    "updatedAt": 1724458921000
  }
}
```

---

## 4. Clear Session Tokens

### `POST /api/intuit/clear-session`

Resets the active token cache.

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "Session cleared"
}
```
