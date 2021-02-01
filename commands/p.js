// imports
var gd = require('../globaldata.js');
const { Message, VoiceChannel } = require('discord.js');

module.exports = {
    name: 'p',
    description: 'Play an audio file by name.',
    usage: 'p!imback',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     * @param {string} methodargs.audio
     * @param {VoiceChannel} methodargs.voiceChannel
     */
    execute({message, args, audio, voiceChannel}) {
        return new Promise(async(resolve,reject) => {
            // Getting file to play and checking that it exists
            var audioToPlay = audio || args?.[0];
            if (!(audioToPlay in gd.audioDict)) return reject({userMess: `"${audioToPlay}" does not exist, ya dingus!`});

            // Get voice channel and verify voice channel is actually a voice channel
            var VC = voiceChannel || message?.member?.voice?.channel;
            if (!VC) return reject({userMess: "You are not in a voice channel, ya dingus!"});

            // Join channel, play mp3 from the dictionary, leave when completed.
            const connection = await VC.join()
            const dispatcher = connection.play(gd.audioDict[audioToPlay]);
            dispatcher.on("finish", end => {VC.leave()});
            
            // return resolve promise
            return resolve();
        });
    }
};