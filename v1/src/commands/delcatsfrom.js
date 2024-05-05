const { Message } = require("discord.js");
const { sqlDatabase, audioDict, categoryDict } = require("../data");
const { updateCategoryDict } = require("../functions/updaters/updateCategoryDict");

module.exports = {
  name: "delcatsfrom",
  description: "Deletes the given audio from the specified categories.",
  usage: "delcatsfrom!audioName categoryName1 categoryName2 categoryName3...",
  /**
   * @param {Object} methodargs
   * @param {Message} methodargs.message
   * @param {Array.<string>} methodargs.args
   */
  execute({ message, args }) {
    return new Promise(async (resolve, reject) => {
      // Get discord id and check that it is valid
      let discordId = message?.author?.id;
      if (!discordId) {
        return reject({ userMess: `Failed to retrieve discord id!` });
      }

      // Check that the args length is at least 2 (category and audio)
      if (args.length < 2) {
        return reject({
          userMess: `Please provide at least two arguments. Category name followed by as many audio names as you would like.`,
        });
      }

      // Get category and audio array
      var audio = args.shift();
      var categoryArray = args;

      // Check that audio name actually exists
      if (!Object.keys(audioDict).includes(audio)) {
        return reject({ userMess: `The audio "${audio}" does not exist!` });
      }

      // Loop over the audio array and call the store procedure
      try {
        for (let category of categoryArray) {
          // Check that category name is in the categoryDict
          if (!Object.keys(categoryDict).includes(category)) {
            message.author.send(`The category "${category}" does not exist or it is empty!`);
            continue;
          }

          // Check if the audio is in the category
          if (!categoryDict[category].includes(audio)) {
            message.author.send(
              `Audio "${audio}" is not in the category "${category}", so it cannot be removed from that category!`
            );
            continue;
          }

          // Check that the user originally created this category or is the master user
          try {
            if (Number(discordId) != Number(process.env.MASTER_DISCORD_ID)) {
              let results = await sqlDatabase.asyncQuery(
                `SELECT discord_id FROM categories INNER JOIN player_info ON player_info.player_id = categories.player_id WHERE category_name = '${category}';`
              );
              if (!results[0]) {
                message.author.send(
                  `The creator of the category "${category}" could not be determined, so you may not remove audio "${audio}" from it!`
                );
                continue;
              }
              let rtnDiscordId = results[0]["discord_id"];
              if (Number(discordId) != Number(rtnDiscordId)) {
                message.author.send(
                  `You did not create the category "${category}" so you may not remove audio "${audio}" from it!`
                );
                continue;
              }
            }
          } catch (err) {
            return reject(err);
          }

          // Call stored procedure
          let results = await sqlDatabase.asyncQuery(
            `CALL del_audio_category('${audio}', '${category}', @message); SELECT @message;`
          );
          let rtnMess = results[1][0]["@message"];
          if (rtnMess === "Success") {
            updateCategoryDict(categoryDict, category, audio, "remove");
            message.author.send(`audio "${audio}" has been deleted from the category "${category}"!`);
          } else {
            return reject({
              userMess: "Deleting audio from category was aborted! Try again later or talk to Kevin.",
              err: rtnMess,
            });
          }
        }
      } catch (err) {
        return reject(err);
      }

      // Return resolve promise
      return resolve({ userMess: `Deleting audio from category complete!` });
    });
  },
};
