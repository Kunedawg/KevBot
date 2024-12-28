import request from "supertest";
import { appFactory } from "../../src/app";
import { seedUsers } from "../seeds/seedUsers";
import { Kysely } from "kysely";
import { Database } from "../../src/db/schema";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Config, configFactory } from "../../src/config/config";
import { Bucket } from "@google-cloud/storage";
import { dbFactory } from "../../src/db/connection";
import { Express } from "express";

let db: Kysely<Database>;
const TEST_API_JWT_SECRET = "TEST_API_JWT_SECRET";
let app: Express;
let config: Config;

beforeAll(async () => {
  process.env.GCP_TRACKS_BUCKET_NAME = "dummy";
  process.env.KEVBOT_API_ADDRESS = "0.0.0.0";
  process.env.KEVBOT_API_JWT_SECRET = TEST_API_JWT_SECRET;
  process.env.KEVBOT_API_PORT = "3000";
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

describe("POST /v1/auth/login", () => {
  it("should return jwt encoded username and id", async () => {
    const user = { username: "mr_anderson", password: "Testpw1!" };
    const res = await request(app).post("/v1/auth/login").send(user);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: expect.any(String) });
    const decoded = jwt.verify(res.body.token, TEST_API_JWT_SECRET) as JwtPayload;
    expect(decoded).toEqual({ exp: expect.any(Number), iat: expect.any(Number), username: user.username, id: 1 });
    expect(config.jwtTokenExpirationTime).toBe("1h");
    expect((decoded.exp as number) - (decoded.iat as number)).toEqual(3600);
  });

  it("returns error if no username is provided", async () => {
    const user = { password: "Testpw1!" };
    const res = await request(app).post("/v1/auth/login").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*username/i);
  });

  it("returns error if no password is provided", async () => {
    const user = { username: "mr_anderson" };
    const res = await request(app).post("/v1/auth/login").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*password/i);
  });

  it("returns error if user does not exist", async () => {
    const user = { username: "mr_anderson5", password: "Testpw1!" };
    const res = await request(app).post("/v1/auth/login").send(user);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ statusCode: 401, error: "Unauthorized", message: expect.any(String) });
    expect(res.body?.message).toMatch(/invalid username or password/i);
  });

  it("returns error if user does not exist", async () => {
    const user = { username: "mr_anderson", password: "wrong_password!" };
    const res = await request(app).post("/v1/auth/login").send(user);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ statusCode: 401, error: "Unauthorized", message: expect.any(String) });
    expect(res.body?.message).toMatch(/invalid username or password/i);
  });
});

describe("POST /v1/auth/register", () => {
  it("should return new user", async () => {
    const user = { username: "new_user1", password: "Testpw1!" };
    const res = await request(app).post("/v1/auth/register").send(user);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(Number),
      discord_id: null,
      discord_username: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
      username: "new_user1",
    });
  });

  it("returns error if no username is provided", async () => {
    const user = { password: "Testpw1!" };
    const res = await request(app).post("/v1/auth/register").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*username/i);
  });

  it("returns error if username is taken", async () => {
    const user = { username: "new_user1", password: "Testpw1!" };
    const res = await request(app).post("/v1/auth/register").send(user);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ statusCode: 409, error: "Conflict", message: expect.any(String) });
    expect(res.body?.message).toMatch(/username is already taken/i);
  });

  it("returns error if username has upper case", async () => {
    const user = { username: "New_user1", password: "Testpw1!" };
    const res = await request(app).post("/v1/auth/register").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*username/i);
  });

  it("returns error if username has special character", async () => {
    const user = { username: "new_user1!", password: "Testpw1!" };
    const res = await request(app).post("/v1/auth/register").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*username/i);
  });

  it("returns error if no password is provided", async () => {
    const user = { username: "new_user2" };
    const res = await request(app).post("/v1/auth/register").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*password.*required/i);
  });

  it("returns error if password is too short", async () => {
    // could improve this test by using the password length programmatically
    const user = { username: "new_user2", password: "Testp1!" };
    const res = await request(app).post("/v1/auth/register").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*password must be at least 8 characters long/i);
    expect(config.minPasswordLength).toBe(8);
  });

  it("returns error if password is too long", async () => {
    // could improve this test by using the password length programmatically
    const user = {
      username: "new_user2",
      password: "Testpw1!aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    };
    const res = await request(app).post("/v1/auth/register").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*password must be 64 characters or fewer/i);
  });

  it("returns error if password has no lowercase letter", async () => {
    const user = { username: "new_user2", password: "TESTPW1!" };
    const res = await request(app).post("/v1/auth/register").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*password.*lower/i);
    expect(config.minPasswordLength).toBe(8);
  });

  it("returns error if password has no uppercase letter", async () => {
    const user = { username: "new_user2", password: "testpw1!" };
    const res = await request(app).post("/v1/auth/register").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*password.*upper/i);
    expect(config.minPasswordLength).toBe(8);
  });

  it("returns error if password has no special character", async () => {
    const user = { username: "new_user2", password: "Testpw11" };
    const res = await request(app).post("/v1/auth/register").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*password.*special/i);
    expect(config.minPasswordLength).toBe(8);
  });

  it("returns error if password has no number", async () => {
    const user = { username: "new_user2", password: "Testpw!!" };
    const res = await request(app).post("/v1/auth/register").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*password.*number/i);
    expect(config.minPasswordLength).toBe(8);
  });

  it("returns error if password contains a space", async () => {
    const user = { username: "new_user2", password: "Test pw1!" };
    const res = await request(app).post("/v1/auth/register").send(user);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*password.*space/i);
    expect(config.minPasswordLength).toBe(8);
  });
});
