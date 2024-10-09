const knex = require("../db/connection");

exports.PLAY_TYPE = {
  PLAY: 0,
  PLAY_RANDOM: 1,
  GREETING: 2,
  RAID: 3,
  FAREWELL: 4,
  CATEGORY_GREETING: 5,
};

exports.logTracksPlay = async (track_id, play_type, options = {}) => {
  // if (!track_id || !play_type) {
  //   throw new Error("invalid args");
  // }

  const trx = await knex.transaction();
  try {
    const { user_id } = options;
    await trx("track_plays").insert({ track_id: track_id, type: play_type, user_id: user_id });
    await trx.commit();
    // TODO: increment track play count (by type?)
    return {
      message: "Successfully logged track play.",
    };
  } catch (error) {
    await trx.rollback();
    console.error("Error occurred during logTracksPlay operation:", error);
    throw error;
  }
};

exports.logRandomPlaylistPlay = async (playlist_id, options = {}) => {
  // if (!track_id || !play_type) {
  //   throw new Error("invalid args");
  // }

  const trx = await knex.transaction();
  try {
    const { user_id } = options;
    await trx("playlist_plays").insert({ playlist_id: playlist_id, user_id: user_id });
    await trx.commit();
    // TODO: increment track play count (by type?)
    return {
      message: "Successfully logged random playlist play.",
    };
  } catch (error) {
    await trx.rollback();
    console.error("Error occurred during logRandomPlaylistPlay operation:", error);
    throw error;
  }
};
