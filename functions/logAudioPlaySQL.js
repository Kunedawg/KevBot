// imports
const gd = require('../globaldata.js');
const hf = require('../helperfcns.js');

// For logging plays of audio to sql. Note playType = (0: p!, 1 : pr!, 2 : greeting!, 3 : farewell!)
    /**
     * @param {string} discordId
     * @param {string} audio
     * @param {number} playType
     */
function logAudioPlaySQL (discordId, audio, playType) {
    return new Promise(async(resolve,reject) => {
        // Call stored procedure
        let queryStr = `CALL log_audio_play('${discordId}', '${audio}', '${playType}', @message); SELECT @message;`;
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
    logAudioPlaySQL
};