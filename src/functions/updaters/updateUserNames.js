const { Client } = require("discord.js");
const { sqlDatabase } = require("../../data");

/**
 * Updates the user names on SQL
 * @param {Client} client
 */
async function updateUserNames(client) {
  // Retrieve all discord ids and user names from discord
  let userNameDict = {};
  for (let guild of client.guilds.cache) {
    let members = await guild[1].members.fetch();
    for (member of members) {
      let discordId = member[1].user.id;
      let userName = member[1].user.username;
      userNameDict[discordId] = userName;
    }
  }

  // Retrieve all the discord IDs and user names from SQL
  let results = await sqlDatabase.asyncQuery(
    "SELECT player_info.discord_id, player_info.discord_user_name FROM player_info;"
  );

  // Loop over SQL results and check if there are any name mismatches, update name if there is
  for (result of results) {
    let discordId = result["discord_id"];
    if (Object.keys(userNameDict).includes(discordId)) {
      let userNameDiscord = userNameDict[discordId];
      let userNameSQL = result["discord_user_name"];
      if (userNameDiscord != userNameSQL) {
        // Update discord user names if needed
        console.log(`Update discord id "${discordId}" username from "${userNameSQL}" to "${userNameDiscord}"`);
        let results = await sqlDatabase.asyncQuery(
          `CALL update_discord_user_name('${discordId}', '${userNameDiscord}', @message); SELECT @message;`
        );
        let rtnMess = results[1][0]["@message"];
        if (rtnMess !== "Success") {
          throw new Error(`Failed to update discord username for discord ID "${discordId}"`);
        }
      }
    }
  }
}

module.exports = { updateUserNames };
