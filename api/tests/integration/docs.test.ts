import request from "supertest";
import { appFactory } from "../../src/app";
import { Kysely } from "kysely";
import { Database } from "../../src/db/schema";
import { dbFactory } from "../../src/db/connection";
import { Express } from "express";
import { configFactory } from "../../src/config/config";
import { Bucket } from "@google-cloud/storage";

let db: Kysely<Database>;
let app: Express;

beforeAll(async () => {
  process.env.GCP_TRACKS_BUCKET_NAME = "dummy";
  process.env.KEVBOT_API_ADDRESS = "0.0.0.0";
  process.env.KEVBOT_API_JWT_SECRET = "jwt_secret";
  process.env.KEVBOT_API_PORT = "3000";
  process.env.GCP_API_ENDPOINT = "dummy";
  const { config, secrets } = configFactory();
  const dummyTracksBucket = {} as Bucket;
  db = dbFactory(secrets.DB_CONNECTION_STRING);
  app = appFactory(config, secrets, db, dummyTracksBucket);
});

afterAll(async () => {
  await db.destroy();
});

describe("GET /v1/docs", () => {
  it("should return 200 and html", async () => {
    await request(app).get("/v1/docs/").expect("Content-type", /html/).expect(200);
  });
});
