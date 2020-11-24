module.exports = {
    name: 'p',
    description: 'Play an audio file by name.',
    usage: 'p!imback',
    async execute({message, args, member, command_name, voice_channel}) {
        return new Promise(async(resolve,reject) => {
            // import the audio dict
            const kev_bot = require('../kev-bot');

            // Getting the user command
            var file_to_play = command_name || args[0];

            // Check that file is in the dictionary
            if (!(file_to_play in kev_bot.audio_dict)) {
                return reject({
                    userResponse: "Not a valid file name, ya dingus!",
                    err: 'not a valid file name.'
                });
            }

            // Get voice channel and verify voice channel is actually a voice channel
            var VC = voice_channel || message.member.voice.channel;
            if (!VC) {
                return reject({
                    userResponse: "You are not in a voice channel, ya dingus!",
                    err: 'not in a voice channel.'
                });
            }

            // Join channel, play mp3 from the dictionary, leave when completed.
            // VC.join()
            //     .then(connection => {
            //         const dispatcher = connection.play(kev_bot.audio_dict[file_to_play]);
            //         dispatcher.on("finish", end => {VC.leave()});
            //     })
            //     .catch(console.error);

            // Join channel, play mp3 from the dictionary, leave when completed.
            try {
                const connection = await VC.join()
                const dispatcher = connection.play(kev_bot.audio_dict[file_to_play]);
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