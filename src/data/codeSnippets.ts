import { CodeTemplate } from '../types';

export const CODE_TEMPLATES: CodeTemplate[] = [
  {
    id: 'nodejs-express',
    name: 'Node.js & Express (TypeScript / ESM)',
    category: 'JavaScript / TypeScript',
    icon: 'Terminal',
    description: 'Production-ready Express server with dotenv, token refresh interceptor, OpenID decoding, and sandbox API routes.',
    files: [
      {
        filename: '.env',
        language: 'env',
        code: `# Intuit QuickBooks Sandbox Credentials
INTUIT_CLIENT_ID=ABySM9kH7sQ0wfw8Mb3SB30DqWCRQNG6cDQMQVf5gSMvugU5n8
INTUIT_CLIENT_SECRET=your_client_secret_here
INTUIT_REDIRECT_URI=http://localhost:3000/callback
INTUIT_ENVIRONMENT=sandbox
PORT=3000
`
      },
      {
        filename: 'server.ts',
        language: 'typescript',
        code: `import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const CLIENT_ID = process.env.INTUIT_CLIENT_ID!;
const CLIENT_SECRET = process.env.INTUIT_CLIENT_SECRET!;
const REDIRECT_URI = process.env.INTUIT_REDIRECT_URI || 'http://localhost:3000/callback';
const IS_SANDBOX = process.env.INTUIT_ENVIRONMENT !== 'production';

// Intuit Sandbox Endpoints
const AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const ACCOUNTING_BASE = IS_SANDBOX
  ? 'https://sandbox-quickbooks.api.intuit.com'
  : 'https://quickbooks.api.intuit.com';
const USERINFO_URL = IS_SANDBOX
  ? 'https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo'
  : 'https://accounts.platform.intuit.com/v1/openid_connect/userinfo';
const PAYMENTS_BASE = IS_SANDBOX
  ? 'https://sandbox.api.intuit.com'
  : 'https://api.intuit.com';

// In-Memory Token Storage (Use Redis or encrypted database in production)
interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
  realmId?: string;
}
let tokenStore: TokenData | null = null;
let csrfState: string | null = null;

// Helper: Basic Auth Header
function getBasicAuthHeader(): string {
  return 'Basic ' + Buffer.from(\`\${CLIENT_ID}:\${CLIENT_SECRET}\`).toString('base64');
}

// -------------------------------------------------------------
// STEP 1: Get Authorization Code
// -------------------------------------------------------------
app.get('/auth', (req: Request, res: Response) => {
  csrfState = crypto.randomBytes(16).toString('hex');
  const scopes = [
    'com.intuit.quickbooks.accounting',
    'com.intuit.quickbooks.payment',
    'openid',
    'profile',
    'email',
    'phone',
    'address',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    scope: scopes,
    redirect_uri: REDIRECT_URI,
    state: csrfState,
  });

  const redirectUrl = \`\${AUTH_URL}?\${params.toString()}\`;
  console.log('Redirecting user to Intuit OAuth:', redirectUrl);
  res.redirect(redirectUrl);
});

// -------------------------------------------------------------
// STEP 2: Exchange Authorization Code for Tokens
// -------------------------------------------------------------
app.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, realmId } = req.query;

    if (!code) {
      return res.status(400).send('Missing authorization code from Intuit callback.');
    }
    if (state !== csrfState) {
      return res.status(403).send('State mismatch error: CSRF validation failed.');
    }

    const bodyParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      redirect_uri: REDIRECT_URI,
    });

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': getBasicAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: bodyParams.toString(),
    });

    const data: any = await response.json();

    if (!response.ok) {
      console.error('Token exchange error:', data);
      return res.status(response.status).json({ error: 'Token exchange failed', details: data });
    }

    tokenStore = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      realmId: realmId ? String(realmId) : undefined,
    };

    console.log('Successfully acquired OAuth tokens for realmId:', realmId);
    res.json({
      message: 'Tokens acquired successfully!',
      realmId: tokenStore.realmId,
      expiresInSeconds: data.expires_in,
      sampleEndpoints: [
        'GET /api/company-info',
        'GET /api/user-info',
        'POST /api/test-charge',
        'POST /api/refresh-token',
      ],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// STEP 4: Token Refresh Helper / Middleware
// -------------------------------------------------------------
async function getValidAccessToken(): Promise<string> {
  if (!tokenStore) {
    throw new Error('Not authenticated. Please visit /auth first.');
  }

  // Refresh if token expires in less than 60 seconds
  const isExpiring = Date.now() >= (tokenStore.expiresAt - 60000);
  if (!isExpiring) {
    return tokenStore.accessToken;
  }

  console.log('Access token is expiring. Refreshing via refresh_token...');
  const bodyParams = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: tokenStore.refreshToken,
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': getBasicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: bodyParams.toString(),
  });

  const data: any = await response.json();
  if (!response.ok) {
    throw new Error(\`Failed to refresh token: \${JSON.stringify(data)}\`);
  }

  tokenStore.accessToken = data.access_token;
  tokenStore.refreshToken = data.refresh_token;
  tokenStore.expiresAt = Date.now() + (data.expires_in * 1000);
  console.log('Token refreshed successfully!');
  return tokenStore.accessToken;
}

// -------------------------------------------------------------
// STEP 3A: Call QuickBooks Accounting API (Company Info)
// -------------------------------------------------------------
app.get('/api/company-info', async (req: Request, res: Response) => {
  try {
    const accessToken = await getValidAccessToken();
    const realmId = tokenStore?.realmId;
    if (!realmId) {
      return res.status(400).json({ error: 'Missing realmId. Ensure user selected a company during OAuth.' });
    }

    const url = \`\${ACCOUNTING_BASE}/v3/company/\${realmId}/companyinfo/\${realmId}\`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// STEP 3B: Call OpenID Connect UserInfo API
// -------------------------------------------------------------
app.get('/api/user-info', async (req: Request, res: Response) => {
  try {
    const accessToken = await getValidAccessToken();
    const response = await fetch(USERINFO_URL, {
      method: 'GET',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// STEP 3C: Call QuickBooks Payments API (Create Test Charge)
// -------------------------------------------------------------
app.post('/api/test-charge', async (req: Request, res: Response) => {
  try {
    const accessToken = await getValidAccessToken();
    const url = \`\${PAYMENTS_BASE}/quickbooks/v4/payments/charges\`;
    const requestId = crypto.randomUUID();

    const payload = {
      amount: req.body.amount || '12.50',
      currency: 'USD',
      cardOnFile: false,
      context: {
        mobile: 'false',
        isEcommerce: 'true',
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Request-Id': requestId,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    res.status(response.status).json({
      requestId,
      statusCode: response.status,
      response: data,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Manual refresh trigger
app.post('/api/refresh-token', async (req: Request, res: Response) => {
  try {
    const accessToken = await getValidAccessToken();
    res.json({ message: 'Token verified/refreshed', accessToken });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(\`⚡ Server listening on http://localhost:\${PORT}\`);
  console.log(\`👉 Visit http://localhost:\${PORT}/auth to initiate OAuth 2.0 flow\`);
});
`
      },
      {
        filename: 'package.json',
        language: 'json',
        code: `{
  "name": "quickbooks-oauth-scaffold",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.12.7",
    "tsx": "^4.7.2",
    "typescript": "^5.4.5"
  }
}`
      }
    ],
    runInstructions: [
      'Create a project directory and save `.env`, `server.ts`, and `package.json`.',
      'Run `npm install` to install dependencies.',
      'Add `http://localhost:3000/callback` to your Intuit Developer App Keys redirect URIs.',
      'Run `npm run dev` and open `http://localhost:3000/auth` in your browser.',
      'Select your QuickBooks Sandbox company to complete consent and test API routes.'
    ]
  },
  {
    id: 'python-fastapi',
    name: 'Python (FastAPI & Requests)',
    category: 'Python',
    icon: 'Code',
    description: 'Modern asynchronous FastAPI service with Pydantic settings, automatic token refresh, and sandbox routes.',
    files: [
      {
        filename: '.env',
        language: 'env',
        code: `# Intuit QuickBooks Sandbox Credentials
INTUIT_CLIENT_ID=ABySM9kH7sQ0wfw8Mb3SB30DqWCRQNG6cDQMQVf5gSMvugU5n8
INTUIT_CLIENT_SECRET=your_client_secret_here
INTUIT_REDIRECT_URI=http://localhost:8000/callback
INTUIT_ENVIRONMENT=sandbox
`
      },
      {
        filename: 'main.py',
        language: 'python',
        code: `import os
import secrets
import time
import base64
import uuid
import requests
from urllib.parse import urlencode
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse

load_dotenv()

app = FastAPI(title="QuickBooks OAuth 2.0 Sandbox Scaffold")

CLIENT_ID = os.getenv("INTUIT_CLIENT_ID")
CLIENT_SECRET = os.getenv("INTUIT_CLIENT_SECRET")
REDIRECT_URI = os.getenv("INTUIT_REDIRECT_URI", "http://localhost:8000/callback")
IS_SANDBOX = os.getenv("INTUIT_ENVIRONMENT", "sandbox") == "sandbox"

AUTH_ENDPOINT = "https://appcenter.intuit.com/connect/oauth2"
TOKEN_ENDPOINT = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
ACCOUNTING_BASE = "https://sandbox-quickbooks.api.intuit.com" if IS_SANDBOX else "https://quickbooks.api.intuit.com"
USERINFO_ENDPOINT = "https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo" if IS_SANDBOX else "https://accounts.platform.intuit.com/v1/openid_connect/userinfo"
PAYMENTS_BASE = "https://sandbox.api.intuit.com" if IS_SANDBOX else "https://api.intuit.com"

# Simple in-memory token state
token_store = {
    "access_token": None,
    "refresh_token": None,
    "expires_at": 0,
    "realm_id": None,
    "csrf_state": None
}

def get_basic_auth_header() -> str:
    auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64_val = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
    return f"Basic {b64_val}"

# 1. Step 1: Redirect to Authorization URL
@app.get("/auth")
def auth_redirect():
    csrf = secrets.token_hex(16)
    token_store["csrf_state"] = csrf
    
    scopes = "com.intuit.quickbooks.accounting com.intuit.quickbooks.payment openid profile email phone address"
    params = {
        "client_id": CLIENT_ID,
        "response_type": "code",
        "scope": scopes,
        "redirect_uri": REDIRECT_URI,
        "state": csrf
    }
    url = f"{AUTH_ENDPOINT}?{urlencode(params)}"
    return RedirectResponse(url)

# 2. Step 2: Exchange Authorization Code for Tokens
@app.get("/callback")
def oauth_callback(code: str, state: str, realmId: str = None):
    if state != token_store.get("csrf_state"):
        raise HTTPException(status_code=403, detail="Invalid CSRF state")
    
    headers = {
        "Authorization": get_basic_auth_header(),
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    }
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI
    }
    
    resp = requests.post(TOKEN_ENDPOINT, headers=headers, data=data)
    if resp.status_code != 200:
        return JSONResponse(status_code=resp.status_code, content={"error": resp.json()})
    
    body = resp.json()
    token_store["access_token"] = body["access_token"]
    token_store["refresh_token"] = body["refresh_token"]
    token_store["expires_at"] = time.time() + body["expires_in"]
    token_store["realm_id"] = realmId
    
    return {
        "message": "QuickBooks OAuth tokens stored successfully!",
        "realmId": realmId,
        "expires_in_seconds": body["expires_in"]
    }

# 4. Step 4: Token Refresh Helper
def get_valid_token() -> str:
    if not token_store.get("access_token"):
        raise HTTPException(status_code=401, detail="Not authorized. Go to /auth first.")
    
    # Check if expiring within 60 seconds
    if time.time() >= (token_store["expires_at"] - 60):
        headers = {
            "Authorization": get_basic_auth_header(),
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        }
        data = {
            "grant_type": "refresh_token",
            "refresh_token": token_store["refresh_token"]
        }
        resp = requests.post(TOKEN_ENDPOINT, headers=headers, data=data)
        if resp.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Token refresh failed: {resp.text}")
        
        body = resp.json()
        token_store["access_token"] = body["access_token"]
        token_store["refresh_token"] = body["refresh_token"]
        token_store["expires_at"] = time.time() + body["expires_in"]
        
    return token_store["access_token"]

# 3A. Step 3: Get Company Info (Accounting API)
@app.get("/api/company-info")
def get_company_info():
    token = get_valid_token()
    realm_id = token_store.get("realm_id")
    if not realm_id:
        raise HTTPException(status_code=400, detail="Missing realmId")
    
    url = f"{ACCOUNTING_BASE}/v3/company/{realm_id}/companyinfo/{realm_id}"
    resp = requests.get(url, headers={"Authorization": f"Bearer {token}", "Accept": "application/json"})
    return resp.json()

# 3B. Step 3: Get User Info (OpenID Connect)
@app.get("/api/user-info")
def get_user_info():
    token = get_valid_token()
    resp = requests.get(USERINFO_ENDPOINT, headers={"Authorization": f"Bearer {token}", "Accept": "application/json"})
    return resp.json()

# 3C. Step 3: Create Test Charge (Payments v4)
@app.post("/api/test-charge")
def create_test_charge(amount: str = "15.00"):
    token = get_valid_token()
    url = f"{PAYMENTS_BASE}/quickbooks/v4/payments/charges"
    request_id = str(uuid.uuid4())
    
    payload = {
        "amount": amount,
        "currency": "USD",
        "cardOnFile": False,
        "context": {
            "mobile": "false",
            "isEcommerce": "true"
        }
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Request-Id": request_id
    }
    resp = requests.post(url, headers=headers, json=payload)
    return {"status_code": resp.status_code, "request_id": request_id, "response": resp.json()}
`
      },
      {
        filename: 'requirements.txt',
        language: 'text',
        code: `fastapi>=0.110.0
uvicorn>=0.28.0
requests>=2.31.0
python-dotenv>=1.0.1
`
      }
    ],
    runInstructions: [
      'Create a virtual environment: `python -m venv venv && source venv/bin/activate`',
      'Install dependencies: `pip install -r requirements.txt`',
      'Set `INTUIT_CLIENT_SECRET` in `.env`',
      'Start the FastAPI server: `uvicorn main:app --reload --port 8000`',
      'Visit `http://localhost:8000/auth` to authenticate with your Intuit sandbox account.'
    ]
  },
  {
    id: 'dotnet-csharp',
    name: 'C# / .NET 8 (ASP.NET Core)',
    category: 'C# / .NET',
    icon: 'Layers',
    description: 'Clean ASP.NET Core minimal API with HttpClientFactory, IConfiguration, and token refresh handler.',
    files: [
      {
        filename: 'appsettings.json',
        language: 'json',
        code: `{
  "Intuit": {
    "ClientId": "ABySM9kH7sQ0wfw8Mb3SB30DqWCRQNG6cDQMQVf5gSMvugU5n8",
    "ClientSecret": "YOUR_CLIENT_SECRET",
    "RedirectUri": "https://localhost:5001/callback",
    "Environment": "sandbox"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}`
      },
      {
        filename: 'Program.cs',
        language: 'csharp',
        code: `using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient();
var app = builder.Build();

var config = app.Configuration.GetSection("Intuit");
string clientId = config["ClientId"]!;
string clientSecret = config["ClientSecret"]!;
string redirectUri = config["RedirectUri"]!;
bool isSandbox = config["Environment"] == "sandbox";

string authEndpoint = "https://appcenter.intuit.com/connect/oauth2";
string tokenEndpoint = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
string accountingBase = isSandbox ? "https://sandbox-quickbooks.api.intuit.com" : "https://quickbooks.api.intuit.com";
string userinfoEndpoint = isSandbox ? "https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo" : "https://accounts.platform.intuit.com/v1/openid_connect/userinfo";
string paymentsBase = isSandbox ? "https://sandbox.api.intuit.com" : "https://api.intuit.com";

// Token storage state
var tokens = new {
    AccessToken = "",
    RefreshToken = "",
    RealmId = "",
    ExpiresAt = DateTime.UtcNow
};

string GetBasicAuth() => Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));

// 1. Get Auth URL
app.MapGet("/auth", () => {
    string state = Convert.ToHexString(RandomNumberGenerator.GetBytes(16));
    string scopes = "com.intuit.quickbooks.accounting com.intuit.quickbooks.payment openid profile email phone address";
    string url = $"{authEndpoint}?client_id={clientId}&response_type=code&scope={Uri.EscapeDataString(scopes)}&redirect_uri={Uri.EscapeDataString(redirectUri)}&state={state}";
    return Results.Redirect(url);
});

// 2. Token Exchange Callback
app.MapGet("/callback", async (string code, string? realmId, IHttpClientFactory httpClientFactory) => {
    var client = httpClientFactory.CreateClient();
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", GetBasicAuth());
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

    var body = new Dictionary<string, string> {
        { "grant_type", "authorization_code" },
        { "code", code },
        { "redirect_uri", redirectUri }
    };

    var response = await client.PostAsync(tokenEndpoint, new FormUrlEncodedContent(body));
    var json = await response.Content.ReadAsStringAsync();
    return Results.Content(json, "application/json");
});

// 3A. Company Info
app.MapGet("/api/company-info", async ([FromHeader(Name = "Authorization")] string bearerToken, string realmId, IHttpClientFactory httpClientFactory) => {
    var client = httpClientFactory.CreateClient();
    client.DefaultRequestHeaders.Add("Authorization", bearerToken);
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    
    string url = $"{accountingBase}/v3/company/{realmId}/companyinfo/{realmId}";
    var resp = await client.GetAsync(url);
    var content = await resp.Content.ReadAsStringAsync();
    return Results.Content(content, "application/json");
});

// 3B. User Info
app.MapGet("/api/user-info", async ([FromHeader(Name = "Authorization")] string bearerToken, IHttpClientFactory httpClientFactory) => {
    var client = httpClientFactory.CreateClient();
    client.DefaultRequestHeaders.Add("Authorization", bearerToken);
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    
    var resp = await client.GetAsync(userinfoEndpoint);
    var content = await resp.Content.ReadAsStringAsync();
    return Results.Content(content, "application/json");
});

// 4. Refresh Token
app.MapPost("/api/refresh", async (string refreshToken, IHttpClientFactory httpClientFactory) => {
    var client = httpClientFactory.CreateClient();
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", GetBasicAuth());
    
    var body = new Dictionary<string, string> {
        { "grant_type", "refresh_token" },
        { "refresh_token", refreshToken }
    };
    var resp = await client.PostAsync(tokenEndpoint, new FormUrlEncodedContent(body));
    var json = await resp.Content.ReadAsStringAsync();
    return Results.Content(json, "application/json");
});

app.Run();
`
      }
    ],
    runInstructions: [
      'Create a new project: `dotnet new web -n QuickBooksOAuth`',
      'Replace `Program.cs` and `appsettings.json` with the files above.',
      'Run `dotnet user-secrets set "Intuit:ClientSecret" "YOUR_SECRET"` to avoid committing secrets.',
      'Start the app: `dotnet run`',
      'Navigate to `https://localhost:5001/auth`.'
    ]
  },
  {
    id: 'curl',
    name: 'cURL & Shell Scripts',
    category: 'Terminal / CLI',
    icon: 'Terminal',
    description: 'Instant copy-paste terminal commands for exchanging authorization codes, making sandbox requests, and refreshing tokens.',
    files: [
      {
        filename: 'quickbooks_oauth.sh',
        language: 'bash',
        code: `#!/usr/bin/env bash
# =============================================================
# QuickBooks OAuth 2.0 Sandbox CLI Workflow
# =============================================================

CLIENT_ID="ABySM9kH7sQ0wfw8Mb3SB30DqWCRQNG6cDQMQVf5gSMvugU5n8"
CLIENT_SECRET="YOUR_CLIENT_SECRET"
REDIRECT_URI="https://developer.intuit.com/app/developer/quickstart"

# 1. Base64 encode client_id:client_secret
BASIC_AUTH=$(echo -n "\${CLIENT_ID}:\${CLIENT_SECRET}" | base64)

# -------------------------------------------------------------
# STEP 1: Launch Authorize URL in browser
# -------------------------------------------------------------
SCOPES="com.intuit.quickbooks.accounting com.intuit.quickbooks.payment openid profile email phone address"
AUTH_URL="https://appcenter.intuit.com/connect/oauth2?client_id=\${CLIENT_ID}&response_type=code&scope=$(echo $SCOPES | tr ' ' '+')&redirect_uri=\${REDIRECT_URI}&state=random_state_123"

echo "Open this URL in your browser to authorize:"
echo "\${AUTH_URL}"
echo ""

# -------------------------------------------------------------
# STEP 2: Exchange Authorization Code for Bearer Tokens
# -------------------------------------------------------------
# Replace CODE_FROM_REDIRECT with the code query parameter:
AUTH_CODE="PASTE_CODE_HERE"

curl -X POST "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer" \\
  -H "Authorization: Basic \${BASIC_AUTH}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -H "Accept: application/json" \\
  -d "grant_type=authorization_code&code=\${AUTH_CODE}&redirect_uri=\${REDIRECT_URI}"

# -------------------------------------------------------------
# STEP 3A: Query Sandbox Company Info (Accounting API)
# -------------------------------------------------------------
ACCESS_TOKEN="PASTE_ACCESS_TOKEN_HERE"
REALM_ID="PASTE_REALM_ID_HERE"

curl -X GET "https://sandbox-quickbooks.api.intuit.com/v3/company/\${REALM_ID}/companyinfo/\${REALM_ID}" \\
  -H "Authorization: Bearer \${ACCESS_TOKEN}" \\
  -H "Accept: application/json"

# -------------------------------------------------------------
# STEP 3B: Query OpenID User Info
# -------------------------------------------------------------
curl -X GET "https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo" \\
  -H "Authorization: Bearer \${ACCESS_TOKEN}" \\
  -H "Accept: application/json"

# -------------------------------------------------------------
# STEP 3C: Create Sandbox Test Charge (Payments v4 API)
# -------------------------------------------------------------
curl -X POST "https://sandbox.api.intuit.com/quickbooks/v4/payments/charges" \\
  -H "Authorization: Bearer \${ACCESS_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -H "Request-Id: $(uuidgen 2>/dev/null || echo $RANDOM)" \\
  -d '{
    "amount": "10.50",
    "currency": "USD",
    "cardOnFile": false,
    "context": {
      "mobile": "false",
      "isEcommerce": "true"
    }
  }'

# -------------------------------------------------------------
# STEP 4: Refresh Expired Access Token
# -------------------------------------------------------------
REFRESH_TOKEN="PASTE_REFRESH_TOKEN_HERE"

curl -X POST "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer" \\
  -H "Authorization: Basic \${BASIC_AUTH}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -H "Accept: application/json" \\
  -d "grant_type=refresh_token&refresh_token=\${REFRESH_TOKEN}"
`
      }
    ],
    runInstructions: [
      'Export your credentials: `export CLIENT_ID="..." CLIENT_SECRET="..."`',
      'Generate base64 string: `echo -n "$CLIENT_ID:$CLIENT_SECRET" | base64`',
      'Execute the curl commands step-by-step directly from your terminal.'
    ]
  }
];
