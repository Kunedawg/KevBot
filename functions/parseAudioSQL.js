// imports
const gd = require('../globaldata.js');
const hf = require('../helperfcns.js');

// For logging calls of pr!
function parseAudioSQL (discordId, category) {
    return new Promise(async(resolve,reject) => {
        try {
            // Call stored procedure
            let queryStr = 
            `SELECT audio.audio_name, player_info.discord_id
            FROM audio
            INNER JOIN player_info
            ON audio.player_id = player_info.player_id;`;
            let results = await hf.asyncQuery(gd.sqlconnection, queryStr);

            // loop over results and create a dictionary of lists
            let uploadsByDiscordId = {};
            for (let result of results){
                let audio = result["audio_name"];
                let dicordId = result["discord_id"];
                if (Object.keys(uploadsByDiscordId).includes(dicordId)) {
                    uploadsByDiscordId[dicordId].push(audio);
                } else {
                    uploadsByDiscordId[dicordId] = [audio];
                }
            }

            // Update the global var
            gd.uploadsByDiscordId = uploadsByDiscordId;
            return resolve();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    parseAudioSQL
};