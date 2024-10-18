const knex = require("../db/connection");
const tracksBucket = require("../storage/tracksBucket");

exports.getTracks = async (options = {}) => {
  const { name, include_deleted = false } = options;
  try {
    const query = knex("tracks")
      .select("tracks.*", "track_play_counts.total_play_count", "track_play_counts.raw_total_play_count")
      .join("track_play_counts", "tracks.id", "=", "track_play_counts.track_id");
    if (name) {
      query.andWhere("tracks.name", name);
    }
    if (!include_deleted) {
      query.andWhere("tracks.deleted_at", null);
    }
    return await query;
  } catch (error) {
    throw error;
  }
};

exports.getTrackById = async (id) => {
  try {
    return await knex("tracks")
      .where("id", id)
      .select("tracks.*", "track_play_counts.total_play_count", "track_play_counts.raw_total_play_count")
      .join("track_play_counts", "tracks.id", "=", "track_play_counts.track_id")
      .first();
  } catch (error) {
    throw error;
  }
};

exports.getTrackFile = async (track) => {
  try {
    const file = tracksBucket.file(`${track.id}.mp3`);
    const exists = await file.exists();
    if (!exists[0]) return null;
    return file;
  } catch (error) {
    throw error;
  }
};

exports.patchTrack = async (id, name) => {
  try {
    await knex("tracks").where("id", id).update({ name: name });
    return await this.getTrackById(id);
  } catch (error) {
    throw error;
  }
};

exports.deleteTrack = async (id) => {
  try {
    await knex("tracks").where("id", id).andWhere("deleted_at", null).update({ deleted_at: knex.fn.now() });
    return await this.getTrackById(id);
  } catch (error) {
    throw error;
  }
};

exports.restoreTrack = async (id) => {
  try {
    await knex("tracks").where("id", id).whereNotNull("deleted_at").update({ deleted_at: null });
    return await this.getTrackById(id);
  } catch (error) {
    throw error;
  }
};

exports.postTrack = async (filepath, name, duration, user_id) => {
  if (!filepath || !name || !duration || !user_id) {
    throw new Error("invalid args");
  }

  const trx = await knex.transaction();
  try {
    const [id] = await trx("tracks").insert({ name: name, duration: duration, user_id: user_id });
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
