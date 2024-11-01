const knex = require("../db/connection");
import { PlayType, PLAY_TYPES_OF_TOTAL_PLAY_COUNT } from "../services/playsService";

interface PlayCount {
  track_id: number;
  play_type: string;
  count: number;
}

interface CurrentPlayCount {
  track_id: number;
  play_type: string;
  play_count: number;
}

interface AggregatedCounts {
  raw_total_play_count: number;
  total_play_count: number;
}

interface TotalPlayCount {
  track_id: number;
  total_play_count: number;
  raw_total_play_count: number;
}

const aggregatePlayCounts = async () => {
  console.log(`[${new Date().toISOString()}] Starting play count aggregation...`);

  const trx = await knex.transaction();
  try {
    // Aggregate play counts from track_plays
    const aggregatedPlayCountsByType: PlayCount[] = await trx("track_plays")
      .select("track_id", "play_type")
      .count("id as count")
      .groupBy("track_id", "play_type");

    // Fetch current play_type counts from track_play_type_counts
    const currentPlayCountsByType: CurrentPlayCount[] = await trx("track_play_type_counts").select(
      "track_id",
      "play_type",
      "play_count"
    );
    const currentPlayCountsByTypeMap = new Map<string, number>();
    currentPlayCountsByType.forEach((row) => {
      const key = `${row.track_id}:${row.play_type}`;
      currentPlayCountsByTypeMap.set(key, row.play_count);
    });

    // Iterate over aggregatedPlayCountsByType counts and update if different
    for (const play of aggregatedPlayCountsByType) {
      const { track_id, play_type, count } = play;
      const existingTypeCount = currentPlayCountsByTypeMap.get(`${track_id}:${play_type}`) || 0;
      if (existingTypeCount !== count) {
        await trx("track_play_type_counts")
          .insert({
            track_id,
            play_type,
            play_count: count,
          })
          .onConflict(["track_id", "play_type"])
          .merge({
            play_count: count,
          });
        console.log(`Updated play_count for track_id ${track_id}, play_type ${play_type} to ${count}.`);
      }
    }

    // Loop over play counts by type and aggregate to total play counts
    const aggregatedTotalPlayCountsMap = new Map<number, AggregatedCounts>();
    aggregatedPlayCountsByType.forEach((row) => {
      if (aggregatedTotalPlayCountsMap.has(row.track_id)) {
        const item = aggregatedTotalPlayCountsMap.get(row.track_id)!;
        item.raw_total_play_count += row.count;
        item.total_play_count += PLAY_TYPES_OF_TOTAL_PLAY_COUNT.includes(Number(row.play_type) as PlayType)
          ? row.count
          : 0;
        aggregatedTotalPlayCountsMap.set(row.track_id, item);
      } else {
        aggregatedTotalPlayCountsMap.set(row.track_id, {
          raw_total_play_count: row.count,
          total_play_count: PLAY_TYPES_OF_TOTAL_PLAY_COUNT.includes(Number(row.play_type) as PlayType) ? row.count : 0,
        });
      }
    });

    // Fetch current total_play_count from track_play_counts
    const currentTotalPlayCounts: TotalPlayCount[] = await trx("track_play_counts").select(
      "track_id",
      "total_play_count",
      "raw_total_play_count"
    );
    const currentTotalPlayCountsMap = new Map<number, AggregatedCounts>();
    currentTotalPlayCounts.forEach((row) => {
      currentTotalPlayCountsMap.set(row.track_id, {
        total_play_count: row.total_play_count,
        raw_total_play_count: row.raw_total_play_count,
      });
    });

    // Check and update total_plays
    for (const [track_id, aggregatedCounts] of aggregatedTotalPlayCountsMap) {
      const currentCounts = currentTotalPlayCountsMap.get(track_id) || { total_play_count: 0, raw_total_play_count: 0 };
      if (
        currentCounts.total_play_count !== aggregatedCounts.total_play_count ||
        currentCounts.raw_total_play_count !== aggregatedCounts.raw_total_play_count
      ) {
        await trx("track_play_counts")
          .insert({
            track_id,
            total_play_count: aggregatedCounts.total_play_count,
            raw_total_play_count: aggregatedCounts.raw_total_play_count,
          })
          .onConflict("track_id")
          .merge({
            total_play_count: aggregatedCounts.total_play_count,
            raw_total_play_count: aggregatedCounts.raw_total_play_count,
          });
        console.log(`Updated total_plays for track_id ${track_id} to ${JSON.stringify(aggregatedCounts)}.`);
      }
    }

    await trx.commit();
    console.log(`[${new Date().toISOString()}] Play count aggregation completed successfully.`);
  } catch (error) {
    await trx.rollback();
    console.error(`[${new Date().toISOString()}] Error during aggregation:`, error);
  }
};

export default aggregatePlayCounts;
