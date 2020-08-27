module.exports = {
    name: 'p',
    description: 'play an audio file by name',
    args: true,
    execute(message, args) {
        // import the audio dict
        const kev_bot = require('../kev-bot');

        // Getting the user command
        var file_to_play = args[0];
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
};