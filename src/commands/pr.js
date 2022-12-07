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
   * @param {string} methodargs.category
   * @param {VoiceChannel} methodargs.voiceChannel
   * @param {string} methodargs.discordId
   * @param {number} methodargs.playType
   */
  execute({ message, args, category, voiceChannel, discordId, playType }) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get discord ID, category, voice channel, play type and list length
        var _discordId = discordId || message?.author?.id;
        var _category = category || args?.[0] || "all";
        var _voiceChannel = voiceChannel || message?.member?.voice?.channel;
        const _listLength = args?.[1]; // listLength argument is relevant to certain categories like most played or recent played.
        var _playType = playType || gd.PLAY_TYPE.PLAY_RANDOM; 

        // Get the audio name list from the given category name
        let lists = await hf.getList(_category, _discordId, _listLength);
        if (!lists?.audioNameList) {
          return reject({
            userMess: `"${_category}" is not a valid category for random plays, ya dingus!`,
          });
        }

        // Play a random file that category
        const indexToPlay = Math.floor(Math.random() * lists.audioNameList.length); // returns a random integer from 0 to amount of commands
        await gd.client.commands.get("p").execute({
          audio: lists.audioNameList[indexToPlay],
          voiceChannel: _voiceChannel,
          discordId: _discordId,
          playType: _playType,
        });
      } catch (err) {
        return reject(err);
      }

      // On every random play log it
      try {
        await logCategoryPlaySQL(_discordId, _category);
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
