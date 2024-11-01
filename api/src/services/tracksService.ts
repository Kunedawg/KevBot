const knex = require("../db/connection");
const tracksBucket = require("../storage/tracksBucket");

interface TrackOptions {
  name?: string;
  include_deleted?: boolean;
}

interface Track {
  id: number;
  name: string;
  duration: number;
  user_id: number;
  deleted_at?: Date | null;
  created_at: Date;
  updated_at: Date;
  total_play_count?: number;
  raw_total_play_count?: number;
}

export const getTracks = async (options: TrackOptions = {}): Promise<Track[]> => {
  const { name, include_deleted = false } = options;
  try {
    const query = knex({ t: "tracks" })
      .select("t.*", "tpc.total_play_count", "tpc.raw_total_play_count")
      .leftJoin({ tpc: "track_play_counts" }, "t.id", "tpc.track_id");
    if (name) {
      query.andWhere("t.name", name);
    }
    if (!include_deleted) {
      query.andWhere("t.deleted_at", null);
    }
    return await query;
  } catch (error) {
    throw error;
  }
};

export const getTrackById = async (id: number | string): Promise<Track | undefined> => {
  try {
    return await knex({ t: "tracks" })
      .where("t.id", id)
      .select("t.*", "tpc.total_play_count", "tpc.raw_total_play_count")
      .leftJoin({ tpc: "track_play_counts" }, "t.id", "tpc.track_id")
      .first();
  } catch (error) {
    throw error;
  }
};

export const getTrackFile = async (track: Track) => {
  try {
    const file = tracksBucket.file(`${track.id}.mp3`);
    const [exists] = await file.exists();
    if (!exists) return null;
    return file;
  } catch (error) {
    throw error;
  }
};

export const patchTrack = async (id: number | string, name: string): Promise<Track | undefined> => {
  try {
    await knex("tracks").where("id", id).update({ name });
    return await getTrackById(id);
  } catch (error) {
    throw error;
  }
};

export const deleteTrack = async (id: number | string): Promise<Track | undefined> => {
  try {
    await knex("tracks").where("id", id).andWhere("deleted_at", null).update({ deleted_at: knex.fn.now() });
    return await getTrackById(id);
  } catch (error) {
    throw error;
  }
};

export const restoreTrack = async (id: number | string): Promise<Track | undefined> => {
  try {
    await knex("tracks").where("id", id).whereNotNull("deleted_at").update({ deleted_at: null });
    return await getTrackById(id);
  } catch (error) {
    throw error;
  }
};

export const postTrack = async (
  filepath: string,
  name: string,
  duration: number,
  user_id: number | string
): Promise<Track> => {
  if (!filepath || !name || !duration || !user_id) {
    throw new Error("invalid args");
  }

  const trx = await knex.transaction();
  try {
    const [id] = await trx("tracks").insert({ name, duration, user_id });
    const track = await trx("tracks").where("id", id).first();
    await tracksBucket.upload(filepath, {
      destination: `${track.id}.mp3`,
      resumable: false,
      metadata: {
        contentType: "audio/mpeg",
      },
    });
    await trx.commit();
    return track;
  } catch (error) {
    await trx.rollback();
    console.error("Error occurred during postTrack operation:", error);
    throw error;
  }
};
