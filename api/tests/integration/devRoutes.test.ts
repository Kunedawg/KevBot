import request from "supertest";
import { Express } from "express";
import { Bucket } from "@google-cloud/storage";
import { Kysely } from "kysely";
import jwt, { JwtPayload } from "jsonwebtoken";
import { appFactory } from "../../src/app";
import { configFactory, Config } from "../../src/config/config";
import { dbFactory } from "../../src/db/connection";
import { Database } from "../../src/db/schema";
import { seedUsers } from "../seeds/seedUsers";

const DEV_AUTH_SECRET = "TEST_DEV_AUTH_SECRET";
const JWT_SECRET = "jwt_secret";

let discordIdCounter = 0;
const nextDiscordId = () => `1${(Date.now() + discordIdCounter++).toString().padEnd(17, "0")}`.slice(0, 18);

let db: Kysely<Database>;
let app: Express;
let config: Config;

describe("Dev routes", () => {
  beforeAll(async () => {
    // TODO: improve management of environment variables
    process.env.NODE_ENV = "test";
    process.env.GCP_TRACKS_BUCKET_NAME = "dummy";
    process.env.KEVBOT_API_ADDRESS = "0.0.0.0";
    process.env.KEVBOT_API_JWT_SECRET = JWT_SECRET;
    process.env.KEVBOT_API_PORT = "3000";
    process.env.GCP_API_ENDPOINT = "dummy";
    process.env.BOT_AUTH_API_KEY = "test-bot-key";
    process.env.DEV_ROUTES_ALLOWED = "true";
    process.env.DEV_AUTH_SECRET = DEV_AUTH_SECRET;
    process.env.AUTH_ACCESS_TOKEN_TTL_MINUTES = "15";
    process.env.DISCORD_OAUTH2_REDIRECT_URI = "http://dummy.com";
    process.env.DISCORD_OAUTH2_CLIENT_ID = "dummy";
    process.env.DISCORD_OAUTH2_CLIENT_SECRET = "dummy";

    const appConfig = configFactory();
    config = appConfig.config;

    db = dbFactory(appConfig.secrets.DB_CONNECTION_STRING);
    const dummyTracksBucket = {} as Bucket;
    app = appFactory(config, appConfig.secrets, db, dummyTracksBucket);

    await seedUsers(db);
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe("POST /v1/dev/users", () => {
    const postDevUser = () => request(app).post("/v1/dev/users").set(config.devAuthHeader, DEV_AUTH_SECRET);

    it("creates a user with the provided discord metadata", async () => {
      const discordId = nextDiscordId();
      const res = await postDevUser().send({ discord_id: discordId, discord_username: "seed_user" });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: expect.any(Number),
        discord_id: discordId,
        discord_username: "seed_user",
        discord_avatar_hash: null,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it("accepts an avatar hash", async () => {
      const discordId = nextDiscordId();
      const res = await postDevUser().send({
        discord_id: discordId,
        discord_username: "avatar_user",
        discord_avatar_hash: "abc123",
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        id: expect.any(Number),
        discord_id: discordId,
        discord_username: "avatar_user",
        discord_avatar_hash: "abc123",
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it("rejects duplicate discord_id values", async () => {
      const discordId = nextDiscordId();
      await postDevUser().send({ discord_id: discordId, discord_username: "unique_user" }).expect(201);

      const res = await postDevUser().send({ discord_id: discordId, discord_username: "other_user" });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        statusCode: 409,
        error: "Conflict",
        message: "Discord ID is already taken",
      });
    });

    it("requires the dev auth secret", async () => {
      const res = await request(app).post("/v1/dev/users").send({ discord_id: nextDiscordId() });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid dev auth secret",
      });
    });
  });

  describe("POST /v1/dev/sessions", () => {
    const postDevSession = () => request(app).post("/v1/dev/sessions").set(config.devAuthHeader, DEV_AUTH_SECRET);

    it("issues a session for a user_id and sets the refresh cookie", async () => {
      const res = await postDevSession().send({ user_id: 1 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        access_token: expect.any(String),
        token_type: "Bearer",
        expires_in: config.authAccessTokenTtlMinutes * 60,
        user: { id: 1 },
      });

      const rawCookies = res.get("set-cookie");
      const cookies = Array.isArray(rawCookies) ? rawCookies : rawCookies ? [rawCookies] : [];
      const refreshCookieName = `${config.authRefreshCookieName}=`;
      const refreshCookie = cookies.find((cookie) => cookie.startsWith(refreshCookieName));
      expect(refreshCookie).toBeDefined();
      const sessionId = refreshCookie!.slice(refreshCookieName.length).split(";")[0];
      expect(sessionId).toBeTruthy();

      const payload = jwt.verify(res.body.access_token, JWT_SECRET) as JwtPayload;
      expect(payload.sub).toBe("1");
      expect(payload.role).toBe("user");
      expect(payload.sid).toBe(sessionId);
      expect(payload.aud).toBe(config.authJwtAudience);
      expect(payload.iss).toBe(config.authJwtIssuer);
    });

    it("accepts a discord_id instead of user_id", async () => {
      const res = await postDevSession().send({ discord_id: "135319472041781248" });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        access_token: expect.any(String),
        token_type: "Bearer",
        expires_in: config.authAccessTokenTtlMinutes * 60,
        user: { id: 1337 },
      });
    });

    it("fails when the user cannot be found", async () => {
      const res = await postDevSession().send({ user_id: 999999 });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        statusCode: 404,
        error: "Not Found",
        message: "User not found",
      });
    });

    it("enforces the request schema", async () => {
      const res = await postDevSession().send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        statusCode: 400,
        error: "Bad Request",
        message: expect.stringMatching(/Provide exactly one of user_id or discord_id/),
      });
    });

    it("requires the dev auth secret", async () => {
      const res = await request(app).post("/v1/dev/sessions").send({ user_id: 1 });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid dev auth secret",
      });
    });
  });
});
