// imports
const gd = require('../globaldata.js');
const { Message } = require('discord.js');
const hf = require('../helperfcns.js');

// For logging calls of pr!
function parseAudioLogSQL (discordId, category) {
    return new Promise(async(resolve,reject) => {
        try {
            // Call stored procedure
            let queryStr = 
            `SELECT audio.audio_name, audio_play_log.play_type
            FROM audio_play_log
            INNER JOIN audio
            ON audio_play_log.audio_id = audio.audio_id;`;
            let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
            let playCountDict = {}

            // loop over results, ignore playTypes that are non-zero
            for (let result of results){
                if (result["play_type"] != 0) {continue;}
                if (Object.keys(playCountDict).includes(result["audio_name"])) {
                    playCountDict[result["audio_name"]] = playCountDict[result["audio_name"]] + 1;
                } else {
                    playCountDict[result["audio_name"]] = 1;
                }
            }

            // Sort by most played and update the global data list
            let mostPlayedKeys = Object.keys(playCountDict);
            gd.mostPlayedList = mostPlayedKeys.map(key => {return {audio : key, playCount : playCountDict[key]}})
            gd.mostPlayedList = gd.mostPlayedList.sort((a,b) => b.playCount - a.playCount);

            return resolve();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    parseAudioLogSQL
};