import request from "supertest";
import { appFactory } from "../../src/app";
import { seedUsers } from "../seeds/seedUsers";
import { seedTracks } from "../seeds/seedTracks";
import { Kysely } from "kysely";
import { Database } from "../../src/db/schema";
import { dbFactory } from "../../src/db/connection";
import { Express } from "express";
import { configFactory } from "../../src/config/config";
import { i32IdCheck, getLoginTokenAndTestResult, fixturePath } from "../utils";
import { GenericContainer, StartedTestContainer, Wait } from "testcontainers";
import { Storage } from "@google-cloud/storage";
import { tracksBucketFactory } from "../../src/storage/tracksBucket";
import { user_login } from "../seeds/seedUsers";
import fs from "fs";

let db: Kysely<Database>;
let app: Express;
let gcsContainer: StartedTestContainer;

beforeAll(async () => {
  const GCS_PORT = 4443;
  gcsContainer = await new GenericContainer("fsouza/fake-gcs-server")
    .withExposedPorts(GCS_PORT)
    .withCommand(["-scheme", "http"])
    .withWaitStrategy(Wait.forHttp("/", GCS_PORT))
    .start();
  const gcsPort = gcsContainer.getMappedPort(GCS_PORT);
  process.env.GCP_API_ENDPOINT = `http://localhost:${gcsPort}`;
  const storage = new Storage({ apiEndpoint: process.env.GCP_API_ENDPOINT });
  process.env.GCP_TRACKS_BUCKET_NAME = "kevbot-tracks-testing";
  await storage.createBucket(process.env.GCP_TRACKS_BUCKET_NAME);

  process.env.KEVBOT_API_ADDRESS = "0.0.0.0";
  process.env.KEVBOT_API_JWT_SECRET = "jwt_secret";
  process.env.KEVBOT_API_PORT = "3000";
  const { config, secrets } = configFactory();
  const tracksBucket = tracksBucketFactory(secrets.GCP_API_ENDPOINT, secrets.GCP_TRACKS_BUCKET_NAME);
  db = dbFactory(secrets.DB_CONNECTION_STRING);
  app = appFactory(config, secrets, db, tracksBucket);
  await seedUsers(db);
  await seedTracks(db);
}, 120000);

afterAll(async () => {
  await db.destroy();
  await gcsContainer.stop();
});

describe("GET /v1/tracks", () => {
  it("should return a list of tracks", async () => {
    const res = await request(app).get("/v1/tracks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: 23,
        name: "happynewyear",
        created_at: "2024-12-11T07:21:03.000Z",
        user_id: 1337,
        duration: 5.328,
        updated_at: "2024-12-11T07:21:03.000Z",
        deleted_at: null,
        raw_total_play_count: 0,
        total_play_count: 0,
      },
      {
        id: 40,
        name: "yes",
        created_at: "2024-12-11T08:21:03.000Z",
        user_id: 1,
        duration: 3.713,
        updated_at: "2024-12-11T08:21:03.000Z",
        deleted_at: null,
        raw_total_play_count: 0,
        total_play_count: 0,
      },
    ]);
  });

  it("should return a filtered list of tracks based on name", async () => {
    const res = await request(app).get("/v1/tracks?name=happynewyear");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: 23,
        name: "happynewyear",
        created_at: "2024-12-11T07:21:03.000Z",
        user_id: 1337,
        duration: 5.328,
        updated_at: "2024-12-11T07:21:03.000Z",
        deleted_at: null,
        raw_total_play_count: 0,
        total_play_count: 0,
      },
    ]);
  });

  it("should return a filtered list of tracks based on name", async () => {
    const res = await request(app).get("/v1/tracks?name=happynewyear");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: 23,
        name: "happynewyear",
        created_at: "2024-12-11T07:21:03.000Z",
        user_id: 1337,
        duration: 5.328,
        updated_at: "2024-12-11T07:21:03.000Z",
        deleted_at: null,
        raw_total_play_count: 0,
        total_play_count: 0,
      },
    ]);
  });

  it("should return empty list because include deleted is false", async () => {
    const res = await request(app).get("/v1/tracks?name=deletedtrack");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should return a filtered list of tracks based on name and include deleted", async () => {
    const res = await request(app).get("/v1/tracks?name=deletedtrack&include_deleted=true");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: 50,
        name: "deletedtrack",
        created_at: "2024-12-11T08:21:03.000Z",
        user_id: 1,
        duration: 4.713,
        updated_at: expect.any(String),
        deleted_at: expect.any(String),
        raw_total_play_count: 0,
        total_play_count: 0,
      },
    ]);
  });

  it("returns error if invalid query parameter is provided", async () => {
    const res = await request(app).get("/v1/tracks?dne=hello");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*dne/i);
  });
});

