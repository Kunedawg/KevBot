# Backend API Security Model

<!-- TODO: remove this in favor of the shorter SECURITY_MODEL.md-->

## Overview

The KevBot API implements a modern security architecture using **JWT-based access tokens** and **HTTP-only refresh cookies** to provide secure authentication and authorization. This dual-token approach balances security with user experience by:

- Keeping short-lived access tokens in memory (vulnerable to XSS but short-lived)
- Storing long-lived refresh tokens in secure, HTTP-only cookies (immune to XSS attacks)
- Enabling seamless token refresh without requiring user re-authentication

## Architecture Components

### 1. JWT Access Tokens

**Purpose:** Short-lived bearer tokens for API authorization

**Characteristics:**

- **Lifetime:** 15 minutes (configurable via `AUTH_ACCESS_TOKEN_TTL_MINUTES`)
- **Storage:** Client-side memory (not localStorage/sessionStorage to reduce XSS risk)
- **Claims:**
  - `sub` (subject): User ID
  - `role`: `"user"` or `"bot"`
  - `sid` (session ID): Reference to the server-side session
  - `aud` (audience): `kevbot-api`
  - `iss` (issuer): `kevbot-api`
  - `exp` (expiration): 15 minutes from issuance
- **Signing:** HMAC-SHA256 with `KEVBOT_API_JWT_SECRET`

**Usage:**

```http
Authorization: Bearer <access_token>
```

**Verification Process:**

1. Extract token from `Authorization` header
2. Verify signature using JWT secret
3. Validate audience, issuer, and expiration
4. Extract user ID and role from claims
5. Attach auth context to request object

### 2. HTTP-Only Refresh Cookies

**Purpose:** Long-lived session identifiers for obtaining new access tokens

**Characteristics:**

- **Lifetime:** 90 days (configurable via `AUTH_REFRESH_SESSION_TTL_DAYS`)
- **Storage:** Secure, HTTP-only cookie
- **Cookie Name:** `kevbot_refresh_session` (configurable via `AUTH_REFRESH_COOKIE_NAME`)
- **Cookie Attributes:**
  - `httpOnly: true` - Cannot be accessed by JavaScript (XSS protection)
  - `secure: true` - Only transmitted over HTTPS in production
  - `sameSite: "lax"` - CSRF protection, allows top-level navigation
  - `path: "/v1/auth"` - Scoped to authentication endpoints only
  - `maxAge`: 90 days

**Server-Side Session Storage:**
Each refresh cookie contains a session UUID that references a database record with:

- User ID
- Expiration timestamp
- Revocation status
- User agent (for anomaly detection)
- IP address (for security monitoring)

### 3. CORS Configuration

**Allowed Origins:**

- `http://localhost:3000` (development)
- `process.env.FRONTEND_ORIGIN` (production)

**CORS Headers:**

```
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
Vary: Origin
```

**Key Security Features:**

- Dynamic origin checking (no wildcard with credentials)
- Credentials enabled for cookie transmission
- Strict origin validation from allowlist

## Authentication Endpoints

### POST `/v1/auth/discord-exchange`

**Purpose:** Exchange Discord OAuth2 authorization code for access token and session

**Request:**

```json
{
  "code": "discord_authorization_code"
}
```

**Flow:**

1. Exchange code with Discord for access token
2. Fetch user profile from Discord API
3. Create or update user in database
4. Create new session with metadata (user agent, IP)
5. Generate JWT access token
6. Set HTTP-only refresh cookie with session ID

**Response:**

```json
{
  "access_token": "jwt_access_token",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": 123
  }
}
```

**Security Measures:**

- Validates Discord code before user creation
- Captures session metadata for anomaly detection
- Uses database transaction for atomicity
- Slides session expiration on use

### POST `/v1/auth/refresh`

**Purpose:** Obtain a new access token using refresh session

**Authentication:** Refresh cookie required

**Flow:**

1. Extract session ID from HTTP-only cookie
2. Validate session exists and is not revoked
3. Check session expiration
4. Slide session expiration forward (90 days from now)
5. Update session metadata
6. Generate new JWT access token
7. Return new access token with updated cookie

**Response:**

```json
{
  "access_token": "new_jwt_access_token",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": 123
  }
}
```

**Security Measures:**

- Sessions can be revoked server-side
- Sliding expiration extends active users' sessions
- Tracks metadata for security monitoring
- Returns `401 Unauthorized` for invalid/expired sessions

