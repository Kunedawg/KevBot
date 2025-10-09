import { KevbotDb } from "../db/connection";
import { Track } from "../db/schema";
import { ExpressionBuilder, Kysely, Transaction, sql } from "kysely";
import { Database } from "../db/schema";
import * as Boom from "@hapi/boom";
import { Bucket } from "@google-cloud/storage";
import { GetTracksQuerySchema, GetTracksQuerySchemaForKind } from "../schemas/tracksSchemas";
import { Config } from "../config/config";

const trackBaseSelect = [
  "t.id",
  "t.name",
  "t.duration",
  "t.user_id",
  "t.deleted_at",
  "t.created_at",
  "t.updated_at",
  sql<number>`COUNT(*) OVER ()`.as("total_rows"),
] as const;

export const getTrackBaseQuery = (dbTrx: Kysely<Database> | Transaction<Database>) => {
  return dbTrx
    .selectFrom("tracks as t")
    .leftJoin("track_play_counts as tpc", "t.id", "tpc.track_id")
    .select(({ fn }) => [
      "t.id",
      "t.name",
      "t.duration",
      "t.user_id",
      "t.deleted_at",
      "t.created_at",
      "t.updated_at",
      fn.coalesce("tpc.total_play_count", sql<number>`0`).as("total_play_count"),
      fn.coalesce("tpc.raw_total_play_count", sql<number>`0`).as("raw_total_play_count"),
    ]);
};

const hybridQueryBase = (db: Kysely<Database>, q: string, include_deleted: boolean, config: Config) => {
  return db
    .with("scored", (db) =>
      db
        .selectFrom("tracks as t")
        .selectAll()
        .select([
          sql<number>`MATCH(t.name) AGAINST (${q} IN NATURAL LANGUAGE MODE)`.as("rel"),
          sql<boolean>`t.name LIKE CONCAT(${q}, '%')`.as("is_prefix"),
        ])
        .$if(!include_deleted, (q) => q.where("t.deleted_at", "is", null))
        .where((eb) =>
          eb.or([
            sql<boolean>`t.name LIKE CONCAT(${q}, '%')`,
            sql<boolean>`MATCH(t.name) AGAINST (${q} IN NATURAL LANGUAGE MODE)`,
          ])
        )
    )
    .with("aug", (db) =>
      db
        .selectFrom("scored as s")
        .selectAll()
        .select(sql<number>`MAX(s.rel) OVER ()`.as("max_rel"))
    )
    .with("kept", (db) =>
      db
        .selectFrom("aug as s")
        .selectAll()
        .where((eb) =>
          eb.or([
            sql<boolean>`s.is_prefix = 1`,
            eb.and([sql<boolean>`s.rel > 0`, sql<boolean>`s.rel >= ${config.hybridRelevanceRatio} * s.max_rel`]),
          ])
        )
    )
    .selectFrom("aug as s");
};

