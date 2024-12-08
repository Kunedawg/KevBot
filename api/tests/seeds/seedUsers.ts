// import { db } from "../../src/db/connection";
import { Kysely } from "kysely";
import { Database } from "../../src/db/schema";

export async function seedUsers(db: Kysely<Database>) {
  await db
    .insertInto("users")
    .values({
      id: 231,
      discord_id: "144319372041781248",
      discord_username: "kunedawg",
      created_at: new Date("2024-12-07T04:29:04.000Z"),
      updated_at: new Date("2024-12-07T04:29:04.000Z"),
      username: null,
    })
    .execute();
}
