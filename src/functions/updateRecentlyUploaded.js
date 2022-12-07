const gd = require("../globaldata.js");
const hf = require("../helperfcns.js");

// Updates the most played list
function updateRecentlyUploaded() {
  return new Promise(async (resolve, reject) => {
    try {
      // Call stored procedure
      let queryStr = `SELECT audio.audio_name, audio.dt_created
            FROM audio
            ORDER BY audio.dt_created DESC
            LIMIT 100;`;
      let results = await hf.asyncQuery(gd.sqlconnection, queryStr);

      // loop over results
      for (let result of results) {
        gd.recentlyUploadedList.push({
          audio: result["audio_name"],
          datetime: result["dt_created"],
        });
      }

      return resolve();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { updateRecentlyUploaded };
