import { Kysely } from "kysely";
import { Database } from "../../src/db/schema";

export async function seedTracks(db: Kysely<Database>) {
  await db
    .insertInto("tracks")
    .values([
      {
        id: 23,
        name: "happynewyear",
        created_at: new Date("2024-12-11T07:21:03.000Z"),
        user_id: 1337,
        duration: 5.328,
        updated_at: new Date("2024-12-11T07:21:03.000Z"),
      },
      {
        id: 40,
        name: "yes",
        created_at: new Date("2024-12-11T08:21:03.000Z"),
        user_id: 1,
        duration: 3.713,
        updated_at: new Date("2024-12-11T08:21:03.000Z"),
      },
      {
        id: 50,
        name: "deletedtrack",
        created_at: new Date("2024-12-11T08:21:03.000Z"),
        user_id: 1,
        duration: 4.713,
        updated_at: new Date("2024-12-11T08:21:03.000Z"),
      },
    ])
    .execute();

  await db
    .updateTable("tracks")
    .set({ deleted_at: new Date() })
    .where("id", "=", 50)
    .where("deleted_at", "is", null)
    .execute();
}
