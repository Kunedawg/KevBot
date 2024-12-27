import { KevbotDb } from "../db/connection";
import { Track } from "../db/schema";
import { Kysely, sql, Transaction } from "kysely";
import { Database } from "../db/schema";
import * as Boom from "@hapi/boom";
import { Bucket } from "@google-cloud/storage";

interface TrackOptions {
  name?: string;
  include_deleted?: boolean;
}

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
      throw Boom.forbidden("You do not have permission to modify this playlist.");
    }
  };

  const getTracks = async (options: TrackOptions = {}) => {
    const { name, include_deleted = false } = options;
    let query = getTrackBaseQuery(db);
    if (name) {
      query = query.where("t.name", "=", name);
    }
    if (!include_deleted) {
      query = query.where("t.deleted_at", "is", null);
    }
    return await query.execute();
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

  const postTrack = async (filepath: string, name: string, duration: number, req_user_id: number) => {
    await validateTrackNameIsUnique(name);
    return await db.transaction().execute(async (trx) => {
      // TODO: why is the insertId incrementing even on failed inserts?
      const { insertId } = await trx
        .insertInto("tracks")
        .values({ name, duration, user_id: req_user_id })
        .executeTakeFirstOrThrow();
      const track = await getTrackById(Number(insertId), trx);
      await tracksBucket.upload(filepath, {
        destination: `${track.id}.mp3`,
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
    getTrackById,
    getTrackFile,
    patchTrack,
    deleteTrack,
    restoreTrack,
    postTrack,
  };
}

export type TracksService = ReturnType<typeof tracksServiceFactory>;
