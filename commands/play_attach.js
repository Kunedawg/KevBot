module.exports = {
    name: 'pmp3',
    description: 'Play the attached audio file.',
    usage: 'pmp3!',
    execute({message, args, member, command_name, voice_channel}) {
        // import the audio dict
        const kev_bot = require('../kev-bot');
        var ffmpeg = require('fluent-ffmpeg');
        var fs = require('fs');
        var request = require('request');
      


        // For normalizing audio
        // ffmpeg('./4d3d.mp3')
        //     .audioFilters('loudnorm=I=-16:LRA=11:TP=-1.5')
        //     .on('error', function(err) {
        //         console.log('An error occurred: ' + err.message);
        //     })
        //     .on('end', function() {
        //         console.log('Processing finished !');
        //     })
        //     .save('./4d3d_fluent.mp3');
        
        // Reading attachment
        // console.log(message.attachments);
        var iter = message.attachments.values();
        var mess_att = iter.next().value;
        var url = message.attachments.values().next().value.attachment;
        // console.log(url);

        request
            .get(url)
            .on('error', function(err) {
                // handle error
            })
            .pipe(fs.createWriteStream('./save_file.mp3'));

        // console.log("mp3 steam: ", mp3_stream);
        // console.log("type mp3 steam: ", typeof mp3_stream);
            //.pipe(fs.createWriteStream('save_file.mp3'));       // <-- Readstream here?
            //.pipe(fs.createWriteStream('save_file.mp3'));

        // Getting the user command
        // var file_to_play = command_name || args[0];

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
            // const dispatcher = connection.play(kev_bot.audio_dict[file_to_play]);
            var mp3Stream = fs.createReadStream('./save_file.mp3');
            const dispatcher = connection.play(mp3Stream);
            dispatcher.on("finish", end => {VC.leave()});
        })
        .catch(console.error);

    }
};