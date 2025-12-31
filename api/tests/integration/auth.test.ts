import request from "supertest";
import { Express } from "express";
import { Bucket } from "@google-cloud/storage";
import { Kysely } from "kysely";
import { appFactory } from "../../src/app";
import { configFactory, Config } from "../../src/config/config";
import { dbFactory } from "../../src/db/connection";
import { Database } from "../../src/db/schema";
import { seedUsers } from "../seeds/seedUsers";

const TEST_API_JWT_SECRET = "TEST_API_JWT_SECRET";
const DEV_AUTH_SECRET = "TEST_DEV_AUTH_SECRET";
const BOT_AUTH_KEY = "TEST_BOT_AUTH_KEY";

let db: Kysely<Database>;
let app: Express;
let config: Config;

function extractCookie(res: request.Response, cookieName: string): string | undefined {
  const rawCookies = res.get("set-cookie");
  const cookies = Array.isArray(rawCookies) ? rawCookies : rawCookies ? [rawCookies] : [];
  const cookiePrefix = `${cookieName}=`;
  const cookie = cookies.find((value) => value.startsWith(cookiePrefix));
  return cookie;
}

async function createDevSession(body: { user_id?: number; discord_id?: string } = { user_id: 1 }) {
  return await request(app).post("/v1/dev/sessions").set("x-dev-auth-secret", DEV_AUTH_SECRET).send(body);
}

beforeAll(async () => {
  // TODO: improve management of environment variables
  process.env.NODE_ENV = "test";
  process.env.GCP_TRACKS_BUCKET_NAME = "dummy";
  process.env.KEVBOT_API_ADDRESS = "0.0.0.0";
  process.env.KEVBOT_API_JWT_SECRET = TEST_API_JWT_SECRET;
  process.env.KEVBOT_API_PORT = "3000";
  process.env.GCP_API_ENDPOINT = "dummy";
  process.env.BOT_AUTH_API_KEY = BOT_AUTH_KEY;
  process.env.DEV_ROUTES_ALLOWED = "true";
  process.env.DEV_AUTH_SECRET = DEV_AUTH_SECRET;
  process.env.AUTH_ACCESS_TOKEN_TTL_MINUTES = "15";
  process.env.AUTH_REFRESH_SESSION_TTL_DAYS = "90";
  process.env.AUTH_REFRESH_COOKIE_PATH = "/v1/auth";
  process.env.DISCORD_OAUTH2_REDIRECT_URI = "http://dummy.com";
  process.env.DISCORD_OAUTH2_CLIENT_ID = "dummy";
  process.env.DISCORD_OAUTH2_CLIENT_SECRET = "dummy";

  const appConfig = configFactory();
  config = appConfig.config;
  const dummyTracksBucket = {} as Bucket;
  db = dbFactory(appConfig.secrets.DB_CONNECTION_STRING);
  app = appFactory(config, appConfig.secrets, db, dummyTracksBucket);
  await seedUsers(db);
});

afterAll(async () => {
  await db.destroy();
});

describe("GET /v1/auth/me", () => {
  it("returns the authenticated user when provided a valid token", async () => {
    const sessionResponse = await createDevSession();
    const accessToken = sessionResponse.body.access_token as string;

    const res = await request(app).get("/v1/auth/me").set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      user: {
        id: 1,
        discord_id: "123711472041781240",
        discord_username: "mr_anderson",
        discord_avatar_hash: null,
        created_at: "2024-11-11T07:21:03.000Z",
        updated_at: "2024-11-11T07:21:03.000Z",
      },
      role: "user",
      session_id: expect.any(String),
    });
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).get("/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ statusCode: 401, error: "Unauthorized", message: expect.any(String) });
  });
});

describe("POST /v1/auth/refresh", () => {
  it("issues a new access token when provided a valid refresh cookie", async () => {
    const sessionResponse = await createDevSession();
    const refreshCookie = extractCookie(sessionResponse, config.authRefreshCookieName);
    expect(refreshCookie).toBeDefined();

    const res = await request(app).post("/v1/auth/refresh").set("Cookie", refreshCookie!);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      access_token: expect.any(String),
      token_type: "Bearer",
      expires_in: config.authAccessTokenTtlMinutes * 60,
      user: { id: 1 },
    });

    const newRefreshCookie = extractCookie(res, config.authRefreshCookieName);
    expect(newRefreshCookie).toBeDefined();
  });

  it("returns 401 when refresh cookie missing", async () => {
    const res = await request(app).post("/v1/auth/refresh");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ statusCode: 401, error: "Unauthorized", message: expect.any(String) });
  });
});

describe("POST /v1/auth/logout", () => {
  it("revokes the current session and clears the cookie", async () => {
    const sessionResponse = await createDevSession();
    const refreshCookie = extractCookie(sessionResponse, config.authRefreshCookieName);
    expect(refreshCookie).toBeDefined();

    const res = await request(app).post("/v1/auth/logout").set("Cookie", refreshCookie!);

    expect(res.status).toBe(204);
    const clearedCookie = extractCookie(res, config.authRefreshCookieName);
    expect(clearedCookie).toBeDefined();
    expect(clearedCookie).toMatch(/expires=/i);
  });

  it("is idempotent when the refresh cookie is missing", async () => {
    const res = await request(app).post("/v1/auth/logout");
    expect(res.status).toBe(204);
  });
});

describe("POST /v1/bot/auth", () => {
  it("issues a bot token when the API key matches", async () => {
    const res = await request(app).post("/v1/bot/auth").set("x-bot-key", BOT_AUTH_KEY);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      access_token: expect.any(String),
      token_type: "Bearer",
      expires_in: expect.any(Number),
      role: "bot",
    });
  });

  it("rejects invalid API keys", async () => {
    const res = await request(app).post("/v1/bot/auth").set("x-bot-key", "wrong");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ statusCode: 401, error: "Unauthorized", message: expect.any(String) });
  });
});
