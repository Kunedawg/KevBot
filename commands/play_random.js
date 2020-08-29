module.exports = {
    name: 'pr',
    description: 'Play a random file from the given category.',
    usage: 'pr!all',
    args: true,
    execute(message, args) {
        // import the audio dict
        const kev_bot = require('../kev-bot');

        // Getting category from args
        var category = args[0];

        if (category = 'all'){
            // Determining random file to play
            var file_names = Object.keys(kev_bot.audio_dict);
            var index_to_play = Math.floor(Math.random() * file_names.length);     // returns a random integer from 0 to amount of commands
            var file_to_play = file_names[index_to_play];

            // Playing random file
            if (kev_bot.audio_dict.hasOwnProperty(file_to_play)) {
                // Getting the voice channel that the member was in when the message was went
                var VC = message.member.voice.channel;

                // Verify voice channel is actually a voice channel
                if (!VC) return message.reply("YOU ARE NOT IN A VOICE CHANNEL");

                // Join channel, play mp3 from the dictionary, leave when completed.
                VC.join()
                .then(connection => {
                    const dispatcher = connection.play(kev_bot.audio_dict[file_to_play]);
                    dispatcher.on("finish", end => {VC.leave()});
                })
                .catch(console.error);
            }
        }
    }
};