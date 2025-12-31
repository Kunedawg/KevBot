# KevBot API Security Model (Concise Summary)

## Overview

KevBot uses a **dual-token model** for secure authentication:

- **JWT access tokens** — short-lived, stored in memory
- **HTTP-only refresh cookies** — long-lived, server-managed

This design enables seamless reauthentication while protecting against XSS, CSRF, and token replay.

---

## 1. Access Tokens

- **Type:** JWT (HMAC-SHA256)
- **Lifetime:** 15 minutes
- **Storage:** In memory only (not in `localStorage` or `sessionStorage`)
- **Claims:** `sub`, `role`, `sid`, `aud`, `iss`, `exp`
- **Usage:**

  ```
  Authorization: Bearer <access_token>
  ```

- **Purpose:** Authorize API calls with minimal exposure window.

---

## 2. Refresh Cookies

- **Purpose:** Reissue access tokens via `/v1/auth/refresh`
- **Lifetime:** 90 days
- **Cookie:** `kevbot_refresh_session`
- **Attributes:**

  - `httpOnly: true` (not accessible via JS)
  - `secure: true` (HTTPS only)
  - `sameSite: none` (for cross-site if frontend ≠ API)
  - `path: /v1/auth`

- **Server-side Session:**
  Tracks user ID, expiration, revocation, IP, and user agent.
  Supports sliding expiration—extends for active users.

---

## 3. CORS & CSRF Protection

KevBot allows only specific origins (e.g. `FRONTEND_ORIGIN`) to send authenticated requests.

```
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Content-Type, Authorization
```

**How CORS protects against CSRF:**
Even if a malicious site tries to send a request (e.g., to `/v1/auth/refresh`), the **browser blocks the response** because the server does not allow that site’s origin.
This prevents attackers from reading sensitive responses or chaining authenticated actions.

---

## 4. Authentication Endpoints

| Endpoint                         | Purpose                          | Auth   | Notes                        |
| -------------------------------- | -------------------------------- | ------ | ---------------------------- |
| `POST /v1/auth/discord-exchange` | Exchange Discord code for tokens | none   | Creates session, sets cookie |
| `POST /v1/auth/refresh`          | Get new access token             | cookie | Slides expiration            |
| `POST /v1/auth/logout`           | Revoke session                   | cookie | Clears cookie                |
| `GET /v1/auth/me`                | Fetch user profile               | JWT    | —                            |

---

## 5. Security Highlights

✅ **XSS:** refresh cookie is HTTP-only
✅ **CSRF:** blocked via `Authorization` header + CORS restrictions
✅ **Session Theft:** server revocation + path restriction
✅ **HTTPS:** required for secure cookies
✅ **No Wildcards:** CORS origin validation ensures trusted access

---

## 6. Bonus Security Measures

- **Same-Domain Setup:**
  Host frontend and API under the same base domain (e.g. `kevbot.bot`) so cookies can use `SameSite=Lax`, improving CSRF resistance.

- **Origin/Referer Validation:**
  `/v1/auth/refresh` should verify `Origin` or `Referer` headers to ensure requests only come from trusted frontends.

- **Backend for Frontend(BFF):**
  The frontend can essentially just proxy all the backend endpoints, so that all traffic is same origin. This creates extra work, and some endpoints have to be handled carefully, like cookies.

## 7. Note on React Server Components, frontend, and secrets

After authenticating, a frontend client is provided two secrets in the form of a refresh cookie (http-only) and a jwt bearer token (stored in memory only). This model complicates the conditions in which a server component could fetch data on behalf of the client, for endpoints that require user authentication (which I plan to be most endpoints).

1. There really isn't a great way to share the JWT token with the frontend server. So, the frontend server would need to fetch a JWT from the API using the client cookie.

2. Point (1) implies the need for the client to send it's refresh cookie to the backend. Since the client has no direct control over when cookies are sent (it is managed by the browser) The following is required:

   1. The frontend server and backend server are on the same eTLD+1, (`app.kevbot.com` and `api.kevbot.com` for example). Maybe you could get around this with a BFF for the auth endpoints.
   2. The cookies domain parameter is set to be `kevbot.com` and not `api.kevbot.com`.
   3. The path is setup correctly as well for the cookie.

3. Once the frontend server has the cookie from the client (next.js api `cookies()`), it can then hit the `/refresh` endpoint on the backend, and receive a JWT.

4. Point (3) implies that both the client browser and frontend server could be using the same refresh cookie. If there is a desire to have rotating refresh cookies, it might be challenged to keep the client and server in sync.

5. Point (3) also implies that the server would need to handle the storage of the JWT. The server could just always hit the refresh endpoint and not store the JWT, but that is a lot of extra requests potentially. The server could store JWTs is a map that somehow maps specific client to JWT. Again, this is just kind of a headache to manage, and potentially a security risk.

For all the reasons mentioned above, RSCs simply aren’t worth the hassle. All frontend interactions that require authenticated access to the Kevbot API will occur directly from the user’s browser. In fact, even unauthenticated actions will also be handled in the browser—this approach simplifies the API client by only needing to support browser-based requests, rather than both browser and server-side calls.
