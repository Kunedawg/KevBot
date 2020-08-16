const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

const client = new Discord.Client();

var audio_path = "./audio/"
var cmd_audio_dict = {
    "imback"        : "trex.mp3",
    "bonanno"       : "bonanno.mp3"
};

client.once('ready', () => {
	console.log('kev-bot is ready and logged in!');
});

client.on('message', message => {
    for(var key in cmd_audio_dict){
        var user_command = message.content.toLowerCase();
        console.log(user_command);
        dict_command = prefix + key;
        console.log(dict_command);
        if (user_command === dict_command) {
            var VC = message.member.voice.channel;
            if (!VC)
               return message.reply("MESSAGE IF NOT IN A VOICE CHANNEL")
            VC.join()
            .then(connection => {
                var full_path = audio_path + cmd_audio_dict[key];
                console.log(full_path);
                const dispatcher = connection.play(full_path);
                dispatcher.on("finish", end => {VC.leave()});
            })
            .catch(console.error);   
        }
    }

	// if (message.content === 'k!BoNanNo') {
    //     var VC = message.member.voice.channel;
    //     if (!VC)
    //        return message.reply("MESSAGE IF NOT IN A VOICE CHANNEL")
    //     VC.join()
    //     .then(connection => {
    //         const dispatcher = connection.play('./audio/bonanno.mp3');
    //         dispatcher.on("finish", end => {VC.leave()});
    //     })
    //     .catch(console.error);
    // } else if (message.content === 'k!imback') {
    //     var VC = message.member.voice.channel;
    //     if (!VC)
    //        return message.reply("MESSAGE IF NOT IN A VOICE CHANNEL")
    //     VC.join()
    //     .then(connection => {
    //         const dispatcher = connection.play('./audio/trex.mp3');
    //         dispatcher.on("finish", end => {VC.leave()});
    //     })
    //     .catch(console.error);
    // }
});

client.login(token);

// function playAudio() {

// }