describe("GET /v1/tracks/:id", () => {
  it("should enforce i32 id", async () => {
    await i32IdCheck(async (id: any) => {
      return request(app).get(`/v1/tracks/${id}`);
    });
  });

  it("should return 200 and the track", async () => {
    const res = await request(app).get("/v1/tracks/23");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 23,
      name: "happynewyear",
      created_at: "2024-12-11T07:21:03.000Z",
      user_id: 1337,
      duration: 5.328,
      updated_at: "2024-12-11T07:21:03.000Z",
      deleted_at: null,
      raw_total_play_count: 0,
      total_play_count: 0,
    });
  });

  it("returns not found if invalid track id is provided", async () => {
    const res = await request(app).get("/v1/tracks/404");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ statusCode: 404, error: "Not Found", message: expect.any(String) });
    expect(res.body?.message).toMatch(/track not found/i);
  });
});

describe("POST /v1/tracks/", () => {
  it("should upload track and return metadata", async () => {
    const filePath = fixturePath("boysareback.mp3");
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .post("/v1/tracks")
      .field("name", "boysareback")
      .attach("file", filePath)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 51,
      name: "boysareback",
      created_at: expect.any(String),
      user_id: 1,
      duration: 4.392,
      updated_at: expect.any(String),
      deleted_at: null,
      raw_total_play_count: 0,
      total_play_count: 0,
    });
  });

  it("returns error if no name is provided", async () => {
    const filePath = fixturePath("boysareback.mp3");
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .post("/v1/tracks")
      .attach("file", filePath)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*required.*name/i);
  });

  it("returns error if track name has upper-case letters", async () => {
    const filePath = fixturePath("boysareback.mp3");
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .post("/v1/tracks")
      .field("name", "Boysareback")
      .attach("file", filePath)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*track name/i);
  });

  it("returns error if track name has special characters", async () => {
    const filePath = fixturePath("boysareback.mp3");
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .post("/v1/tracks")
      .field("name", "boysareback!")
      .attach("file", filePath)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*track name/i);
  });

  it("returns error if track name has spaces", async () => {
    const filePath = fixturePath("boysareback.mp3");
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .post("/v1/tracks")
      .field("name", "boys are back")
      .attach("file", filePath)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*track name/i);
  });

  it("returns error if no file is given", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .post("/v1/tracks")
      .field("name", "boysareback")
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/file is required/i);
  });

  it("returns error if name is taken", async () => {
    const filePath = fixturePath("boysareback.mp3");
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .post("/v1/tracks")
      .field("name", "boysareback")
      .attach("file", filePath)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ statusCode: 409, error: "Conflict", message: expect.any(String) });
    expect(res.body?.message).toMatch(/track name is already taken/i);
  });

  it("returns error if file is not an mp3", async () => {
    const filePath = fixturePath("notanmp3.txt");
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .post("/v1/tracks")
      .field("name", "notanmp3")
      .attach("file", filePath)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/invalid file extension/i);
  });

  it("returns error if file is not a valid mp3 file, but has the extension", async () => {
    const filePath = fixturePath("fakemp3.mp3");
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .post("/v1/tracks")
      .field("name", "fakemp3")
      .attach("file", filePath)
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/unsupported or corrupt file was received/i);
  });

  it("returns error if not authenticated", async () => {
    const filePath = fixturePath("boysareback.mp3");
    // Connection keep-alive is needed to prevent random "write EPIPE" errors
    const res = await request(app)
      .post("/v1/tracks")
      .field("name", "boysareback")
      .attach("file", filePath)
      .set("Connection", "keep-alive");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ statusCode: 401, error: "Unauthorized", message: expect.any(String) });
    expect(res.body?.message).toMatch(/access token is missing/i);
  });
});

