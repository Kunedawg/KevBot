import { db } from "../db/connection";
import * as tracksService from "../services/tracksService";
import * as playlistsService from "../services/playlistsService";

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

export const logTracksPlay = async (track_id: number, play_type: PlayType, options: LogOptions = {}) => {
  return await db.transaction().execute(async (trx) => {
    await tracksService.getTrackById(track_id); // ensures that the track_id is actually valid
    const { user_id } = options;
    await trx.insertInto("track_plays").values({ track_id, play_type, user_id }).execute();

    // Increment raw_total_play_count
    await trx
      .insertInto("track_play_counts")
      .values({
        track_id,
        raw_total_play_count: 1,
      })
      .onDuplicateKeyUpdate((eb) => ({
        raw_total_play_count: eb("raw_total_play_count", "+", 1),
      }))
      .execute();

    // Increment total_play_count if needed
    if (PLAY_TYPES_OF_TOTAL_PLAY_COUNT.includes(play_type)) {
      await trx
        .updateTable("track_play_counts")
        .where("track_id", "=", track_id)
        .set((eb) => ({
          total_play_count: eb("total_play_count", "+", 1),
        }))
        .execute();
    }

    // Increment play_type count
    await trx
      .insertInto("track_play_type_counts")
      .values({
        track_id,
        play_type,
        play_count: 1,
      })
      .onDuplicateKeyUpdate((eb) => ({
        play_type,
        play_count: eb("play_count", "+", 1),
      }))
      .execute();

    return { message: "Successfully logged track play." };
  });
};

export const logRandomPlaylistPlay = async (playlist_id: number, options: LogOptions = {}) => {
  return await db.transaction().execute(async (trx) => {
    await playlistsService.getPlaylistById(playlist_id); // ensures playlist exists
    const { user_id } = options;
    await trx.insertInto("playlist_plays").values({ playlist_id, user_id }).execute();
    return { message: "Successfully logged random playlist play." };
  });
};
