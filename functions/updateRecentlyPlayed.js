// imports
const gd = require('../globaldata.js');
const hf = require('../helperfcns.js');

// Updates the most played list
function updateRecentlyPlayed() {
    return new Promise(async(resolve,reject) => {
        try {
            // Call stored procedure
            let queryStr = 
            `SELECT audio.audio_name, audio_play_log.dt_played
            FROM audio_play_log
            INNER JOIN audio
            ON audio_play_log.audio_id = audio.audio_id
            ORDER BY audio_play_log.dt_played DESC
            LIMIT 100;`;
            let results = await hf.asyncQuery(gd.sqlconnection, queryStr);

            // console.log(results);

            // loop over results
            for (let result of results){
                gd.recentlyPlayedList.push({
                    audio : result["audio_name"],
                    datetime : result["dt_played"]
                });
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