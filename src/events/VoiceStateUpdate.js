const { Events, VoiceState, Client } = require("discord.js");
const { GREETING_TYPE } = require("../enumerations/GreetingType");
const { PLAY_TYPE } = require("../enumerations/PlayType");

module.exports = {
  name: Events.VoiceStateUpdate,
  once: false,
  /**
   * @param {Client} client
   * @param {VoiceState} oldUserVoiceState
   * @param {VoiceState} newUserVoiceState
   */
  async execute(client, oldUserVoiceState, newUserVoiceState) {
    try {
      var newUserChannel = newUserVoiceState.channel;
      var oldUserChannel = oldUserVoiceState.channel;
      var newMember = newUserVoiceState.member;
      var oldMember = oldUserVoiceState.member;
      if (oldUserChannel === null && newUserChannel !== null && !newMember.user.bot) {
        // User Joins a voice channel
        var memberToMessage = newMember;
        var commandAttempted = "greeting";
        var response = await client.commands.get("getgreeting").execute({ user: newMember.user });
        if (!response.greeting || (!response.greeting_type && response.greeting_type != 0)) {
          return;
        }
        var _discordId = newMember?.user?.id;
        if (!_discordId) {
          return;
        }
        switch (response.greeting_type) {
          case GREETING_TYPE.FILE:
            await client.commands.get("p").execute({
              audio: response.greeting,
              voiceChannel: newUserChannel,
              discordId: _discordId,
              playType: PLAY_TYPE.GREETING,
            });
            break;
          case GREETING_TYPE.CATEGORY:
            await client.commands.get("pr").execute({
              category: response.greeting,
              voiceChannel: newUserChannel,
              discordId: _discordId,
              playType: PLAY_TYPE.CATEGORY_GREETING,
              client: client,
            });
            break;
          default:
            console.error(`An invalid greeting_type has been set for discord_id: ${_discordId}`);
        }
      } else if (newUserChannel === null && oldUserChannel !== null && !oldMember.user.bot) {
        // User leaves a voice channel
        var memberToMessage = oldMember;
        var commandAttempted = "farewell";
        var response = await client.commands.get("getfarewell").execute({ user: oldMember.user });
        if (!response.farewell) {
          return;
        }
        var _discordId = oldMember?.user?.id;
        if (!_discordId) {
          return;
        }
        await client.commands.get("p").execute({
          audio: response.farewell,
          voiceChannel: oldUserChannel,
          discordId: _discordId,
          playType: PLAY_TYPE.FAREWELL,
        });
      }
    } catch (err) {
      // Console logging
      console.error(
        `onVoiceStateUpdate error. DiscordID: "${_discordId || "undefined"}". Command: "${
          commandAttempted || "undefined"
        }". response: "${response ? JSON.stringify(response) : "undefined"}" Failed with err: `,
        err
      );

      // User response
      if (memberToMessage) {
        if (err.userMess) {
          if (err.userMess != "SUPPRESS_GENERAL_ERR_MESSAGE") {
            memberToMessage.send(err.userMess);
          }
        } else {
          if (commandAttempted) {
            memberToMessage.send(`There was an issue executing command "${commandAttempted}"! Talk to Kevin.`);
          } else {
            memberToMessage.send(`Something went wrong! Talk to Kevin.`);
          }
        }
      }
    }
  },
};