### POST `/v1/auth/logout`

**Purpose:** Revoke refresh session and clear cookie

**Authentication:** Refresh cookie (optional)

**Flow:**

1. Extract session ID from cookie
2. Mark session as revoked in database
3. Clear the refresh cookie
4. Return 204 No Content

**Security Measures:**

- Idempotent operation (handles missing sessions gracefully)
- Server-side session revocation prevents token reuse
- Clears cookie with matching attributes for reliable deletion

### GET `/v1/auth/me`

**Purpose:** Get current authenticated user information

**Authentication:** JWT access token required

**Response:**

```json
{
  "user": {
    "id": 123,
    "discord_id": "123456789",
    "discord_username": "user#1234",
    "created_at": "2025-01-01T00:00:00Z"
  },
  "role": "user",
  "session_id": "uuid-session-id"
}
```

## Authorization Middleware

### `requireAuth`

**Purpose:** Enforce authentication on protected routes

**Behavior:**

- Extracts JWT from `Authorization: Bearer <token>` header
- Verifies token signature and claims
- Throws `401 Unauthorized` if token is missing or invalid
- Attaches `req.auth` context with `{ userId, role, sessionId }`

**Usage:**

```typescript
router.get("/protected", auth.requireAuth, controller.protectedRoute);
```

### `optionalAuth`

**Purpose:** Parse auth context without enforcing it

**Behavior:**

- Attempts to verify token if present
- Silently ignores invalid tokens
- Allows requests to proceed as anonymous users
- Useful for public endpoints with user-specific features

## Session Management

### Session Lifecycle

1. **Creation:**

   - Triggered by successful Discord OAuth exchange
   - UUID generated as session identifier
   - Stored in database with expiration and metadata

2. **Validation:**

   - Checked on every `/refresh` request
   - Must not be revoked (`is_revoked = 0`)
   - Must not be expired (`expires_at > NOW()`)

3. **Sliding Expiration:**

   - Each successful refresh extends expiration by 90 days
   - Keeps active users logged in indefinitely
   - Inactive users automatically logged out

4. **Revocation:**
   - Explicit logout sets `is_revoked = 1`
   - Cannot be un-revoked
   - Prevents token reuse after logout

### Security Metadata

Each session tracks:

- **User Agent:** Browser/client identifier (sanitized to 255 chars)
- **IP Address:** Request origin (sanitized to 45 chars for IPv6)

**Use Cases:**

- Detect suspicious login patterns
- Support "active sessions" UI
- Enable "log out all devices" functionality

## Security Best Practices Implemented

### ✅ XSS Protection

- HTTP-only cookies prevent JavaScript access to refresh tokens
- Access tokens kept in memory (not localStorage)
- Short-lived access tokens limit exposure window

### ✅ CSRF Protection

- `sameSite: "lax"` prevents cross-site cookie transmission on POST requests
- Custom `Authorization` header required for API calls (not sent cross-origin)
- State parameter in OAuth flow (handled by Discord)

### ✅ Token Theft Mitigation

- Refresh tokens usable only from `/v1/auth` endpoints (cookie path restriction)
- Session revocation provides kill switch
- Access tokens expire quickly (15 minutes)

### ✅ Secure Transmission

- `secure: true` enforces HTTPS in production
- CORS restricts origins to known frontends
- Credentials only sent to allowlisted origins

### ✅ Session Hijacking Defense

- Session metadata enables anomaly detection
- Server-side revocation prevents stolen token reuse
- Sliding expiration logs out inactive sessions

## Environment Configuration

### Required Secrets

```bash
# JWT Configuration
KEVBOT_API_JWT_SECRET=<strong-random-secret>
AUTH_JWT_AUDIENCE=kevbot-api
AUTH_JWT_ISSUER=kevbot-api

# Token Lifetimes
AUTH_ACCESS_TOKEN_TTL_MINUTES=15
AUTH_REFRESH_SESSION_TTL_DAYS=90

# Cookie Configuration
AUTH_REFRESH_COOKIE_NAME=kevbot_refresh_session
AUTH_REFRESH_COOKIE_PATH=/v1/auth

# Discord OAuth2
DISCORD_OAUTH2_CLIENT_ID=<discord-client-id>
DISCORD_OAUTH2_CLIENT_SECRET=<discord-client-secret>
DISCORD_OAUTH2_REDIRECT_URI=<frontend-callback-url>

# CORS
FRONTEND_ORIGIN=https://kevbot.example.com

# Node Environment
NODE_ENV=production  # Enables secure cookies
```

