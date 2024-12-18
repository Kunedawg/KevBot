import { Kysely } from "kysely";
import { Database } from "../../src/db/schema";

export async function seedPlaylists(db: Kysely<Database>) {
  await db
    .insertInto("playlists")
    .values([
      {
        id: 55,
        name: "bestclips",
        created_at: new Date("2024-12-13:21:03.000Z"),
        user_id: 1,
        updated_at: new Date("2024-12-13:21:03.000Z"),
      },
    ])
    .execute();

  await db
    .insertInto("playlist_tracks")
    .values([
      {
        track_id: 23,
        playlist_id: 55,
        created_at: new Date("2024-12-14:21:03.000Z"),
        user_id: 1,
      },
    ])
    .execute();
}
