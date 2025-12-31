---
name: Discord OAuth Implementation
overview: ""
todos:
  - id: c2c61395-8fd2-4f2f-a5c4-1ea2de91f2b1
    content: Add Discord OAuth env vars to backend config.ts (client_id, secret, redirect_uri, auth_url)
    status: pending
  - id: 4359a6d5-110c-4398-b7e5-d9a5c3d58266
    content: Add GET /auth/discord/callback route handler in authController and routes
    status: pending
  - id: 03256f60-767a-48ca-bf09-c44e2160c4b4
    content: Implement exchangeDiscordCode() service function to exchange code for Discord access token
    status: pending
  - id: baf6679b-4a62-46dd-99e1-f75ebde3c760
    content: Create frontend config.ts with validated NEXT_PUBLIC env vars, similar to backend pattern
    status: pending
  - id: 3d3065a0-214b-4fbb-8e41-0c0ce70c6e54
    content: Create AuthContext with login/logout/checkAuth methods and useAuth hook
    status: pending
  - id: 986e8a8c-2f6e-40c9-807a-0a8bc282c0ad
    content: Create auth.ts utility functions for JWT decoding, expiry checks, and token management
    status: pending
  - id: a7efd21e-35ba-41f6-a20c-b0cf860fa04a
    content: Create login-button component that triggers Discord OAuth redirect
    status: pending
  - id: b2fa360f-1dfc-402b-8e0a-a48509ebd94c
    content: Create /auth/callback page to handle OAuth redirect with JWT extraction
    status: pending
  - id: a71cdec1-6ca4-44d2-a8e1-6425a83501f0
    content: Update api.ts to use authenticated fetch with automatic token refresh
    status: pending
  - id: e6a15ac5-40e3-4ed1-ae94-56aba1110c1d
    content: Add Discord OAuth vars to dev.env, local_dev.env, and create .env.local.example
    status: pending
---

# Discord OAuth Implementation

## Overview

Implement complete Discord OAuth2 flow connecting frontend and backend with proper authentication state management, configuration system, and session handling.

## Architecture

### Flow

1. User clicks login → Frontend redirects to Discord OAuth URL
2. User authenticates with Discord → Redirected to frontend callback URL: `/auth/callback?code=abc123`
3. Frontend extracts `code` from query params
4. Frontend POSTs code to backend: `POST /v1/auth/discord-exchange` with `{ code: string }`
5. Backend exchanges `code` for Discord access token (has client_secret)
6. Backend fetches Discord user profile using access token
7. Backend creates/updates user and creates session
8. Backend responds with JWT in response body + httpOnly session cookie
9. Frontend stores JWT in state, redirects to home (clean URL, no token)
10. Frontend uses JWT in Authorization header for authenticated requests
11. If JWT expires, frontend calls refresh endpoint using session cookie

### Configuration Strategy

- **Backend**: Add Discord OAuth env vars to `config.ts` with validation (client_id, client_secret, redirect_uri, auth_url)
- **Frontend**: Create `config.ts` similar to backend with validated `NEXT_PUBLIC_*` env vars
- Add `.env.local` support for frontend with `.env.local.example`

## Implementation Tasks

### Backend Changes

#### 1. Update Configuration (`api/src/config/config.ts`)

- Add to `secretsSchema`: `DISCORD_OAUTH2_CLIENT_ID`, `DISCORD_OAUTH2_CLIENT_SECRET`, `DISCORD_OAUTH2_REDIRECT_URI`
- Add to `configSchema`: `discordOAuth2AuthUrl`
- Parse env vars and validate in `configFactory()`

#### 2. Add OAuth Callback Route (`api/src/controllers/authController.ts`)

- Create `getDiscordCallback()` handler
- Extract `code` from query params
- Fetch Discord access token using code + client credentials
- Create/update user via existing `exchangeDiscord()` logic
- Generate JWT and session cookie
- Redirect to frontend with JWT as query param: `?token=...`

#### 3. Add Exchange Code Service (`api/src/services/authService.ts`)

- Create `exchangeDiscordCode(code: string)` function
- HTTP request to Discord token endpoint with code
- Return access token for subsequent profile fetch
- Handle Discord API errors with Boom

#### 4. Update Routes (`api/src/routes/authRoutes.ts`)

- Add `GET /auth/discord/callback` route

#### 5. Update Environment Files

- Add Discord OAuth vars to `dev.env` and `local_dev.env`
- Document in comments or separate `DISCORD_OAUTH.md`

### Frontend Changes

#### 6. Create Config System (`frontend/src/lib/config.ts`)

- Define `Config` interface with all public env vars
- Create `getConfig()` function that validates `process.env.NEXT_PUBLIC_*` vars
- Export typed config singleton
- Set as client component compatible (or separate server vs client configs)

#### 7. Create Auth Context (`frontend/src/lib/contexts/auth-context.tsx`)

- Provide authentication state (isAuthenticated, user, token)
- `AuthProvider` component wrapping app
- `useAuth()` hook for consuming auth state
- Methods: `login()` (redirect to Discord), `logout()` (call API, clear state), `checkAuth()` (verify token)

#### 8. Create JWT Utilities (`frontend/src/lib/auth.ts`)

- `getToken()` - retrieve from state/context
- `decodeJwt()` - parse JWT for expiry check
- `isTokenExpired()` - check JWT expiry without calling API
- Handle token extraction from URL on callback

#### 9. Add API Client Updates (`frontend/src/lib/api.ts`)

- Create `authenticatedFetch()` wrapper function
- Automatically add `Authorization: Bearer ${token}` header
- Refresh token logic on 401 response
- Update `fetchTracks()` to use authenticated fetch

#### 10. Create Login Component (`frontend/src/components/login-button.tsx`)

- Button to trigger Discord OAuth redirect
- Uses `useAuth()` hook
- Shows login/logout state appropriately
- Add to navbar or login page

#### 11. Add OAuth Callback Handler (`frontend/src/app/auth/callback/page.tsx`)

- Server component that receives OAuth redirect from backend
- Extracts JWT from query param
- Stores in cookie (httpOnly handled by backend) and client state
- Redirects to home with clean URL (removes token from URL)

#### 12. Add Environment Configuration

- Create `.env.local.example` with Discord OAuth vars
- Update `next.config.ts` if needed for env loading
- Document `NEXT_PUBLIC_API_URL` and new vars

### Testing & Documentation

#### 13. Update API Docs

- Document new OAuth callback endpoint
- Update auth flow diagrams if present

#### 14. Add Development Setup

- Discord OAuth app creation instructions
- Local dev setup with proper redirect URIs

## Configuration Example

Backend env vars:

```env
DISCORD_OAUTH2_CLIENT_ID=your_client_id
DISCORD_OAUTH2_CLIENT_SECRET=your_secret
DISCORD_OAUTH2_REDIRECT_URI=http://localhost:3001/v1/auth/discord/callback
```

Frontend env vars:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```