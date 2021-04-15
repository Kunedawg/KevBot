// imports
const gd = require('../globaldata.js');
const hf = require('../helperfcns.js');

// Updates the most played list
function updateRecentlyPlayed() {
    return new Promise(async(resolve,reject) => {
        try {
            // Call stored procedure
            let queryStr = 
            `SELECT audio.audio_name
            FROM audio_play_log
            INNER JOIN audio
            ON audio_play_log.audio_id = audio.audio_id
            ORDER BY audio_play_log.dt_played DESC
            LIMIT 100;`;
            let results = await hf.asyncQuery(gd.sqlconnection, queryStr);

            // loop over results, ignore playTypes that are non-zero
            for (let result of results){
                gd.recentlyPlayedList.push(result["audio_name"]);
            }

            return resolve();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    updateRecentlyPlayed
};