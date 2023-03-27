const { sqlDatabase } = require("../../data");

/**
 * For logging category plays with pr!
 * @param {string} discordId
 * @param {string} category
 */
function logCategoryPlaySql(discordId = 0, category) {
  return new Promise(async (resolve, reject) => {
    let results = await sqlDatabase.asyncQuery(
      `CALL log_category_play('${discordId}', '${category}', @message); SELECT @message;`
    );
    let rtnMess = results[1][0]["@message"];
    if (rtnMess === "Success") {
      return resolve("Logged audio successfully");
    } else {
      return reject(`Failed to log random play. SQL says: ${rtnMess}`);
    }
  });
}

module.exports = { logCategoryPlaySql };
