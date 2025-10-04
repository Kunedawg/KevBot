import { KevbotDb } from "../db/connection";
import { Track } from "../db/schema";
import { Kysely, SelectQueryBuilder, Transaction, sql } from "kysely";
import { Database } from "../db/schema";
import * as Boom from "@hapi/boom";
import { Bucket } from "@google-cloud/storage";

type TrackSearchMode = "fulltext" | "contains" | "hybrid" | "exact";
type TrackSortOption = "relevance" | "created_at" | "name";
type TrackSortOrder = "asc" | "desc";

interface TrackOptions {
  q?: string;
  search_mode?: TrackSearchMode;
  sort?: TrackSortOption;
  order?: TrackSortOrder;
  include_deleted?: boolean;
  limit?: number;
  offset?: number;
}

interface TrackSuggestOptions {
  q: string;
  limit?: number;
}

const HYBRID_RELEVANCE_RATIO = 0.5;

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

export function tracksServiceFactory(db: KevbotDb, tracksBucket: Bucket) {
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

  const buildHybridSearchContext = async (
    dbTrx: Kysely<Database> | Transaction<Database>,
    query: string,
    includeDeleted: boolean
  ) => {
    const trimmedQuery = query.trim();
    const prefixPattern = `${trimmedQuery}%`;

    const maxRelevanceRow = await dbTrx
      .selectFrom("tracks as t")
      .select(sql<number>`MAX(MATCH(t.name) AGAINST (${trimmedQuery} IN NATURAL LANGUAGE MODE))`.as("max_relevance"))
      .$if(!includeDeleted, (query) => query.where("t.deleted_at", "is", null))
      .where(sql<boolean>`MATCH(t.name) AGAINST (${trimmedQuery} IN NATURAL LANGUAGE MODE)`)
      .executeTakeFirst();

    const maxRelevance = maxRelevanceRow?.max_relevance ?? 0;
    const relevanceThreshold = maxRelevance * HYBRID_RELEVANCE_RATIO;
    const includeFullText = maxRelevance > 0;

    const filterExpression = includeFullText
      ? () =>
          sql<boolean>`
            t.name LIKE ${prefixPattern}
            OR MATCH(t.name) AGAINST (${trimmedQuery} IN NATURAL LANGUAGE MODE) >= ${relevanceThreshold}
          `
      : () => sql<boolean>`t.name LIKE ${prefixPattern}`;

    const searchQueryModifier = (
      query: SelectQueryBuilder<Database, any, any>,
      { limit, offset }: { limit: number | undefined; offset: number | undefined }
    ) => {
      return query
        .where(filterExpression())
        .orderBy(sql`CASE WHEN t.name LIKE ${prefixPattern} THEN 0 ELSE 1 END`, "asc")
        .orderBy(sql`CASE WHEN t.name LIKE ${prefixPattern} THEN t.name ELSE NULL END`, "asc")
        .$if(includeFullText, (query) =>
          query.orderBy(sql<number>`MATCH(t.name) AGAINST (${trimmedQuery} IN NATURAL LANGUAGE MODE)`, "desc")
        )
        .orderBy("t.created_at", "desc")
        .$if(limit !== undefined, (query) => query.limit(limit as number))
        .$if(offset !== undefined, (query) => query.offset(offset as number));
    };

    return {
      filterExpression,
      searchQueryModifier,
    };
  };

  const applyTrackQueryFilters = (
    qb: SelectQueryBuilder<Database, any, any>,
    {
      include_deleted = false,
      q,
      search_mode = "fulltext",
    }: Pick<TrackOptions, "include_deleted" | "q" | "search_mode">
  ) => {
    const trimmedQ = q?.trim();
    return qb
      .$if(!include_deleted, (query) => query.where("t.deleted_at", "is", null))
      .$if(!!trimmedQ, (query) => {
        switch (search_mode) {
          case "contains":
            return query.where(sql<boolean>`t.name LIKE ${`%${trimmedQ}%`}`);
          case "fulltext":
            return query.where(sql<boolean>`MATCH(t.name) AGAINST (${trimmedQ} IN NATURAL LANGUAGE MODE)`);
          case "hybrid":
            return query;
          case "exact":
            return query.where(sql<boolean>`t.name = ${trimmedQ}`);
          default:
            const _never: never = search_mode as never;
            return query;
        }
      });
  };

  const getTracks = async (options: TrackOptions = {}) => {
    const {
      q,
      search_mode = "fulltext",
      sort = "created_at",
      order = "desc",
      include_deleted = false,
      limit = 20,
      offset = 0,
    } = options;

    if (q && search_mode === "hybrid") {
      const searchContext = await buildHybridSearchContext(db, q, include_deleted);

      const { total } = await db
        .selectFrom("tracks as t")
        .$if(!include_deleted, (query) => query.where("t.deleted_at", "is", null))
        .select(({ fn }) => fn.countAll<number>().as("total"))
        .where(searchContext.filterExpression())
        .executeTakeFirstOrThrow();

      const data = await db
        .with("scored", (db) =>
          db
            .selectFrom("tracks")
            .select((eb) => [
              "id",
              sql<number>`MATCH(name) AGAINST (${q} IN NATURAL LANGUAGE MODE)`.as("rel"),
              sql<boolean>`name LIKE CONCAT(${q}, '%')`.as("is_prefix"),
            ])
            .where("deleted_at", "is", null)
        )
        .with("scored_with_max", (db) =>
          db
            .selectFrom("scored as s")
            .selectAll()
            .select((eb) => [sql<number>`MAX(s.rel) OVER ()`.as("max_rel")])
        )
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
        ])
        .innerJoin("scored_with_max as s", "t.id", "s.id")
        .where(
          sql<boolean>`
            s.is_prefix
            OR ( s.rel > 0 AND s.rel >= ${HYBRID_RELEVANCE_RATIO}*s.max_rel)
          `
        )
        .orderBy(sql`CASE WHEN s.is_prefix THEN 0 ELSE 1 END`, "asc")
        .orderBy(sql`CASE WHEN s.is_prefix THEN t.name ELSE NULL END`, "asc")
        .orderBy(sql<number>`s.rel`, "desc")
        .orderBy("t.created_at", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      return {
        data,
        pagination: {
          total,
          limit,
          offset,
          hasNext: offset + limit < total,
          hasPrev: offset > 0,
        },
      };
    }

    const { total } = await db
      .selectFrom("tracks as t")
      .select(({ fn }) => fn.countAll<number>().as("total"))
      .$call((query) => applyTrackQueryFilters(query, { q, search_mode, include_deleted }))
      .executeTakeFirstOrThrow();

    const shouldRankByRelevance = Boolean(q && search_mode === "fulltext" && sort === "relevance");
    const fallbackSort: TrackSortOption = shouldRankByRelevance
      ? "relevance"
      : sort === "relevance"
      ? "created_at"
      : sort;

    const isFullTextSearch = !!q && search_mode === "fulltext" && fallbackSort === "relevance";
    const data = await getTrackBaseQuery(db)
      .$call((query) => applyTrackQueryFilters(query, { q, search_mode, include_deleted }))
      .$if(isFullTextSearch, (query) => {
        const relevanceExpression = sql<number>`MATCH(t.name) AGAINST (${q} IN NATURAL LANGUAGE MODE)`;
        return query.select(relevanceExpression.as("relevance")).orderBy("relevance", order);
      })
      .$if(!isFullTextSearch, (query) => {
        const sortColumn = fallbackSort === "name" ? "t.name" : "t.created_at";
        return query.orderBy(sortColumn, order);
      })
      .limit(limit)
      .offset(offset)
      .execute();

    // .where(filterExpression())
    // .orderBy(sql`CASE WHEN t.name LIKE ${prefixPattern} THEN 0 ELSE 1 END`, "asc")
    // .orderBy(sql`CASE WHEN t.name LIKE ${prefixPattern} THEN t.name ELSE NULL END`, "asc")
    // .$if(includeFullText, (query) =>
    //   query.orderBy(sql<number>`MATCH(t.name) AGAINST (${trimmedQuery} IN NATURAL LANGUAGE MODE)`, "desc")
    // )
    // .orderBy("t.created_at", "desc")
    // .$if(limit !== undefined, (query) => query.limit(limit as number))
    // .$if(offset !== undefined, (query) => query.offset(offset as number));

    return {
      data,
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    };
  };

  const suggestTracks = async ({ q, limit = 10 }: TrackSuggestOptions) => {
    const startedAt = Date.now();
    const boundedLimit = Math.min(Math.max(limit, 1), 10);
    const trimmedQuery = q.trim();
    const searchContext = await buildHybridSearchContext(db, trimmedQuery, false);

    const suggestions = await db
      .selectFrom("tracks as t")
      .select(["t.id", "t.name"])
      .$call((query) => searchContext.searchQueryModifier(query, { limit: boundedLimit, offset: 0 }))
      .execute();

    return {
      suggestions,
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
