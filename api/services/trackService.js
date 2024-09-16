const knex = require("../db/connection");
const tracksBucket = require("../storage/tracksBucket");

exports.getTracks = async (options = {}) => {
  const { name, include_deleted = false } = options;
  try {
    const query = knex("audio");
    if (name) {
      query.andWhere("audio_name", name);
    }
    if (!include_deleted) {
      query.andWhere("deleted_at", null);
    }
    const fields = include_deleted ? ["*"] : ["audio_id", "audio_name", "dt_created", "player_id", "duration"];
    return await query.select(fields);
  } catch (error) {
    throw error;
  }
};

exports.getTrackById = async (id) => {
  try {
    return await knex("audio").where("audio_id", id).first();
  } catch (error) {
    throw error;
  }
};

exports.getTrackFile = async (track) => {
  try {
    const file = tracksBucket.file(`${track.audio_id}.mp3`);
    const exists = await file.exists();
    if (!exists[0]) return null;
    return file;
  } catch (error) {
    throw error;
  }
};

exports.patchTrack = async (id, name) => {
  try {
    await knex("audio").where("audio_id", id).update({ audio_name: name });
    return await this.getTrackById(id);
  } catch (error) {
    throw error;
  }
};

exports.deleteTrack = async (id) => {
  try {
    await knex("audio").where("audio_id", id).andWhere("deleted_at", null).update({ deleted_at: knex.fn.now() });
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
    const [id] = await trx("audio").insert({ audio_name: name, duration: duration, player_id: user_id });
    const track = await trx("audio").where("audio_id", id).first();
    await tracksBucket.upload(filepath, {
      destination: `${track.audio_id}.mp3`,
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