describe("GET /v1/tracks/:id/download", () => {
  it("should enforce i32 id", async () => {
    await i32IdCheck(async (id: any) => {
      return request(app).get(`/v1/tracks/${id}/download`);
    });
  });

  it("should download the track successfully", async () => {
    const res = await request(app)
      .get(`/v1/tracks/51/download`)
      .expect("Content-Type", "audio/mpeg")
      .expect("Content-Disposition", 'attachment; filename="boysareback.mp3"')
      .expect(200);
    const fixtureBuffer = fs.readFileSync(fixturePath("boysareback_normalized.mp3"));
    expect(res.body.equals(fixtureBuffer)).toBe(true);
  });

  it("returns not found if track does not exist", async () => {
    const res = await request(app).get(`/v1/tracks/99/download`).expect(404);
    expect(res.body).toEqual({ statusCode: 404, error: "Not Found", message: expect.any(String) });
    expect(res.body?.message).toMatch(/track not found/i);
  });
});

describe("GET /v1/tracks/:id/stream", () => {
  it("should enforce i32 id", async () => {
    await i32IdCheck(async (id: any) => {
      return request(app).get(`/v1/tracks/${id}/stream`);
    });
  });

  it("should stream the track successfully", async () => {
    const res = await request(app)
      .get(`/v1/tracks/51/stream`)
      .expect("Content-Type", "audio/mpeg")
      .expect("Accept-Ranges", "bytes")
      .expect("Content-Disposition", 'inline; filename="boysareback.mp3"')
      .expect(200);
    const fixtureBuffer = fs.readFileSync(fixturePath("boysareback_normalized.mp3"));
    expect(res.body.equals(fixtureBuffer)).toBe(true);
  });

  it("should support range requests", async () => {
    const res = await request(app)
      .get(`/v1/tracks/51/stream`)
      .set("Range", "bytes=0-1023")
      .expect("Content-Type", "audio/mpeg")
      .expect("Accept-Ranges", "bytes")
      .expect("Content-Disposition", 'inline; filename="boysareback.mp3"')
      .expect("Content-Length", "1024")
      .expect(206);
    expect(res.headers["content-range"]).toMatch(/bytes 0-1023\/\d+/);
    expect(res.body.length).toBe(1024);
  });

  it("returns not found if track does not exist", async () => {
    const res = await request(app).get(`/v1/tracks/99/download`).expect(404);
    expect(res.body).toEqual({ statusCode: 404, error: "Not Found", message: expect.any(String) });
    expect(res.body?.message).toMatch(/track not found/i);
  });

  it("returns error if range provided is not valid", async () => {
    const res = await request(app).get(`/v1/tracks/51/stream`).set("Range", "bytes=0-1000000000000").expect(416);
    expect(res.body).toEqual({
      statusCode: 416,
      error: "Requested Range Not Satisfiable",
      message: expect.any(String),
    });
    expect(res.body?.message).toMatch(/requested range not satisfiable \d*-\d*/i);
  });
});

