var { sqlDatabase, uploadsByDiscordId } = require("../../data");

/**
 * Updates the lists of uploads by user
 */
async function updateUploadsByUsers() {
  let results = await sqlDatabase.asyncQuery(
    `SELECT audio.audio_name, player_info.discord_id
    FROM audio
    INNER JOIN player_info
    ON audio.player_id = player_info.player_id;`
  );
  uploadsByDiscordId = {};
  results.forEach((result) => {
    (uploadsByDiscordId[result["discord_id"]] ||= []).push(result["audio_name"]);
  });
}

module.exports = { updateUploadsByUsers };
