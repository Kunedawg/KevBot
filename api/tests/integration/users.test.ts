import request from "supertest";
import app from "../../src/app";
import { seedUsers } from "../seeds/seedUsers";
// import { truncateAllTables } from "../utils/db";
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
});

beforeEach(async () => {
  //   await truncateAllTables(connection);
  await seedUsers(db);
}, 60000);

afterAll(async () => {
  await db.destroy();
});

test("GET /users returns a list of users", async () => {
  const response = await request(app).get("/v1/users");
  expect(response.status).toBe(200);
  expect(response.body).toEqual([
    {
      id: 231,
      discord_id: "144319372041781248",
      discord_username: "kunedawg",
      created_at: "2024-12-07T04:29:04.000Z",
      updated_at: "2024-12-07T04:29:04.000Z",
      username: null,
    },
  ]);
}, 60000);
