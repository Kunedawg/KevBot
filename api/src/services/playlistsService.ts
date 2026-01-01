import { getTrackBaseQuery } from "./tracksService";
import * as Boom from "@hapi/boom";
import { Playlist } from "../db/schema";
import { KevbotDb } from "../db/connection";
import { Config } from "../config/config";
import { sql } from "kysely";

type PlaylistSearchResult = {
  data: Playlist[];
  total: number;
};

export function playlistsServiceFactory(db: KevbotDb, config: Config) {
  interface PlaylistOptions {
    name?: string;
    include_deleted?: boolean;
  }

  const validatePlaylistNameIsUnique = async (name: string, excludeId?: number) => {
    let query = db.selectFrom("playlists").selectAll().where("name", "=", name).where("deleted_at", "is", null);
    if (excludeId) {
      query = query.where("id", "!=", excludeId);
    }
    const playlist = await query.executeTakeFirst();
    if (playlist) {
      throw Boom.conflict("Playlist name is already taken");
    }
  };

  const playlistPermissionCheck = (playlist: Playlist, req_user_id: number) => {
    if (playlist.user_id !== req_user_id) {
      throw Boom.forbidden("You do not have permission to modify this playlist.");
    }
  };

  const getPlaylists = async (options: PlaylistOptions = {}) => {
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

  const getPlaylistById = async (id: number) => {
    const playlist = await db.selectFrom("playlists").selectAll().where("id", "=", id).executeTakeFirst();
    if (!playlist) {
      throw Boom.notFound("Playlist not found");
    }
    return playlist;
  };

  const patchPlaylist = async (id: number, name: string, req_user_id: number) => {
    const playlist = await getPlaylistById(id);
    playlistPermissionCheck(playlist, req_user_id);
    await validatePlaylistNameIsUnique(name, id);
    if (playlist.name === name) {
      return playlist;
    }
    await db.updateTable("playlists").set({ name }).where("id", "=", id).execute();
    return await getPlaylistById(id);
  };

  const deletePlaylist = async (id: number, req_user_id: number) => {
    const playlist = await getPlaylistById(id);
    playlistPermissionCheck(playlist, req_user_id);
    await db
      .updateTable("playlists")
      .set({ deleted_at: new Date() })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute();
    return await getPlaylistById(id);
  };

  const restorePlaylist = async (id: number, req_user_id: number, name?: string) => {
    const playlist = await getPlaylistById(id);
    playlistPermissionCheck(playlist, req_user_id);
    await patchPlaylist(id, name ?? playlist.name, req_user_id);
    await db.updateTable("playlists").set({ deleted_at: null }).where("id", "=", id).execute();
    return await getPlaylistById(id);
  };

  const postPlaylist = async (name: string, req_user_id: number) => {
    return await db.transaction().execute(async (trx) => {
      await validatePlaylistNameIsUnique(name);
      const { insertId } = await trx
        .insertInto("playlists")
        .values({ name, user_id: req_user_id })
        .executeTakeFirstOrThrow();
      const playlist = await trx
        .selectFrom("playlists")
        .selectAll()
        .where("id", "=", Number(insertId))
        .executeTakeFirstOrThrow();
      return playlist;
    });
  };

  const getPlaylistTracks = async (id: number) => {
    await getPlaylistById(id); // ensures playlist exists
    return await getTrackBaseQuery(db)
      .innerJoin("playlist_tracks", "t.id", "playlist_tracks.track_id")
      .where("playlist_tracks.playlist_id", "=", id)
      .where("t.deleted_at", "is", null)
      .execute();
  };

  const postPlaylistTracks = async (id: number, track_ids: number[], req_user_id: number) => {
    await getPlaylistById(id); // ensures playlist exists

    // ensures tracks are valid
    const validTrackIds = await db.selectFrom("tracks").select("id").where("id", "in", track_ids).execute();
    const validTrackIdSet = new Set(validTrackIds.map((track) => track.id));
    const invalidTrackIds = track_ids.filter((track_id) => !validTrackIdSet.has(track_id));
    if (invalidTrackIds.length > 0) {
      throw Boom.notFound("Track(s) not found", { invalid_track_ids: invalidTrackIds });
    }

    return await db.transaction().execute(async (trx) => {
      const inPlaylistTrackIds = await trx
        .selectFrom("playlist_tracks")
        .select("track_id")
        .where("playlist_id", "=", id)
        .where("track_id", "in", Array.from(validTrackIdSet))
        .execute();
      const inPlaylistTrackIdSet = new Set(inPlaylistTrackIds.map((track) => track.track_id));
      const notInPlaylistTrackIds = Array.from(validTrackIdSet).filter(
        (track_id) => !inPlaylistTrackIdSet.has(track_id)
      );

      if (notInPlaylistTrackIds.length > 0) {
        await trx
          .insertInto("playlist_tracks")
          .values(
            notInPlaylistTrackIds.map((track_id) => ({
              track_id,
              playlist_id: id,
              user_id: req_user_id,
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

  const deletePlaylistTracks = async (id: number, track_ids: number[], req_user_id: number) => {
    const playlist = await getPlaylistById(id); // ensures playlist exists
    playlistPermissionCheck(playlist, req_user_id);
    if (track_ids.length == 0) {
      throw Boom.badRequest("track_ids array cannot be empty.");
    }
    return await db.transaction().execute(async (trx) => {
      const trackIdSet = new Set(track_ids);
      const inPlaylistTrackIdSet = new Set(
        (
          await trx
            .selectFrom("playlist_tracks")
            .select("track_id")
            .where("playlist_id", "=", id)
            .where("track_id", "in", Array.from(trackIdSet))
            .execute()
        ).map((result) => result.track_id)
      );

      await trx
        .deleteFrom("playlist_tracks")
        .where("playlist_id", "=", id)
        .where("track_id", "in", Array.from(trackIdSet))
        .execute();

      return {
        message: "Playlist track deletion complete.",
        deleted_track_ids: Array.from(inPlaylistTrackIdSet),
        not_in_playlist_track_ids: Array.from(trackIdSet).filter((id) => !inPlaylistTrackIdSet.has(id)),
      };
    });
  };

  const searchPlaylists = async ({
    q,
    limit,
    offset = 0,
    include_deleted = false,
    hybridRatio = config.hybridRelevanceRatio,
  }: {
    q: string | null;
    limit: number;
    offset?: number;
    include_deleted?: boolean;
    hybridRatio?: number;
  }): Promise<PlaylistSearchResult> => {
    const trimmed = q?.trim() ?? "";

    if (!trimmed) {
      const rows = await db
        .selectFrom("playlists as p")
        .select([
          "p.id",
          "p.name",
          "p.user_id",
          "p.created_at",
          "p.updated_at",
          "p.deleted_at",
          sql<number>`COUNT(*) OVER ()`.as("total_rows"),
        ])
        .$if(!include_deleted, (qb) => qb.where("p.deleted_at", "is", null))
        .orderBy("p.name", "asc")
        .limit(limit)
        .offset(offset)
        .execute();
      const total = rows.length ? rows[0].total_rows : 0;
      return {
        data: rows.map(({ total_rows, ...rest }) => rest),
        total,
      };
    }

    const rows = await db
      .with("scored", (db) =>
        db
          .selectFrom("playlists as p")
          .selectAll()
          .select([
            sql<number>`MATCH(p.name) AGAINST (${trimmed} IN NATURAL LANGUAGE MODE)`.as("rel"),
            sql<boolean>`p.name LIKE CONCAT(${trimmed}, '%')`.as("is_prefix"),
          ])
          .$if(!include_deleted, (qb) => qb.where("p.deleted_at", "is", null))
          .where((eb) =>
            eb.or([
              sql<boolean>`p.name LIKE CONCAT(${trimmed}, '%')`,
              sql<boolean>`MATCH(p.name) AGAINST (${trimmed} IN NATURAL LANGUAGE MODE)`,
            ])
          )
      )
      .with("aug", (db) =>
        db.selectFrom("scored as s").selectAll().select(sql<number>`MAX(s.rel) OVER ()`.as("max_rel"))
      )
      .with("kept", (db) =>
        db
          .selectFrom("aug as s")
          .selectAll()
          .where((eb) =>
            eb.or([
              sql<boolean>`s.is_prefix = 1`,
              eb.and([sql<boolean>`s.rel > 0`, sql<boolean>`s.rel >= ${hybridRatio} * s.max_rel`]),
            ])
          )
      )
      .selectFrom("kept as s")
      .selectAll()
      .select(sql<number>`COUNT(*) OVER ()`.as("total_rows"))
      .orderBy(sql`CASE WHEN s.is_prefix = 1 THEN 0 ELSE 1 END`, "asc")
      .orderBy(sql`CASE WHEN s.is_prefix = 1 THEN s.name ELSE NULL END`, "asc")
      .orderBy("s.rel", "desc")
      .orderBy("s.name", "asc")
      .limit(limit)
      .offset(offset)
      .execute();

    const total = rows.length ? rows[0].total_rows : 0;
    return {
      data: rows.map(({ total_rows, ...rest }) => rest),
      total,
    };
  };

  return {
    getPlaylists,
    getPlaylistById,
    patchPlaylist,
    deletePlaylist,
    restorePlaylist,
    postPlaylist,
    getPlaylistTracks,
    postPlaylistTracks,
    deletePlaylistTracks,
    searchPlaylists,
  };
}

export type PlaylistsService = ReturnType<typeof playlistsServiceFactory>;
