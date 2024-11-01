import knex from "../db/connection";

export const PLAY_TYPE = {
  PLAY: 0,
  PLAY_RANDOM: 1,
  GREETING: 2,
  RAID: 3,
  FAREWELL: 4,
  CATEGORY_GREETING: 5,
} as const;

export type PlayType = (typeof PLAY_TYPE)[keyof typeof PLAY_TYPE];

export const PLAY_TYPES_OF_TOTAL_PLAY_COUNT: PlayType[] = [PLAY_TYPE.PLAY, PLAY_TYPE.RAID, PLAY_TYPE.PLAY_RANDOM];

interface LogOptions {
  user_id?: number;
}

export const logTracksPlay = async (
  track_id: number,
  play_type: PlayType,
  options: LogOptions = {}
): Promise<{ message: string }> => {
  const trx = await knex.transaction();
  try {
    const { user_id } = options;
    await trx("track_plays").insert({ track_id, play_type, user_id });

    // Increment raw_total_play_count
    await trx("track_play_counts")
      .insert({
        track_id,
        raw_total_play_count: 1,
      })
      .onConflict("track_id")
      .merge({ raw_total_play_count: trx.raw("?? + ?", ["raw_total_play_count", 1]) });

    // Increment total_play_count if needed
    if (PLAY_TYPES_OF_TOTAL_PLAY_COUNT.includes(play_type)) {
      await trx("track_play_counts").where("track_id", track_id).increment("total_play_count", 1);
    }

    // Increment play_type count
    await trx("track_play_type_counts")
      .insert({
        track_id,
        play_type,
        play_count: 1,
      })
      .onConflict(["track_id", "play_type"])
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

export const logRandomPlaylistPlay = async (
  playlist_id: number,
  options: LogOptions = {}
): Promise<{ message: string }> => {
  const trx = await knex.transaction();
  try {
    const { user_id } = options;
    await trx("playlist_plays").insert({ playlist_id, user_id });
    await trx.commit();
    return {
      message: "Successfully logged random playlist play.",
    };
  } catch (error) {
    await trx.rollback();
    console.error("Error occurred during logRandomPlaylistPlay operation:", error);
    throw error;
  }
};
