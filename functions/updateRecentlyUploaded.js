// imports
const gd = require('../globaldata.js');
const hf = require('../helperfcns.js');

// Updates the most played list
function updateRecentlyUploaded() {
    return new Promise(async(resolve,reject) => {
        try {
            // Call stored procedure
            let queryStr = 
            `SELECT audio.audio_name
            FROM audio
            ORDER BY audio.dt_created DESC
            LIMIT 100;`;
            let results = await hf.asyncQuery(gd.sqlconnection, queryStr);

            // loop over results, ignore playTypes that are non-zero
            for (let result of results){
                gd.recentlyUploadedList.push(result["audio_name"]);
            }

            return resolve();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    updateRecentlyUploaded
};