import { db } from "../db/connection";

interface PlaylistOptions {
  name?: string;
  include_deleted?: boolean;
}

export const getPlaylists = async (options: PlaylistOptions = {}) => {
  const { name, include_deleted = false } = options;
  let query = db.selectFrom("playlists").selectAll();
  if (name) {
    query = query.where("name", "=", name);
  }
  if (!include_deleted) {
    query = query.where("deleted_at", "is", null);
  }
  return await query.execute();
};

export const getPlaylistById = async (id: number | string) => {
  return await db.selectFrom("playlists").selectAll().where("id", "=", Number(id)).executeTakeFirst();
};

export const patchPlaylist = async (id: number | string, name: string) => {
  await db.updateTable("playlists").set({ name }).where("id", "=", Number(id)).execute();
  return await getPlaylistById(id);
};

export const deletePlaylist = async (id: number | string) => {
  await db
    .updateTable("playlists")
    .set({ deleted_at: new Date() })
    .where("id", "=", Number(id))
    .where("deleted_at", "is", null)
    .execute();
  return await getPlaylistById(id);
};

export const restorePlaylist = async (id: number | string) => {
  await db
    .updateTable("playlists")
    .set({ deleted_at: null })
    .where("id", "=", Number(id))
    .where("deleted_at", "is not", null)
    .execute();
  return await getPlaylistById(id);
};

export const postPlaylist = async (name: string, user_id: number | string) => {
  return await db.transaction().execute(async (trx) => {
    const { insertId } = await trx
      .insertInto("playlists")
      .values({ name, user_id: Number(user_id) })
      .executeTakeFirstOrThrow();
    const playlist = await trx
      .selectFrom("playlists")
      .selectAll()
      .where("id", "=", Number(insertId))
      .executeTakeFirstOrThrow();
    return playlist;
  });
};

export const getPlaylistTracks = async (id: number | string) => {
  const playlist = await db.selectFrom("playlists").selectAll().where("id", "=", Number(id)).executeTakeFirst();
  if (!playlist) return null;
  return await db
    .selectFrom("tracks")
    .selectAll()
    .innerJoin("playlist_tracks", "tracks.id", "playlist_tracks.track_id")
    .where("playlist_tracks.playlist_id", "=", Number(id))
    .where("tracks.deleted_at", "is", null)
    .execute();
};

export const postPlaylistTracks = async (id: number | string, track_ids: number[], user_id: number | string) => {
  return await db.transaction().execute(async (trx) => {
    const playlist = await trx.selectFrom("playlists").selectAll().where("id", "=", Number(id)).executeTakeFirst();
    if (!playlist) {
      throw { status: 404, message: "Playlist not found." };
    }

    const validTrackIds = await trx.selectFrom("tracks").select("id").where("id", "in", track_ids).execute();
    const validTrackIdSet = new Set(validTrackIds.map((track) => track.id));
    const invalidTrackIds = track_ids.filter((track_id) => !validTrackIdSet.has(track_id));
    if (invalidTrackIds.length > 0) {
      throw { status: 400, message: "Invalid track ids" };
    }

    const inPlaylistTrackIds = await trx
      .selectFrom("playlist_tracks")
      .select("track_id")
      .where("playlist_id", "=", Number(id))
      .where("track_id", "in", Array.from(validTrackIdSet))
      .execute();
    const inPlaylistTrackIdSet = new Set(inPlaylistTrackIds.map((track) => track.track_id));
    const notInPlaylistTrackIds = Array.from(validTrackIdSet).filter((track_id) => !inPlaylistTrackIdSet.has(track_id));

    if (notInPlaylistTrackIds.length > 0) {
      await trx
        .insertInto("playlist_tracks")
        .values(
          notInPlaylistTrackIds.map((track_id) => ({
            track_id,
            playlist_id: Number(id),
            user_id: Number(user_id),
          }))
        )
        .execute();
    }

    return {
      message: "Tracks added successfully to the playlist.",
      playlist_id: id,
      added_track_ids: notInPlaylistTrackIds,
    };
  });
};

export const deletePlaylistTracks = async (id: number | string, track_ids: number[], user_id: number) => {
  return await db.transaction().execute(async (trx) => {
    if (track_ids.length == 0) {
      throw { status: 400, message: "track_ids array cannot be empty." };
    }

    const playlist = await trx
      .selectFrom("playlists")
      .selectAll()
      .where("id", "=", Number(id))
      .where("user_id", "=", user_id)
      .executeTakeFirst();
    if (!playlist) {
      throw { status: 404, message: "Playlist not found or access denied." };
    }

    const trackIdSet = new Set(track_ids);
    const inPlaylistTrackIdSet = new Set(
      (
        await trx
          .selectFrom("playlist_tracks")
          .select("track_id")
          .where("playlist_id", "=", Number(id))
          .where("track_id", "in", Array.from(trackIdSet))
          .execute()
      ).map((result) => result.track_id)
    );

    await trx
      .deleteFrom("playlist_tracks")
      .where("playlist_id", "=", Number(id))
      .where("track_id", "in", Array.from(trackIdSet))
      .execute();

    return {
      message: "Playlist track deletion complete.",
      deleted_track_ids: Array.from(inPlaylistTrackIdSet),
      not_in_playlist_track_ids: Array.from(trackIdSet).filter((id) => !inPlaylistTrackIdSet.has(id)),
    };
  });
};
