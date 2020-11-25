const { Message, VoiceChannel } = require('discord.js');

module.exports = {
    name: 'p',
    description: 'Play an audio file by name.',
    usage: 'p!imback',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     * @param {string} methodargs.commandName
     * @param {VoiceChannel} methodargs.voiceChannel
     */
    execute({message, args, commandName, voiceChannel}) {
        return new Promise(async(resolve,reject) => {
            // import the audio dict
            const kevbot = require('../kev-bot');

            // Getting the user command
            var fileToPlay = commandName || args[0];

            // Check that file is in the dictionary
            if (!(fileToPlay in kevbot.audio_dict)) return reject({userResponse: "Not a valid file name, ya dingus!"});

            // Get voice channel and verify voice channel is actually a voice channel
            var VC = voiceChannel || message?.member?.voice?.channel;
            if (!VC) return reject({userResponse: "You are not in a voice channel, ya dingus!"});

            // Join channel, play mp3 from the dictionary, leave when completed.
            try {
                const connection = await VC.join()
                const dispatcher = connection.play(kevbot.audio_dict[fileToPlay]);
                dispatcher.on("finish", end => {VC.leave()});
            } catch(err) {
                return reject({
                    userResponse: "The file failed to play. Try again or talk to Kevin.",
                    err: err
                });
            }
            
            // return resolve promise
            return resolve("File played!");
        });
    }
};