describe("PATCH /v1/tracks/:id", () => {
  it("should enforce i32 id", async () => {
    await i32IdCheck(async (id: any) => {
      const jwtToken = await getLoginTokenAndTestResult(user_login, app);
      return request(app).patch(`/v1/tracks/${id}`).set("Authorization", `Bearer ${jwtToken}`);
    });
  });

  it("should change track name successfully", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .patch(`/v1/tracks/51`)
      .send({ name: "boysrback" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(200);
    expect(res.body).toEqual({
      id: 51,
      name: "boysrback",
      created_at: expect.any(String),
      user_id: 1,
      duration: 4.392,
      updated_at: expect.any(String),
      deleted_at: null,
      raw_total_play_count: 0,
      total_play_count: 0,
    });
  });

  it("should change track name back successfully, and should be idempotent", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    let res = await request(app)
      .patch(`/v1/tracks/51`)
      .send({ name: "boysareback" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(200);
    res = await request(app)
      .patch(`/v1/tracks/51`)
      .send({ name: "boysareback" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(200);
    expect(res.body).toEqual({
      id: 51,
      name: "boysareback",
      created_at: expect.any(String),
      user_id: 1,
      duration: 4.392,
      updated_at: expect.any(String),
      deleted_at: null,
      raw_total_play_count: 0,
      total_play_count: 0,
    });
  });

  it("returns error if no name is provided", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app).patch(`/v1/tracks/51`).set("Authorization", `Bearer ${jwtToken}`).expect(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*required/i);
  });

  it("returns error if track name has upper-case letters", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .patch(`/v1/tracks/51`)
      .send({ name: "Boysareback" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*track name/i);
  });

  it("returns error if track name has special characters", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .patch(`/v1/tracks/51`)
      .send({ name: "boysareback!" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*track name/i);
  });

  it("returns error if track name has spaces", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .patch(`/v1/tracks/51`)
      .send({ name: "boys are back" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*track name/i);
  });

  it("returns error if track name is already taken", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .patch(`/v1/tracks/51`)
      .send({ name: "happynewyear" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(409);
    expect(res.body).toEqual({ statusCode: 409, error: "Conflict", message: expect.any(String) });
    expect(res.body?.message).toMatch(/track name is already taken/i);
  });

  it("returns error if user does not have permissions to change it", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .patch(`/v1/tracks/23`)
      .send({ name: "nopermission" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(403);
    expect(res.body).toEqual({ statusCode: 403, error: "Forbidden", message: expect.any(String) });
    expect(res.body?.message).toMatch(/permission.*modify.*track/i);
  });

  it("returns error if track is not found", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .patch(`/v1/tracks/24`)
      .send({ name: "notfound" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(404);
    expect(res.body).toEqual({ statusCode: 404, error: "Not Found", message: expect.any(String) });
    expect(res.body?.message).toMatch(/track not found/i);
  });
});

describe("DELETE /v1/tracks/:id", () => {
  it("should enforce i32 id", async () => {
    await i32IdCheck(async (id: any) => {
      const jwtToken = await getLoginTokenAndTestResult(user_login, app);
      return request(app).delete(`/v1/tracks/${id}`).set("Authorization", `Bearer ${jwtToken}`);
    });
  });

  it("should soft delete track successfully, and be idempotent", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    let res = await request(app).delete(`/v1/tracks/51`).set("Authorization", `Bearer ${jwtToken}`).expect(200);
    res = await request(app).delete(`/v1/tracks/51`).set("Authorization", `Bearer ${jwtToken}`).expect(200);
    expect(res.body).toEqual({
      id: 51,
      name: "boysareback",
      created_at: expect.any(String),
      user_id: 1,
      duration: 4.392,
      updated_at: expect.any(String),
      deleted_at: expect.any(String),
      raw_total_play_count: 0,
      total_play_count: 0,
    });
  });

  it("returns error if user does not have permissions to change it", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app).delete(`/v1/tracks/23`).set("Authorization", `Bearer ${jwtToken}`).expect(403);
    expect(res.body).toEqual({ statusCode: 403, error: "Forbidden", message: expect.any(String) });
    expect(res.body?.message).toMatch(/permission.*modify.*track/i);
  });

  it("returns error if track is not found", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app).delete(`/v1/tracks/24`).set("Authorization", `Bearer ${jwtToken}`).expect(404);
    expect(res.body).toEqual({ statusCode: 404, error: "Not Found", message: expect.any(String) });
    expect(res.body?.message).toMatch(/track not found/i);
  });
});