export function tracksServiceFactory(db: KevbotDb, tracksBucket: Bucket, config: Config) {
  const validateTrackNameIsUnique = async (name: string, excludeId?: number) => {
    let query = db.selectFrom("tracks").selectAll().where("name", "=", name).where("deleted_at", "is", null);
    if (excludeId) {
      query = query.where("id", "!=", excludeId);
    }
    const track = await query.executeTakeFirst();
    if (track) {
      throw Boom.conflict("Track name is already taken");
    }
  };

  const trackPermissionCheck = (track: Track, req_user_id: number) => {
    if (track.user_id !== req_user_id) {
      throw Boom.forbidden("You do not have permission to modify this track.");
    }
  };

  const getTracksHybrid = async ({
    search: { kind, q },
    include_deleted,
    limit,
    offset,
  }: GetTracksQuerySchemaForKind<"hybrid">) => {
    const rows = await hybridQueryBase(db, q, include_deleted, config)
      .leftJoin("track_play_counts as tpc", "s.id", "tpc.track_id")
      .select(({ fn }) => [
        "s.id",
        "s.name",
        "s.duration",
        "s.user_id",
        "s.deleted_at",
        "s.created_at",
        "s.updated_at",
        sql<number>`COUNT(*) OVER ()`.as("total_rows"),
        fn.coalesce("tpc.total_play_count", sql<number>`0`).as("total_play_count"),
        fn.coalesce("tpc.raw_total_play_count", sql<number>`0`).as("raw_total_play_count"),
      ])
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
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    };
  };

  const getTracksFulltext = async ({
    search: { kind, q },
    include_deleted,
    limit,
    offset,
  }: GetTracksQuerySchemaForKind<"fulltext">) => {
    const rows = await db
      .with("filtered", (db) =>
        db
          .selectFrom("tracks as t")
          .select(["t.id", sql<number>`MATCH(t.name) AGAINST (${q} IN NATURAL LANGUAGE MODE)`.as("rel")])
          .$if(!include_deleted, (qb) => qb.where("t.deleted_at", "is", null))
          .where(sql<boolean>`MATCH(t.name) AGAINST (${q} IN NATURAL LANGUAGE MODE)`)
      )
      .selectFrom("filtered as f")
      .leftJoin("tracks as t", "t.id", "f.id")
      .leftJoin("track_play_counts as tpc", "t.id", "tpc.track_id")
      .select(({ fn }) => [
        ...trackBaseSelect,
        fn.coalesce("tpc.total_play_count", sql<number>`0`).as("total_play_count"),
        fn.coalesce("tpc.raw_total_play_count", sql<number>`0`).as("raw_total_play_count"),
      ])
      .orderBy("f.rel", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    const total = rows.length ? rows[0].total_rows : 0;

    return {
      data: rows.map(({ total_rows, ...rest }) => rest),
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    };
  };

  const getTracksContains = async ({
    search: { kind, q, sort, order },
    include_deleted,
    limit,
    offset,
  }: GetTracksQuerySchemaForKind<"contains">) => {
    const rows = await db
      .with("filtered", (db) =>
        db
          .selectFrom("tracks as t")
          .select(["t.id"])
          .$if(!include_deleted, (qb) => qb.where("t.deleted_at", "is", null))
          .where(sql<boolean>`t.name LIKE ${`%${q}%`}`)
      )
      .selectFrom("filtered as f")
      .leftJoin("tracks as t", "t.id", "f.id")
      .leftJoin("track_play_counts as tpc", "t.id", "tpc.track_id")
      .select(({ fn }) => [
        ...trackBaseSelect,
        fn.coalesce("tpc.total_play_count", sql<number>`0`).as("total_play_count"),
        fn.coalesce("tpc.raw_total_play_count", sql<number>`0`).as("raw_total_play_count"),
      ])
      .orderBy(sort, order)
      .limit(limit)
      .offset(offset)
      .execute();

    const total = rows.length ? rows[0].total_rows : 0;

    return {
      data: rows.map(({ total_rows, ...rest }) => rest),
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    };
  };

  const getTracksExact = async ({
    search: { kind, q },
    include_deleted,
    limit,
    offset,
  }: GetTracksQuerySchemaForKind<"exact">) => {
    const rows = await db
      .with("filtered", (db) =>
        db
          .selectFrom("tracks as t")
          .select(["t.id"])
          .$if(!include_deleted, (qb) => qb.where("t.deleted_at", "is", null))
          .where(sql<boolean>`t.name = ${q}`)
      )
      .selectFrom("filtered as f")
      .leftJoin("tracks as t", "t.id", "f.id")
      .leftJoin("track_play_counts as tpc", "t.id", "tpc.track_id")
      .select(({ fn }) => [
        ...trackBaseSelect,
        fn.coalesce("tpc.total_play_count", sql<number>`0`).as("total_play_count"),
        fn.coalesce("tpc.raw_total_play_count", sql<number>`0`).as("raw_total_play_count"),
      ])
      .orderBy("t.created_at", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    const total = rows.length ? rows[0].total_rows : 0;

    return {
      data: rows.map(({ total_rows, ...rest }) => rest),
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    };
  };

  const getTracksBrowse = async ({
    search: { kind, sort, order },
    include_deleted,
    limit,
    offset,
  }: GetTracksQuerySchemaForKind<"browse">) => {
    const rows = await db
      .with("filtered", (db) =>
        db
          .selectFrom("tracks as t")
          .select(["t.id"])
          .$if(!include_deleted, (qb) => qb.where("t.deleted_at", "is", null))
      )
      .selectFrom("filtered as f")
      .leftJoin("tracks as t", "t.id", "f.id")
      .leftJoin("track_play_counts as tpc", "t.id", "tpc.track_id")
      .select(({ fn }) => [
        ...trackBaseSelect,
        fn.coalesce("tpc.total_play_count", sql<number>`0`).as("total_play_count"),
        fn.coalesce("tpc.raw_total_play_count", sql<number>`0`).as("raw_total_play_count"),
      ])
      .orderBy(sort, order)
      .limit(limit)
      .offset(offset)
      .execute();

    const total = rows.length ? rows[0].total_rows : 0;

    return {
      data: rows.map(({ total_rows, ...rest }) => rest),
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    };
  };

  const getTracks = async ({ search, include_deleted, limit, offset }: GetTracksQuerySchema) => {
    const base = { include_deleted, limit, offset };

    switch (search.kind) {
      case "hybrid":
        return await getTracksHybrid({ search, ...base });
      case "fulltext":
        return await getTracksFulltext({ search, ...base });
      case "contains":
        return await getTracksContains({ search, ...base });
      case "exact":
        return await getTracksExact({ search, ...base });
      case "browse":
        return await getTracksBrowse({ search, ...base });
      default:
        const _exhaustive: never = search;
        return _exhaustive;
    }
  };

  const suggestTracks = async ({ q, limit }: { q: string; limit: number }) => {
    const startedAt = Date.now();

    const rows = await hybridQueryBase(db, q, false, config)
      .select(["s.id", "s.name"])
      .orderBy(sql`CASE WHEN s.is_prefix = 1 THEN 0 ELSE 1 END`, "asc")
      .orderBy(sql`CASE WHEN s.is_prefix = 1 THEN s.name ELSE NULL END`, "asc")
      .orderBy("s.rel", "desc")
      .orderBy("s.name", "asc")
      .limit(limit)
      .offset(0)
      .execute();

    return {
      suggestions: rows,
      took_ms: Date.now() - startedAt,
    };
  };

  const getTrackById = async (id: number, trx?: Transaction<Database>) => {
    const dbTrx = trx ?? db;
    let query = getTrackBaseQuery(dbTrx);
    const track = await query.where("t.id", "=", id).executeTakeFirst();
    if (!track) {
      throw Boom.notFound("Track not found");
    }
    return track;
  };

  const getTrackFile = async (track: Track) => {
    const file = tracksBucket.file(`${track.id}.mp3`);
    const [exists] = await file.exists();
    if (!exists) {
      throw Boom.notFound("Track file not found");
    }
    return file;
  };

  const patchTrack = async (id: number, name: string, req_user_id: number) => {
    const track = await getTrackById(id);
    trackPermissionCheck(track, req_user_id);
    await validateTrackNameIsUnique(name, id);
    if (track.name === name) {
      return track;
    }
    await db.updateTable("tracks").set({ name }).where("id", "=", id).execute();
    return await getTrackById(id);
  };

  const deleteTrack = async (id: number, req_user_id: number) => {
    const track = await getTrackById(id);
    trackPermissionCheck(track, req_user_id);
    await db
      .updateTable("tracks")
      .set({ deleted_at: new Date() })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute();
    return await getTrackById(id);
  };

  const restoreTrack = async (id: number, req_user_id: number, name?: string) => {
    const track = await getTrackById(id);
    trackPermissionCheck(track, req_user_id);
    await patchTrack(id, name ?? track.name, req_user_id);
    await db.updateTable("tracks").set({ deleted_at: null }).where("id", "=", id).execute();
    return await getTrackById(id);
  };

  /**
   * The normalized file is the main file that gets uploaded, but the original is posted too.
   * It uses the loudnorm filter with print_format=json to gather stats.
   */
  const postTrack = async (
    filepath: string,
    normalizedFilepath: string,
    name: string,
    duration: number,
    req_user_id: number
  ) => {
    await validateTrackNameIsUnique(name);
    return await db.transaction().execute(async (trx) => {
      // TODO: why is the insertId incrementing even on failed inserts?
      const { insertId } = await trx
        .insertInto("tracks")
        .values({ name, duration, user_id: req_user_id })
        .executeTakeFirstOrThrow();
      const track = await getTrackById(Number(insertId), trx);
      await tracksBucket.upload(normalizedFilepath, {
        destination: `${track.id}.mp3`,
        resumable: false,
        metadata: {
          contentType: "audio/mpeg",
        },
      });
      await tracksBucket.upload(filepath, {
        destination: `${track.id}.original.mp3`,
        resumable: false,
        metadata: {
          contentType: "audio/mpeg",
        },
      });
      return track;
    });
  };

  return {
    getTracks,
    suggestTracks,
    getTrackById,
    getTrackFile,
    patchTrack,
    deleteTrack,
    restoreTrack,
    postTrack,
  };
}

export type TracksService = ReturnType<typeof tracksServiceFactory>;
