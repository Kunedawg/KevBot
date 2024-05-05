var { sqlDatabase, recentlyUploadedList } = require("../../data");

/**
 * Updates recently uploaded list
 */
async function updateRecentlyUploaded() {
  let results = await sqlDatabase.asyncQuery(
    `SELECT audio.audio_name, audio.dt_created
    FROM audio
    ORDER BY audio.dt_created DESC
    LIMIT 100;`
  );
  recentlyUploadedList = results.map((result) => ({
    audio: result["audio_name"],
    datetime: result["dt_created"],
  }));
}

module.exports = { updateRecentlyUploaded };
