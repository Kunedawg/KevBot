import request from "supertest";
import { appFactory } from "../../src/app";
import { seedUsers } from "../seeds/seedUsers";
import { seedTracks } from "../seeds/seedTracks";
import { seedUserGreetingsAndFarewells } from "../seeds/seedUserGreetingsAndFarewells";
import { seedPlaylists } from "../seeds/seedPlaylists";
import { Kysely } from "kysely";
import { Database } from "../../src/db/schema";
import { dbFactory } from "../../src/db/connection";
import { Express } from "express";
import { configFactory } from "../../src/config/config";
import { Bucket } from "@google-cloud/storage";
import { i32IdCheck } from "../utils";

let db: Kysely<Database>;
let app: Express;

beforeAll(async () => {
  process.env.GCP_TRACKS_BUCKET_NAME = "dummy";
  process.env.KEVBOT_API_ADDRESS = "0.0.0.0";
  process.env.KEVBOT_API_JWT_SECRET = "jwt_secret";
  process.env.KEVBOT_API_PORT = "3000";
  const { config, secrets } = configFactory();
  const dummyTracksBucket = {} as Bucket;
  db = dbFactory(secrets.DB_CONNECTION_STRING);
  app = appFactory(config, secrets, db, dummyTracksBucket);
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

  it("should return 200 and a list of filtered list of users based on username.", async () => {
    const res = await request(app).get("/v1/users?username=mr_anderson");
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
    ]);
  });

  it("should return 200 and a list of filtered list of users based on discordId.", async () => {
    const res = await request(app).get("/v1/users?discordId=135319472041781248");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
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

  it("should return 200 and a list of filtered list of users based on discordUsername.", async () => {
    const res = await request(app).get("/v1/users?discordUsername=discord_seed_user");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
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

  it("should return 200 and a list of filtered list of users based on all available filters.", async () => {
    const res = await request(app).get(
      "/v1/users?username=mr_anderson&discordId=123711472041781240&discordUsername=mr_anderson"
    );
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
    ]);
  });

  it("should return 200 and a empty list of users because username does not exist.", async () => {
    const res = await request(app).get("/v1/users?username=does_not_exist");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns error if invalid query parameter is provided", async () => {
    const res = await request(app).get("/v1/users?dne=hello");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
    expect(res.body?.message).toMatch(/validation error.*dne/i);
  });
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
  // No error conditions require handling at this time
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
  // No error conditions require handling at this time
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
  // No error conditions require handling at this time
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

  it("returns error if invalid user_id is provided", async () => {
    const res = await request(app).get("/v1/users/404");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ statusCode: 404, error: "Not Found", message: expect.any(String) });
    expect(res.body?.message).toMatch(/user not found/i);
  });

  it("id should be i32", async () => {
    await i32IdCheck(async (id: any) => {
      return request(app).get(`/v1/users/${id}`);
    });
  });
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

  it("id should be i32", async () => {
    await i32IdCheck(async (id: any) => {
      return request(app).get(`/v1/users/${id}/greeting`);
    });
  });
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

  it("id should be i32", async () => {
    await i32IdCheck(async (id: any) => {
      return request(app).get(`/v1/users/${id}/farewell`);
    });
  });
});

async function usernameCheck(requestStarter: any) {
  let res = await requestStarter.send({ username: "neoA" });
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
  expect(res.body?.message).toMatch(/validation error.*username/i);

  res = await requestStarter.send({ username: "neo%" });
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
  expect(res.body?.message).toMatch(/validation error.*username/i);
}

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

  it("does not allow invalid usernames", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    await usernameCheck(request(app).patch("/v1/users/@me").set("Authorization", `Bearer ${jwtToken}`));
  });
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

  it("does not allow invalid usernames", async () => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    await usernameCheck(request(app).patch("/v1/users/1").set("Authorization", `Bearer ${jwtToken}`));
  });
});

async function greetingFarewellChecks(type: "greeting" | "farewell", endpoint: string) {
  const castSalutation = (salutation: { track_id: any; playlist_id: any }) => {
    return type === "greeting"
      ? { greeting_track_id: salutation.track_id, greeting_playlist_id: salutation.playlist_id }
      : { farewell_track_id: salutation.track_id, farewell_playlist_id: salutation.playlist_id };
  };

  const sendAndCheckValidSalutationPutRequest = async (salutation: { track_id: any; playlist_id: any }) => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    const res = await request(app)
      .put(endpoint)
      .send(castSalutation(salutation))
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(castSalutation(salutation));
  };

  const sendAndCheckInvalidSalutationPutRequest = async (
    salutation: { track_id: any; playlist_id: any },
    statusCode: 400 | 404,
    errorRegex: RegExp
  ) => {
    const jwtToken = await getLoginTokenAndTestResult(ME_USER);
    let res = await request(app)
      .put(endpoint)
      .send(castSalutation(salutation))
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(res.status).toBe(statusCode);
    const errorStringLookup = {
      400: "Bad Request",
      404: "Not Found",
    };
    expect(res.body).toEqual({ statusCode, error: errorStringLookup[statusCode], message: expect.any(String) });
    expect(res.body?.message).toMatch(errorRegex);
  };

  it(`should update user ${type} track`, async () => {
    await sendAndCheckValidSalutationPutRequest({ track_id: 40, playlist_id: null });
  });

  it(`should update user ${type} playlist`, async () => {
    await sendAndCheckValidSalutationPutRequest({ track_id: null, playlist_id: 55 });
  });

  it(`should clear user ${type}`, async () => {
    await sendAndCheckValidSalutationPutRequest({ track_id: null, playlist_id: null });
  });

  it("track must be int", async () => {
    await sendAndCheckInvalidSalutationPutRequest(
      { track_id: "hello", playlist_id: null },
      400,
      new RegExp(`validation error.*string.*${type}_track_id`, "i")
    );
  });

  it("playlist must be int", async () => {
    await sendAndCheckInvalidSalutationPutRequest(
      { track_id: null, playlist_id: "hello" },
      400,
      new RegExp(`validation error.*string.*${type}_playlist_id`, "i")
    );
  });

  it("cannot be both not null", async () => {
    await sendAndCheckInvalidSalutationPutRequest(
      { track_id: 1, playlist_id: 1 },
      400,
      new RegExp(`validation error.*only one ${type} id`, "i")
    );
  });

  it("track must exist", async () => {
    await sendAndCheckInvalidSalutationPutRequest({ track_id: 88, playlist_id: null }, 404, /track not found/i);
  });

  it("playlist must exist", async () => {
    await sendAndCheckInvalidSalutationPutRequest({ track_id: null, playlist_id: 88 }, 404, /playlist not found/i);
  });
}

describe("PUT /v1/users/@me/greeting", () => {
  greetingFarewellChecks("greeting", "/v1/users/@me/greeting");
});

describe("PUT /v1/users/@me/farewell", () => {
  greetingFarewellChecks("farewell", "/v1/users/@me/farewell");
});

describe("PUT /v1/users/:id/greeting", () => {
  greetingFarewellChecks("greeting", "/v1/users/1/greeting");
});

describe("PUT /v1/users/:id/farewell", () => {
  greetingFarewellChecks("farewell", "/v1/users/1/farewell");
});
