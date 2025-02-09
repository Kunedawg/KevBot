import { Kysely } from "kysely";
import { Database } from "../../src/db/schema";

export async function seedPlaylists(db: Kysely<Database>) {
  await db
    .insertInto("playlists")
    .values([
      {
        id: 55,
        name: "bestclips",
        created_at: new Date("2024-12-13T21:03:00.000Z"),
        user_id: 1,
        updated_at: new Date("2024-12-13T21:03:00.000Z"),
      },
      {
        id: 56,
        name: "greatclips",
        created_at: new Date("2024-12-13T21:03:00.000Z"),
        user_id: 1337,
        updated_at: new Date("2024-12-13T21:03:00.000Z"),
      },
      {
        id: 50,
        name: "deletedplaylist",
        created_at: new Date("2024-12-11T08:21:03.000Z"),
        user_id: 1,
        updated_at: new Date("2024-12-11T08:21:03.000Z"),
      },
    ])
    .execute();

  await db
    .insertInto("playlist_tracks")
    .values([
      {
        track_id: 23,
        playlist_id: 55,
        created_at: new Date("2024-12-14T21:03:00.000Z"),
        user_id: 1,
      },
    ])
    .execute();

  await db
    .updateTable("playlists")
    .set({ deleted_at: new Date() })
    .where("id", "=", 50)
    .where("deleted_at", "is", null)
    .execute();
}
