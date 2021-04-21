// imports
var gd = require("../globaldata.js");
const { Message } = require("discord.js");
const { logCategoryPlaySQL } = require("../functions/logCategoryPlaySQL.js");
const hf = require("../helperfcns.js");

module.exports = {
  name: "pr",
  description: "Play a random file from the given category.",
  usage: "pr!, pr!all, pr!arnold",
  /**
   * @param {Object} methodargs
   * @param {Message} methodargs.message
   * @param {Array.<string>} methodargs.args
   */
  execute({ message, args }) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get discord ID, category and list length
        var _discordId = message?.author?.id;
        var category = args?.[0] || "all";
        const listLength = args?.[1];

        // Get the audioList
        let lists = await hf.getList(category, _discordId, listLength);
        if (!lists?.audioNameList) {
          return reject({
            userMess: `"${category}" is not a valid category for random plays, ya dingus!`,
          });
        }

        // Play a random file that category
        const indexToPlay = Math.floor(
          Math.random() * lists.audioNameList.length
        ); // returns a random integer from 0 to amount of commands
        await gd.client.commands.get("p").execute({
          audio: lists.audioNameList[indexToPlay],
          voiceChannel: message?.member?.voice?.channel,
          discordId: _discordId,
          playType: gd.PLAY_TYPE.PLAY_RANDOM,
        });
      } catch (err) {
        return reject(err);
      }

      // On every random play log it
      try {
        await logCategoryPlaySQL(_discordId, category);
      } catch (err) {
        return reject({
          userMess: "SUPPRESS_GENERAL_ERR_MESSAGE",
          err: err,
        });
      }

      // return promise, no user message is needed
      return resolve();
    });
  },
};
