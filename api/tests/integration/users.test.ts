import request from "supertest";
import app from "../../src/app";
import { seedUsers } from "../seeds/seedUsers";
import { seedTracks } from "../seeds/seedTracks";
import { seedUserGreetingsAndFarewells } from "../seeds/seedUserGreetingsAndFarewells";
import { seedPlaylists } from "../seeds/seedPlaylists";
import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { Database } from "../../src/db/schema";
import { initDb } from "../../src/db/connection";

let db: Kysely<Database>;

beforeAll(async () => {
  db = new Kysely<Database>({
    dialect: new MysqlDialect({
      pool: createPool({
        uri: process.env.DB_CONNECTION_STRING,
      }),
    }),
  });
  if (!process.env.DB_CONNECTION_STRING) {
    throw Error("DB_CONNECTION_STRING is not defined!");
  }
  initDb(process.env.DB_CONNECTION_STRING);
  await seedUsers(db);
  await seedTracks(db);
  await seedPlaylists(db);
  await seedUserGreetingsAndFarewells(db);
});

afterAll(async () => {
  await db.destroy();
});

describe("GET /v1/users", () => {
  it("should return 200 and a list of users.", async () => {
    const res = await request(app).get("/v1/users");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: 1,
        discord_id: "123711472041781240",
        discord_username: "mr_anderson",
        created_at: "2024-11-11T07:21:03.000Z",
        updated_at: "2024-11-11T07:21:03.000Z",
        username: "mr_anderson",
      },
      {
        id: 1337,
        discord_id: "135319472041781248",
        discord_username: "discord_seed_user",
        created_at: "2024-12-07T04:29:04.000Z",
        updated_at: "2024-12-07T04:29:04.000Z",
        username: null,
      },
    ]);
  });
  // TODO: test filters
  // it("username");
  // it("discordId");
  // it("discordUsername");
  // it("filterAll");
  // it("filterToNone");
  // TODO: error cases
});

async function getLoginTokenAndTestResult(user: { username: string; password: string }) {
  let res = await request(app).post("/v1/auth/login").send(user);
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ token: expect.any(String) });
  return res.body?.token;
}

const ME_USER = { username: "mr_anderson", password: "Testpw1!" };

describe("GET /v1/users/@me", () => {
  it("should return 200 and the user", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    const res = await request(app).get("/v1/users/@me").set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      discord_id: "123711472041781240",
      discord_username: "mr_anderson",
      created_at: "2024-11-11T07:21:03.000Z",
      updated_at: "2024-11-11T07:21:03.000Z",
      username: "mr_anderson",
    });
  });
  // TODO: error cases
});

describe("GET /v1/users/@me/greeting", () => {
  it("should return 200 and the user greeting", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    const res = await request(app).get("/v1/users/@me/greeting").set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      greeting_track_id: 23,
      greeting_playlist_id: null,
    });
  });
  // TODO: error cases
});

describe("GET /v1/users/@me/farewell", () => {
  it("should return 200 and the user farewell", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    const res = await request(app).get("/v1/users/@me/farewell").set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      farewell_track_id: null,
      farewell_playlist_id: 55,
    });
  });
  // TODO: error cases
});

describe("GET /v1/users/:id", () => {
  it("should return 200 and the user", async () => {
    const res = await request(app).get("/v1/users/1");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      discord_id: "123711472041781240",
      discord_username: "mr_anderson",
      created_at: "2024-11-11T07:21:03.000Z",
      updated_at: "2024-11-11T07:21:03.000Z",
      username: "mr_anderson",
    });
  });
  // TODO: error cases
});

describe("GET /v1/users/:id/greeting", () => {
  it("should return 200 and the user greeting", async () => {
    const res = await request(app).get("/v1/users/1/greeting");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      greeting_track_id: 23,
      greeting_playlist_id: null,
    });
  });
  // TODO: error cases
});

describe("GET /v1/users/:id/farewell", () => {
  it("should return 200 and the user farewell", async () => {
    const res = await request(app).get("/v1/users/1/farewell");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      farewell_track_id: null,
      farewell_playlist_id: 55,
    });
  });
  // TODO: error cases
});