### Security Checklist

- [ ] `KEVBOT_API_JWT_SECRET` is cryptographically random (256+ bits)
- [ ] `NODE_ENV=production` in production (enables `secure: true` cookies)
- [ ] `FRONTEND_ORIGIN` matches actual frontend domain (no wildcards)
- [ ] HTTPS enforced for all API and frontend traffic
- [ ] `DISCORD_OAUTH2_REDIRECT_URI` registered in Discord Developer Portal
- [ ] Rate limiting implemented on authentication endpoints (future)
- [ ] Database sessions table has index on `user_id` and `expires_at`
- [ ] Monitoring alerts on unusual session creation patterns

## Threat Model

### Threats Mitigated

| Threat                     | Mitigation                                      |
| -------------------------- | ----------------------------------------------- |
| XSS stealing refresh token | HTTP-only cookie, not accessible to JavaScript  |
| XSS stealing access token  | Short 15-minute lifetime limits exposure window |
| CSRF on authentication     | `sameSite: lax`, custom Authorization header    |
| Token replay after logout  | Server-side session revocation                  |
| Man-in-the-middle          | HTTPS enforcement, secure cookie flag           |
| Brute force on endpoints   | Rate limiting (recommended future enhancement)  |
| Session fixation           | Random UUID generation, Discord verification    |

### Residual Risks

| Risk                         | Mitigation Strategy                                |
| ---------------------------- | -------------------------------------------------- |
| Compromised JWT secret       | Rotate secret, invalidate all sessions             |
| Stolen refresh cookie        | User logout revokes session, monitor for anomalies |
| Access token in memory (XSS) | Keep frontend dependencies updated, CSP headers    |
| Long-lived refresh tokens    | Implement absolute session timeout (optional)      |

## Client Integration Guide

### Initial Authentication

```typescript
// 1. Redirect to Discord OAuth
window.location.href = discordAuthUrl;

// 2. Handle callback with authorization code
const { code } = new URLSearchParams(window.location.search);

// 3. Exchange code for tokens
const response = await fetch("/v1/auth/discord-exchange", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code }),
  credentials: "include", // Required for cookies
});

const { access_token, expires_in, user } = await response.json();

// 4. Store access token in memory
setAccessToken(access_token);
```

### Making Authenticated Requests

```typescript
const response = await fetch("/v1/tracks", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  credentials: "include", // Include cookies for refresh
});
```

### Handling Token Expiration

```typescript
// Refresh token before making request if expired
if (isTokenExpired(accessToken)) {
  const response = await fetch("/v1/auth/refresh", {
    method: "POST",
    credentials: "include", // Sends refresh cookie
  });

  if (response.ok) {
    const { access_token } = await response.json();
    setAccessToken(access_token);
  } else {
    // Redirect to login
    redirectToDiscordAuth();
  }
}
```

### Logout

```typescript
await fetch("/v1/auth/logout", {
  method: "POST",
  credentials: "include",
});

clearAccessToken();
redirectToHome();
```

## Future Enhancements

### Recommended Additions

1. **Rate Limiting**

   - Protect `/discord-exchange` and `/refresh` from brute force
   - Implement exponential backoff for failed attempts

2. **Session Management UI**

   - Show active sessions with metadata
   - Allow users to revoke specific sessions
   - "Log out all devices" functionality

3. **Refresh Token Rotation**

   - Issue new session ID on each refresh
   - Detect token replay attacks
   - Automatic revocation on suspicious activity

4. **Audit Logging**

   - Log all authentication events
   - Track session creation, refresh, and revocation
   - Alert on anomalies (location changes, unusual patterns)

5. **Multi-Factor Authentication**

   - Optional TOTP for high-security accounts
   - Required for admin/privileged users

6. **Absolute Session Timeout**
   - Force re-authentication after X days regardless of activity
   - Configurable per user role

## References

- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [JWT RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Discord OAuth2 Documentation](https://discord.com/developers/docs/topics/oauth2)

---

**Document Version:** 1.0  
**Last Updated:** November 3, 2025  
**Maintained By:** KevBot Development Team
