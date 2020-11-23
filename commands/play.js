module.exports = {
    name: 'p',
    description: 'Play an audio file by name.',
    usage: 'p!imback',
    execute({message, args, member, command_name, voice_channel}) {
        // import the audio dict
        const kev_bot = require('../kev-bot');

        // Getting the user command
        var file_to_play = command_name || args[0];

        if (file_to_play in kev_bot.audio_dict) {
            // Getting the voice channel that the member was in when the message was went
            var VC = voice_channel || message.member.voice.channel;

            // Verify voice channel is actually a voice channel
            if (!VC) {
                var user = member || message.member;
                return user.send("YOU ARE NOT IN A VOICE CHANNEL");
            }

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