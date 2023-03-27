const { sqlDatabase } = require("../../data");

/**
 * For logging plays of audio to sql. Note playType = (0: p!, 1 : pr!, 2 : greeting!, 3 : raid!, 4: farewell!)
 * @param {string} discordId
 * @param {string} audio
 * @param {number} playType
 */
function logAudioPlaySql(discordId = 0, audio, playType) {
  return new Promise(async (resolve, reject) => {
    let results = await sqlDatabase.asyncQuery(
      `CALL log_audio_play('${discordId}', '${audio}', '${playType}', @message); SELECT @message;`
    );
    let rtnMess = results[1][0]["@message"];
    if (rtnMess === "Success") {
      return resolve("Logged audio successfully");
    } else {
      return reject("Failed to log audio");
    }
  });
}

module.exports = { logAudioPlaySql };