describe("PATCH /v1/tracks/:id/restore", () => {
  it("should enforce i32 id", async () => {
    await i32IdCheck(async (id: any) => {
      const jwtToken = await getLoginTokenAndTestResult(user_login, app);
      return request(app).patch(`/v1/tracks/${id}/restore`).set("Authorization", `Bearer ${jwtToken}`);
    });
  });

  it("should restore track successfully, and be idempotent", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    let res = await request(app)
      .patch(`/v1/tracks/51/restore`)
      .send({})
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(200);
    res = await request(app)
      .patch(`/v1/tracks/51/restore`)
      .send({})
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(200);
    expect(res.body).toEqual({
      id: 51,
      name: "boysareback",
      created_at: expect.any(String),
      user_id: 1,
      duration: 4.392,
      updated_at: expect.any(String),
      deleted_at: null,
      raw_total_play_count: 0,
      total_play_count: 0,
    });
  });

  it("should restore with a name change", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    let res = await request(app).delete(`/v1/tracks/51`).set("Authorization", `Bearer ${jwtToken}`).expect(200);
    res = await request(app)
      .patch(`/v1/tracks/51/restore`)
      .send({ name: "boysarerestored" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(200);
    expect(res.body).toEqual({
      id: 51,
      name: "boysarerestored",
      created_at: expect.any(String),
      user_id: 1,
      duration: 4.392,
      updated_at: expect.any(String),
      deleted_at: null,
      raw_total_play_count: 0,
      total_play_count: 0,
    });
  });

  it("returns error if track name has upper-case letters", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    let res = await request(app).delete(`/v1/tracks/51`).set("Authorization", `Bearer ${jwtToken}`).expect(200);
    res = await request(app)
      .patch(`/v1/tracks/51/restore`)
      .send({ name: "Boysareback" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*track name/i);
  });

  it("returns error if track name has special characters", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    let res = await request(app).delete(`/v1/tracks/51`).set("Authorization", `Bearer ${jwtToken}`).expect(200);
    res = await request(app)
      .patch(`/v1/tracks/51/restore`)
      .send({ name: "boysareback!" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*track name/i);
  });

  it("returns error if track name has spaces", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    let res = await request(app).delete(`/v1/tracks/51`).set("Authorization", `Bearer ${jwtToken}`).expect(200);
    res = await request(app)
      .patch(`/v1/tracks/51/restore`)
      .send({ name: "boys are back" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*track name/i);
  });

  it("returns error if track name is already taken", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    let res = await request(app).delete(`/v1/tracks/51`).set("Authorization", `Bearer ${jwtToken}`).expect(200);
    res = await request(app)
      .patch(`/v1/tracks/51/restore`)
      .send({ name: "happynewyear" })
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(409);
    expect(res.body).toEqual({ statusCode: 409, error: "Conflict", message: expect.any(String) });
    expect(res.body?.message).toMatch(/track name is already taken/i);
  });

  it("returns error if user does not have permissions to change it", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .patch(`/v1/tracks/23/restore`)
      .send({})
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(403);
    expect(res.body).toEqual({ statusCode: 403, error: "Forbidden", message: expect.any(String) });
    expect(res.body?.message).toMatch(/permission.*modify.*track/i);
  });

  it("returns error if track is not found", async () => {
    const jwtToken = await getLoginTokenAndTestResult(user_login, app);
    const res = await request(app)
      .patch(`/v1/tracks/24/restore`)
      .send({})
      .set("Authorization", `Bearer ${jwtToken}`)
      .expect(404);
    expect(res.body).toEqual({ statusCode: 404, error: "Not Found", message: expect.any(String) });
    expect(res.body?.message).toMatch(/track not found/i);
  });
});
