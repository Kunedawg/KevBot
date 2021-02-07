// imports
var gd = require('../globaldata.js');
const {Message, VoiceChannel} = require('discord.js');
const {logAudioPlaySQL} = require('../functions/logAudioPlaySQL.js')

module.exports = {
    name: 'p',
    description: 'Play an audio file by name.',
    usage: 'p!imback',
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
    execute({message, args, audio, voiceChannel, discordId, playType}) {
        return new Promise(async(resolve,reject) => {
            // Get discord id. If the discordId is undefined then set it to zero
            let _discordId = discordId || message?.author?.id;
            if (!_discordId) {_discordId = '0';}

            // Get playType Note playType = (0: p!, 1 : pr!, 2 : greeting!)
            let _playType = playType || 0;

            // Getting file to play and checking that it exists
            var _audio = audio || args?.[0];
            if (!(_audio in gd.audioDict)) return reject({userMess: `"${_audio}" does not exist, ya dingus!`});

            // Get voice channel and verify voice channel is actually a voice channel
            var VC = voiceChannel || message?.member?.voice?.channel;
            if (!VC) return reject({userMess: "You are not in a voice channel, ya dingus!"});
            
            // Join channel, play mp3 from the dictionary, leave when completed.
            const connection = await VC.join()
            const dispatcher = connection.play(gd.audioDict[_audio]);
            dispatcher.on("finish", end => {VC.leave()});

             // On every play log the play, use playType to log what type of play it was
            try {
                logAudioPlaySQL(_discordId, _audio, _playType);
            } catch (err) {
                return reject({
                    userMess: 'NO_MESSAGE',
                    err: err
                });
            }
            
            // return resolve promise
            return resolve();
        });
    }
};