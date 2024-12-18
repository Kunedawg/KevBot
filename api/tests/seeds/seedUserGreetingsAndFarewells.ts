import { Kysely } from "kysely";
import { Database } from "../../src/db/schema";

export async function seedUserGreetingsAndFarewells(db: Kysely<Database>) {
  await db
    .insertInto("user_greetings")
    .values([
      {
        user_id: 1,
        greeting_track_id: 23,
        greeting_playlist_id: null,
        updated_at: new Date("2024-12-12:21:03.000Z"),
      },
    ])
    .execute();

  await db
    .insertInto("user_farewells")
    .values([
      {
        user_id: 1,
        farewell_track_id: null,
        farewell_playlist_id: 55,
        updated_at: new Date("2024-12-14:21:03.000Z"),
      },
    ])
    .execute();
}
