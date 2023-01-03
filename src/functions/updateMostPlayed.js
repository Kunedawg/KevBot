var { sqlDatabase, mostPlayedList } = require("../data");

/**
 * Updates the most played list.
 *
 * TODO: figure out bug with play count is miscounting
 */
async function updateMostPlayed() {
  let results = await sqlDatabase.asyncQuery(
    `SELECT audio.audio_name, audio_play_log.play_type
    FROM audio_play_log
    INNER JOIN audio
    ON audio_play_log.audio_id = audio.audio_id;`
  );
  let playCountDict = {};
  results.forEach((result) => {
    if (result["play_type"] != 0) return;
    let audioName = result["audio_name"];
    playCountDict[audioName] = playCountDict[audioName] ? playCountDict[audioName] + 1 : 1;
  });
  mostPlayedList = Object.keys(playCountDict)
    .map((key) => {
      return { audio: key, playCount: playCountDict[key] };
    })
    .sort((a, b) => b.playCount - a.playCount);
}

module.exports = { updateMostPlayed };
