// imports
const gd = require('../globaldata.js');
const { Message } = require('discord.js');
const hf = require('../helperfcns.js');

// For calling 
function logAudio (discordId, audio, logType) {
    return new Promise(async(resolve,reject) => {
        // Call stored procedure
        let queryStr = `CALL log_audio_play('${discordId}', '${audio}', '${logType}', @message); SELECT @message;`;
        let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
        let rtnMess = results[1][0]['@message'];
        if (rtnMess === 'Success') {
            return resolve('Logged audio successfully');
        } else {
            return reject("Failed to log audio");
        }
    });
}

module.exports = {
    logAudio
};