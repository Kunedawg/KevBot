var gd = require("../globaldata.js");
const { Message, VoiceChannel } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const { logAudioPlaySQL } = require("../functions/logAudioPlaySQL.js");

module.exports = {
  name: "p",
  description: "Play an audio file by name.",
  usage: "p!imback",
  //Note that there are two ways to call execute of p
  // p(message,args) or p(audio, voiceChannel, discordId)
  /**
   * @param {Object} methodargs
   * @param {Message} methodargs.message
   * @param {Array.<string>} methodargs.args
   * @param {string} methodargs.audio
   * @param {VoiceChannel} methodargs.voiceChannel
   * @param {string} methodargs.discordId
   * @param {number} methodargs.playType
   */
  execute({ message, args, audio, voiceChannel, discordId, playType }) {
    return new Promise(async (resolve, reject) => {
      // Get discord id
      let _discordId = discordId || message?.author?.id;

      // Get playType Note playType = (0: p!, 1 : pr!, 2 : greeting!, 3 : raid!, 4 : farewell!)
      let _playType = playType || gd.PLAY_TYPE.PLAY;

      // Getting file to play and checking that it exists
      var _audio = audio || args?.[0];
      if (!(_audio in gd.audioDict)) return reject({ userMess: `"${_audio}" does not exist, ya dingus!` });

      // Get voice channel and verify voice channel is actually a voice channel
      var _voiceChannel = voiceChannel || message?.member?.voice?.channel;
      if (!_voiceChannel) return reject({ userMess: "You are not in a voice channel, ya dingus!" });

      // Join channel, play mp3 from the dictionary, leave when completed.
      const player = createAudioPlayer();
      const resource = createAudioResource(gd.audioDict[_audio]);
      const connection = joinVoiceChannel({
        channelId: _voiceChannel.id,
        guildId: _voiceChannel.guild.id,
        adapterCreator: _voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
      });
      connection.subscribe(player);
      player.play(resource);
      player.on(AudioPlayerStatus.Idle, () => {
        connection.disconnect();
      });

      // On every play update the recently played list
      gd.recentlyPlayedList.pop();
      gd.recentlyPlayedList.unshift({
        audio: _audio,
        datetime: new Date(Date.now()),
      });

      // On every play log the play, use playType to log what type of play it was
      try {
        await logAudioPlaySQL(_discordId, _audio, _playType);
      } catch (err) {
        return reject({
          userMess: "SUPPRESS_GENERAL_ERR_MESSAGE",
          err: err,
        });
      }

      // return resolve promise
      return resolve();
    });
  },
};
