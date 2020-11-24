const { Message } = require('discord.js');

module.exports = {
    name: 'pr',
    description: 'Play a random file from the given category.',
    usage: 'pr!all',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        // import the audio dict
        const kev_bot = require('../kev-bot');

        // Getting category from args
        var category = args[0];

        if (category in kev_bot.category_dict) {
            // Determining random file to play
            var category_commands = kev_bot.category_dict[category];
            var index_to_play = Math.floor(Math.random() * category_commands.length);     // returns a random integer from 0 to amount of commands
            var command_to_play = category_commands[index_to_play];

            // Playing random file
            if (kev_bot.audio_dict.hasOwnProperty(command_to_play)) {
                // Getting the voice channel that the member was in when the message was went
                var VC = message.member.voice.channel;

                // Verify voice channel is actually a voice channel
                if (!VC) return message.reply("YOU ARE NOT IN A VOICE CHANNEL");

                // Join channel, play mp3 from the dictionary, leave when completed.
                VC.join()
                .then(connection => {
                    const dispatcher = connection.play(kev_bot.audio_dict[command_to_play]);
                    dispatcher.on("finish", end => {VC.leave()});
                })
                .catch(console.error);
            }
        }
    }
};