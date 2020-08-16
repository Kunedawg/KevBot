const Discord = require('discord.js');
const { prefix, token, audio_path, cmd_audio_dict } = require('./config.json');

const client = new Discord.Client();

client.once('ready', () => {
	console.log('kev-bot is ready and logged in!');
});

client.on('message', message => {
    for(var key in cmd_audio_dict){
        // Getting the user command and checking if it matches to dict
        var user_command = message.content.toLowerCase();
        dict_command = prefix + key;
        if (user_command === dict_command) {
            // Getting the voice channel that the member was in when the message was went
            var VC = message.member.voice.channel;
            // Verify voice channel is actually a voice channel
            if (!VC)
               return message.reply("MESSAGE IF NOT IN A VOICE CHANNEL")
            // retrieve audio path from the dictionary
            var audio_full_path = audio_path + cmd_audio_dict[key];  
            // Join channel, play mp3 from the dictionary, leave when completed.
            VC.join()
            .then(connection => {
                const dispatcher = connection.play(audio_full_path);
                dispatcher.on("finish", end => {VC.leave()});
            })
            .catch(console.error);   
        }
    }
});

client.login(token);