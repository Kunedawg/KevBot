import { ApiTrack, PaginatedResponse, TrackSuggestionResponse } from "./types";

export type FetchLike = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

// ---------- Auth Types ----------
export interface AuthGrantResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  user?: { id: number };
}

export interface AuthMeResponse {
  user: {
    id: number;
    discord_id: string;
    discord_username: string;
    discord_avatar_hash: string;
  };
  role: string;
  session_id: string | null;
}

export type TrackFetchParams = {
  offset?: number;
  limit?: number;
  q?: string;
  name?: string;
  search_mode?: "fulltext" | "contains" | "hybrid";
  sort?: "relevance" | "created_at" | "name";
  order?: "asc" | "desc";
  include_deleted?: boolean;
};

// ---------- Auth Store ----------
export interface AuthStore {
  getToken(): string | null;
  setToken(token: string | null): void;
  isTokenExpired(): boolean;
}

export type UnauthenticatedReason = "logout" | "refresh_failed" | "unauthorized";

export type AuthEvent = { type: "authenticated" } | { type: "unauthenticated"; reason?: UnauthenticatedReason };

export interface AuthEvents {
  subscribe(listener: (event: AuthEvent) => void): () => void;
}

function createAuthEventEmitter() {
  const listeners = new Set<(event: AuthEvent) => void>();
  return {
    subscribe(listener: (event: AuthEvent) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emit(event: AuthEvent) {
      listeners.forEach((listener) => listener(event));
    },
  };
}

export function isTokenExpired(jwt: string): boolean {
  try {
    const [, payload] = jwt.split(".");
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === "number" ? Date.now() / 1000 >= exp - 15 : true;
  } catch {
    return true;
  }
}

export function createMemoryAuthStore(): AuthStore {
  let token: string | null = null;
  return {
    getToken: () => token,
    setToken: (t) => {
      token = t;
    },
    isTokenExpired: () => {
      if (!token) return true;
      return isTokenExpired(token);
    },
  };
}

// ---------- Client Options ----------

export class ApiError extends Error {
  status?: number;

  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiClient = ReturnType<typeof createApiClient>;

export class UnauthenticatedError extends ApiError {
  readonly reason?: UnauthenticatedReason;

  constructor(message = "Unauthenticated", reason?: UnauthenticatedReason) {
    super(message);
    this.name = "UnauthenticatedError";
    this.status = 401;
    this.reason = reason;
  }
}

// ---------- Core Client ----------
// TODO: Improve error handling. Utilize error codes from the api.
export function createApiClient(opts: { baseUrl: string }) {
  const baseUrl = opts.baseUrl;
  const auth = createMemoryAuthStore();
  const authEventsEmitter = createAuthEventEmitter();
  const authEvents: AuthEvents = {
    subscribe: (listener) => authEventsEmitter.subscribe(listener),
  };

  const url = (path: string) => {
    if (!path.startsWith("/")) throw new Error("API path must start with '/'");
    return `${baseUrl}${path}`;
  };

  async function refreshAccessToken(): Promise<boolean> {
    try {
      const res = await fetch(url("/v1/auth/refresh"), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        auth.setToken(null);
        return false;
      }
      const data = (await res.json()) as AuthGrantResponse;
      const token = data.access_token ?? null;
      const hadPreviousToken = auth.getToken() !== null;
      auth.setToken(token);
      if (!token) {
        return false;
      }
      if (hadPreviousToken) {
        authEventsEmitter.emit({ type: "authenticated" });
      }
      return true;
    } catch (error) {
      auth.setToken(null);
      return false;
    }
  }

  // this function might attempt the fetch multiple times, if token is not expired, but a 401 is received.
  async function doFetch(path: string, init?: RequestInit): Promise<Response> {
    const NUMBER_OF_ATTEMPTS = 2;
    let unauthReason: UnauthenticatedReason | undefined;

    for (let i = 0; i < NUMBER_OF_ATTEMPTS; i++) {
      if (auth.isTokenExpired()) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          unauthReason = "refresh_failed";
          break;
        }
      }

      const headers = new Headers(init?.headers ?? {});
      headers.set("Authorization", `Bearer ${auth.getToken()}`);
      const res = await fetch(url(path), {
        ...init,
        headers,
      });

      if (res.status === 401) {
        auth.setToken(null);
        unauthReason = "unauthorized";
        continue;
      }

      return res;
    }

    const reason = unauthReason ?? "unauthorized";
    auth.setToken(null);
    authEventsEmitter.emit({ type: "unauthenticated", reason });
    throw new UnauthenticatedError("Unauthenticated", reason);
  }

  // ---------- Auth API ----------
  async function exchangeDiscordCode(code: string): Promise<AuthGrantResponse> {
    const res = await fetch(url("/v1/auth/discord-exchange"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const err = new Error(body.error ?? "Failed to exchange Discord code") as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    const data = (await res.json()) as AuthGrantResponse;
    if (data.access_token) {
      auth.setToken(data.access_token);
      authEventsEmitter.emit({ type: "authenticated" });
    }
    return data;
  }

  async function logout(): Promise<void> {
    const res = await doFetch("/v1/auth/logout", { method: "POST", credentials: "include" });
    if (!res.ok && res.status !== 401) throw new Error("Failed to logout");
    auth.setToken(null);
    authEventsEmitter.emit({ type: "unauthenticated", reason: "logout" });
  }

  async function fetchMe(): Promise<AuthMeResponse> {
    const res = await doFetch("/v1/auth/me");
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
  }

  // ---------- Tracks API ----------
  async function fetchTracks(params: TrackFetchParams = {}): Promise<PaginatedResponse<ApiTrack>> {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.set(k, String(v));
    });
    const res = await doFetch(`/v1/tracks${sp.toString() ? `?${sp}` : ""}`);
    if (!res.ok) throw new Error("Failed to fetch tracks");
    return res.json();
  }

  async function suggestTracks(q: string, limit = 10): Promise<TrackSuggestionResponse> {
    const trimmed = q.trim();
    if (!trimmed) return { suggestions: [], took_ms: 0 };
    const sp = new URLSearchParams({ q: trimmed, limit: String(limit) });
    const res = await doFetch(`/v1/tracks/suggest?${sp}`);
    if (!res.ok) throw new Error("Failed to fetch suggestions");
    return res.json();
  }

  const getStreamUrl = (trackId: number | string) => `${baseUrl}/v1/tracks/${encodeURIComponent(trackId)}/stream`;

  return {
    baseUrl,
    authEvents,
    auth: { exchangeDiscordCode, logout, fetchMe },
    tracks: { fetch: fetchTracks, suggest: suggestTracks, streamUrl: getStreamUrl },
    fetch: doFetch,
  };
}
