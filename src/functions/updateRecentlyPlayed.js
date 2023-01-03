var { sqlDatabase, recentlyPlayedList } = require("../data");

/**
 * Updates the most played list
 */
async function updateRecentlyPlayed() {
  let results = await sqlDatabase.asyncQuery(
    `SELECT audio.audio_name, audio_play_log.dt_played
      FROM audio_play_log
      INNER JOIN audio
      ON audio_play_log.audio_id = audio.audio_id
      ORDER BY audio_play_log.dt_played DESC
      LIMIT 100;`
  );
  recentlyPlayedList = results.map((result) => ({
    audio: result["audio_name"],
    datetime: result["dt_played"],
  }));
}

module.exports = { updateRecentlyPlayed };
