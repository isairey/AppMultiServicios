# Frontend: Login with Diia

Base URL: on `localhost` / `127.0.0.1` the bundled UI calls **`http://localhost:8080`** for `/auth/diia/*`. On any other host (e.g. GitHub Pages) it uses **`https://prostir-web-production.up.railway.app`**. Override anytime with `window.__PROSTIR_API_BASE__` (no trailing slash) before loading the script.

## 1. Start login

`GET /auth/diia/connect`

**Response (JSON):**

- `authUrl` — mock QR / deep-link target (open in WebView or show as QR).
- `state` — opaque value; in production, validate it on callback against your session/store.
- `mockDiiaToken` — present only when `USE_DIIA_MOCK=true`; this simulates the token Diia would send after the user confirms identity.

Example:

```http
GET /auth/diia/connect
```

```json
{
  "authUrl": "https://mock.diia.gov.ua/qr?client=prostir&state=...",
  "state": "abc123...",
  "expiresIn": 300,
  "mode": "mock",
  "mockDiiaToken": "eyJhbGciOiJIUzI1NiIs...",
  "hint": "Send this mockDiiaToken..."
}
```

## 2. Finish login (exchange Diia token for session JWT)

`POST /auth/diia/callback`  
`Content-Type: application/json`

**Body (choose one):**

- **Mock with token from step 1:** `{ "token": "<mockDiiaToken>" }`
- **Mock shortcut (no token):** `{ "simulate": true }` — only when `USE_DIIA_MOCK=true` on the server.

**Success (200):**

```json
{
  "accessToken": "<your-app-jwt>",
  "tokenType": "Bearer",
  "expiresIn": 604800,
  "user": {
    "id": "uuid",
    "diia_id": "UA-...",
    "full_name": "...",
    "is_verified": true
  }
}
```

The bundled UI (`/diia-auth.bundle.js`) saves the session as `localStorage.setItem('prostir_token', accessToken)` and `prostir_user` (JSON). Legacy `prostir_access_token` is migrated once on load. Send the token on later API calls:

```http
Authorization: Bearer <accessToken>
```

## 3. Fetch example (browser)

```javascript
const r1 = await fetch('/auth/diia/connect');
const { mockDiiaToken } = await r1.json();

const r2 = await fetch('/auth/diia/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: mockDiiaToken }),
});
const { accessToken, user } = await r2.json();
```

## Requirements on the server

- `DATABASE_URL` must point to PostgreSQL (table `users` is created on startup).
- `SESSION_JWT_SECRET` (or `JWT_SECRET`) must be set for signing session tokens.
