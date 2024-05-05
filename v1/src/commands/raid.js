const { Message, ChannelType } = require("discord.js");
const { PLAY_TYPE } = require("../enumerations/PlayType");

module.exports = {
  name: "raid",
  description: "Play audio in a voice channel (numbered top-down starting at 1)",
  usage: "raid!file_name VoiceChannel# (ex: raid!imback 3)",
  /**
   * @param {Object} methodargs
   * @param {Message} methodargs.message
   * @param {Array.<string>} methodargs.args
   */
  execute({ message, args }) {
    return new Promise(async (resolve, reject) => {
      // Check that a voice channel number was provided
      let channelNum = args?.[1];
      if (!channelNum) return reject({ userMess: "Please provide a voice channel number, ya dingus!" });

      // Read-in collection of voice channels, check if user sent message in a text channel
      let voiceChannels = await (
        await message?.guild?.channels.fetch()
      ).filter((ch) => ch.type === ChannelType.GuildVoice);
      if (!voiceChannels) return reject({ userMess: "You need to send this message in a text channel, ya dingus!" });

      // Sort channels by rawPosition and select a channel by the channel #. Check that the selected channel exists.
      let voiceChannelSelected = voiceChannels.find((ch) => ch.rawPosition === channelNum - 1);
      if (!voiceChannelSelected) {
        return reject({
          userMess: `"${channelNum}" is not a valid voice channel number. Pick a number between 1 and ${voiceChannels.size}, ya dingus!`,
        });
      }

      // Calling the play command
      try {
        await message.client.commands.get("p").execute({
          audio: args?.[0],
          voiceChannel: voiceChannelSelected,
          discordId: message?.author?.id,
          playType: PLAY_TYPE.RAID,
        });
      } catch (err) {
        return reject(err);
      }

      return resolve();
    });
  },
};
