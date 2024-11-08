import { db } from "../db/connection";
import tracksBucket from "../storage/tracksBucket";
import { Track } from "../db/schema";

interface TrackOptions {
  name?: string;
  include_deleted?: boolean;
}

export const getTracks = async (options: TrackOptions = {}) => {
  const { name, include_deleted = false } = options;
  let query = db
    .selectFrom("tracks as t")
    .leftJoin("track_play_counts as tpc", "t.id", "tpc.track_id")
    .select([
      "t.id",
      "t.name",
      "t.duration",
      "t.user_id",
      "t.deleted_at",
      "t.created_at",
      "t.updated_at",
      "tpc.total_play_count",
      "tpc.raw_total_play_count",
    ]);
  if (name) {
    query = query.where("t.name", "=", name);
  }
  if (!include_deleted) {
    query = query.where("t.deleted_at", "is", null);
  }
  return await query.execute();
};

export const getTrackById = async (id: number | string) => {
  return await db
    .selectFrom("tracks as t")
    .leftJoin("track_play_counts as tpc", "t.id", "tpc.track_id")
    .select([
      "t.id",
      "t.name",
      "t.duration",
      "t.user_id",
      "t.deleted_at",
      "t.created_at",
      "t.updated_at",
      "tpc.total_play_count",
      "tpc.raw_total_play_count",
    ])
    .where("t.id", "=", Number(id))
    .executeTakeFirst();
};

export const getTrackFile = async (track: Track) => {
  const file = tracksBucket.file(`${track.id}.mp3`);
  const [exists] = await file.exists();
  if (!exists) return null;
  return file;
};

export const patchTrack = async (id: number | string, name: string) => {
  await db.updateTable("tracks").set({ name }).where("id", "=", Number(id)).execute();
  return await getTrackById(id);
};

export const deleteTrack = async (id: number | string) => {
  await db
    .updateTable("tracks")
    .set({ deleted_at: new Date() })
    .where("id", "=", Number(id))
    .where("deleted_at", "is", null)
    .execute();
  return await getTrackById(id);
};

export const restoreTrack = async (id: number | string) => {
  await db
    .updateTable("tracks")
    .set({ deleted_at: null })
    .where("id", "=", Number(id))
    .where("deleted_at", "is not", null)
    .execute();
  return await getTrackById(id);
};

export const postTrack = async (filepath: string, name: string, duration: number, user_id: number | string) => {
  return await db.transaction().execute(async (trx) => {
    const { insertId } = await trx
      .insertInto("tracks")
      .values({ name, duration, user_id: Number(user_id) })
      .executeTakeFirstOrThrow();
    const track = await trx
      .selectFrom("tracks")
      .selectAll()
      .where("id", "=", Number(insertId))
      .executeTakeFirstOrThrow();
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
