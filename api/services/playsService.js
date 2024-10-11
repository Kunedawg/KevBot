const knex = require("../db/connection");

exports.PLAY_TYPE = {
  PLAY: 0,
  PLAY_RANDOM: 1,
  GREETING: 2,
  RAID: 3,
  FAREWELL: 4,
  CATEGORY_GREETING: 5,
};

exports.PLAY_TYPES_OF_TOTAL_PLAY_COUNT = [this.PLAY_TYPE.PLAY, this.PLAY_TYPE.RAID, this.PLAY_TYPE.PLAY_RANDOM];

exports.logTracksPlay = async (track_id, play_type, options = {}) => {
  // if (!track_id || !play_type) {
  //   throw new Error("invalid args");
  // }

  const trx = await knex.transaction();
  try {
    const { user_id } = options;
    await trx("track_plays").insert({ track_id: track_id, play_type: play_type, user_id: user_id });

    // increment raw_total_play_count
    await trx("track_play_counts")
      .insert({
        track_id: track_id,
        raw_total_play_count: 1,
      })
      .onConflict("track_id")
      .merge({ raw_total_play_count: trx.raw("?? + ?", ["raw_total_play_count", 1]) });

    // increment total_play_count if needed
    if (PLAY_TYPES_OF_TOTAL_PLAY_COUNT.includes(play_type)) {
      await trx("track_play_counts").where("track_id", track_id).increment("total_play_count", 1);
    }

    // increment play_type count
    await trx("track_play_type_counts")
      .insert({
        track_id: track_id,
        play_type: play_type,
        play_count: 1,
      })
      .onConflict("track_id", "play_type")
      .merge({ play_count: trx.raw("?? + ?", ["play_count", 1]) });

    await trx.commit();
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
