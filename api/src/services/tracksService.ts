import { KevbotDb } from "../db/connection";
import { Track } from "../db/schema";
import { Kysely, SelectQueryBuilder, Transaction, sql } from "kysely";
import { Database } from "../db/schema";
import * as Boom from "@hapi/boom";
import { Bucket } from "@google-cloud/storage";

type TrackSearchMode = "fulltext" | "contains" | "hybrid";
type TrackSortOption = "relevance" | "created_at" | "name";
type TrackSortOrder = "asc" | "desc";

interface TrackOptions {
  name?: Track["name"];
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

    let maxRelevanceQuery = dbTrx
      .selectFrom("tracks as t")
      .select(sql<number>`MAX(MATCH(t.name) AGAINST (${trimmedQuery} IN NATURAL LANGUAGE MODE))`.as("max_relevance"));

    if (!includeDeleted) {
      maxRelevanceQuery = maxRelevanceQuery.where("t.deleted_at", "is", null);
    }

    maxRelevanceQuery = maxRelevanceQuery.where(
      sql<boolean>`MATCH(t.name) AGAINST (${trimmedQuery} IN NATURAL LANGUAGE MODE)`
    );

    const maxRelevanceRow = await maxRelevanceQuery.executeTakeFirst();
    const maxRelevance = maxRelevanceRow?.max_relevance ?? 0;
    const relevanceThreshold = maxRelevance * HYBRID_RELEVANCE_RATIO;
    const includeNgram = maxRelevance > 0;

    const filterExpression = includeNgram
      ? () =>
          sql<boolean>`
            t.name LIKE ${prefixPattern}
            OR (
              NOT (t.name LIKE ${prefixPattern})
              AND MATCH(t.name) AGAINST (${trimmedQuery} IN NATURAL LANGUAGE MODE) >= ${relevanceThreshold}
            )
          `
      : () => sql<boolean>`t.name LIKE ${prefixPattern}`;

    const prefixPriorityExpression = () => sql`CASE WHEN t.name LIKE ${prefixPattern} THEN 0 ELSE 1 END`;
    const prefixAlphaExpression = () => sql`CASE WHEN t.name LIKE ${prefixPattern} THEN t.name ELSE NULL END`;
    const relevanceExpression = () => sql<number>`MATCH(t.name) AGAINST (${trimmedQuery} IN NATURAL LANGUAGE MODE)`;

    return {
      filterExpression,
      prefixPriorityExpression,
      prefixAlphaExpression,
      relevanceExpression,
      includeNgram,
    };
  };

  const getTracksWithHybridSearch = async ({
    q,
    include_deleted = false,
    limit,
    offset,
  }: Required<Pick<TrackOptions, "q" | "include_deleted" | "limit" | "offset">>) => {
    const searchContext = await buildHybridSearchContext(db, q, include_deleted);

    let query = getTrackBaseQuery(db);

    if (!include_deleted) {
      query = query.where("t.deleted_at", "is", null);
    }

    query = query.where(searchContext.filterExpression());

    query = query.orderBy(searchContext.prefixPriorityExpression(), "asc");
    query = query.orderBy(searchContext.prefixAlphaExpression(), "asc");

    if (searchContext.includeNgram) {
      query = query.orderBy(searchContext.relevanceExpression(), "desc");
    }

    query = query.orderBy("t.created_at", "desc");

    const data = await query.limit(limit).offset(offset).execute();

    let countQuery = db.selectFrom("tracks as t").select(({ fn }) => fn.count<number>("t.id").as("total"));

    if (!include_deleted) {
      countQuery = countQuery.where("t.deleted_at", "is", null);
    }

    countQuery = countQuery.where(searchContext.filterExpression());

    const { total } = await countQuery.executeTakeFirstOrThrow();

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

  const applyTrackFilters = (
    qb: SelectQueryBuilder<Database, any, any>,
    {
      include_deleted = false,
      name,
      q,
      search_mode = "fulltext",
    }: Pick<TrackOptions, "include_deleted" | "name" | "q" | "search_mode">
  ): SelectQueryBuilder<Database, any, any> => {
    let query = qb;
    if (!include_deleted) {
      query = query.where("t.deleted_at", "is", null);
    }
    if (name) {
      query = query.where(sql<boolean>`t.name = ${name}`);
    } else if (q) {
      if (search_mode === "contains") {
        query = query.where(sql<boolean>`t.name LIKE ${`%${q}%`}`);
      } else if (search_mode === "fulltext") {
        query = query.where(sql<boolean>`MATCH(t.name) AGAINST (${q} IN NATURAL LANGUAGE MODE)`);
      } else {
        // Hybrid search mode filters are applied in dedicated logic.
      }
    }
    return query;
  };

  const getTracks = async (options: TrackOptions = {}) => {
    const {
      name,
      q,
      search_mode = "fulltext",
      sort = "created_at",
      order = "desc",
      include_deleted = false,
      limit = 20,
      offset = 0,
    } = options;

    const sanitizedOrder: TrackSortOrder = order === "asc" ? "asc" : "desc";
    if (q && search_mode === "hybrid") {
      return getTracksWithHybridSearch({
        q,
        include_deleted,
        limit,
        offset,
      });
    }

    const shouldRankByRelevance = Boolean(q && search_mode === "fulltext" && sort === "relevance");
    const fallbackSort: TrackSortOption = shouldRankByRelevance
      ? "relevance"
      : sort === "relevance"
      ? "created_at"
      : sort;

    const countQuery = applyTrackFilters(
      db.selectFrom("tracks as t").select(({ fn }) => fn.count<number>("t.id").as("total")),
      { name, q, search_mode, include_deleted }
    );

    const { total } = await countQuery.executeTakeFirstOrThrow();

    let query = applyTrackFilters(getTrackBaseQuery(db), { name, q, search_mode, include_deleted });

    if (q && search_mode === "fulltext" && fallbackSort === "relevance") {
      const relevanceExpression = sql<number>`MATCH(t.name) AGAINST (${q} IN NATURAL LANGUAGE MODE)`;
      query = query.select(relevanceExpression.as("relevance")).orderBy("relevance", sanitizedOrder);
    } else {
      const sortColumn = fallbackSort === "name" ? "t.name" : "t.created_at";
      query = query.orderBy(sortColumn as "t.created_at" | "t.name", sanitizedOrder);
    }

    const data = await query.limit(limit).offset(offset).execute();

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

    let suggestionQuery = db
      .selectFrom("tracks as t")
      .select(["t.id", "t.name"])
      .where("t.deleted_at", "is", null)
      .where(searchContext.filterExpression());

    suggestionQuery = suggestionQuery.orderBy(searchContext.prefixPriorityExpression(), "asc");
    suggestionQuery = suggestionQuery.orderBy(searchContext.prefixAlphaExpression(), "asc");

    if (searchContext.includeNgram) {
      suggestionQuery = suggestionQuery.orderBy(searchContext.relevanceExpression(), "desc");
    }

    suggestionQuery = suggestionQuery.orderBy("t.created_at", "desc").limit(boundedLimit);

    const suggestions = await suggestionQuery.execute();

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