describe("PATCH /v1/users/@me", () => {
  it("should update username", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .patch("/v1/users/@me")
      .send({ username: "neo" })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      discord_id: "123711472041781240",
      discord_username: "mr_anderson",
      created_at: "2024-11-11T07:21:03.000Z",
      updated_at: expect.any(String),
      username: "neo",
    });
    res = await request(app)
      .patch("/v1/users/@me")
      .send({ username: "mr_anderson" })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      discord_id: "123711472041781240",
      discord_username: "mr_anderson",
      created_at: "2024-11-11T07:21:03.000Z",
      updated_at: expect.any(String),
      username: "mr_anderson",
    });
  });
  // TODO: error cases
});

describe("PATCH /v1/users/:id", () => {
  it("should update username", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .patch("/v1/users/1")
      .send({ username: "neo" })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      discord_id: "123711472041781240",
      discord_username: "mr_anderson",
      created_at: "2024-11-11T07:21:03.000Z",
      updated_at: expect.any(String),
      username: "neo",
    });
    res = await request(app)
      .patch("/v1/users/1")
      .send({ username: "mr_anderson" })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      discord_id: "123711472041781240",
      discord_username: "mr_anderson",
      created_at: "2024-11-11T07:21:03.000Z",
      updated_at: expect.any(String),
      username: "mr_anderson",
    });
  });
  // TODO: error cases
});

describe("PUT /v1/users/@me/greeting", () => {
  it("should update user greeting track", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .put("/v1/users/@me/greeting")
      .send({ greeting_track_id: 40, greeting_playlist_id: null })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ greeting_track_id: 40, greeting_playlist_id: null });
  });
  it("should update user greeting playlist", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .put("/v1/users/@me/greeting")
      .send({ greeting_track_id: null, greeting_playlist_id: 55 })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ greeting_track_id: null, greeting_playlist_id: 55 });
  });
  it("should clear user greeting", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .put("/v1/users/@me/greeting")
      .send({ greeting_track_id: null, greeting_playlist_id: null })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ greeting_track_id: null, greeting_playlist_id: null });
  });

  // TODO: error cases
});

describe("PUT /v1/users/@me/farewell", () => {
  it("should update user farewell track", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .put("/v1/users/@me/farewell")
      .send({ farewell_track_id: 40, farewell_playlist_id: null })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ farewell_track_id: 40, farewell_playlist_id: null });
  });
  it("should update user farewell playlist", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .put("/v1/users/@me/farewell")
      .send({ farewell_track_id: null, farewell_playlist_id: 55 })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ farewell_track_id: null, farewell_playlist_id: 55 });
  });
  it("should clear user farewell", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .put("/v1/users/@me/farewell")
      .send({ farewell_track_id: null, farewell_playlist_id: null })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ farewell_track_id: null, farewell_playlist_id: null });
  });

  // TODO: error cases
});

describe("PUT /v1/users/:id/greeting", () => {
  it("should update user greeting track", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .put("/v1/users/1/greeting")
      .send({ greeting_track_id: 40, greeting_playlist_id: null })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ greeting_track_id: 40, greeting_playlist_id: null });
  });
  it("should update user greeting playlist", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .put("/v1/users/1/greeting")
      .send({ greeting_track_id: null, greeting_playlist_id: 55 })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ greeting_track_id: null, greeting_playlist_id: 55 });
  });
  it("should clear user greeting", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .put("/v1/users/1/greeting")
      .send({ greeting_track_id: null, greeting_playlist_id: null })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ greeting_track_id: null, greeting_playlist_id: null });
  });

  // TODO: error cases
});

describe("PUT /v1/users/:id/farewell", () => {
  it("should update user farewell track", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .put("/v1/users/1/farewell")
      .send({ farewell_track_id: 40, farewell_playlist_id: null })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ farewell_track_id: 40, farewell_playlist_id: null });
  });
  it("should update user farewell playlist", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .put("/v1/users/1/farewell")
      .send({ farewell_track_id: null, farewell_playlist_id: 55 })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ farewell_track_id: null, farewell_playlist_id: 55 });
  });
  it("should clear user farewell", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .put("/v1/users/1/farewell")
      .send({ farewell_track_id: null, farewell_playlist_id: null })
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ farewell_track_id: null, farewell_playlist_id: null });
  });

  // TODO: error cases
});
