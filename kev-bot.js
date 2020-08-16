const Discord = require('discord.js');
const { prefix, token, audio_path, cmd_audio_dict } = require('./config.json');

const client = new Discord.Client();

client.once('ready', () => {
	console.log('kev-bot is ready and logged in!');
});

client.on('message', message => {
    // Getting the user command
    var user_command = message.content.toLowerCase();
    for(var key in cmd_audio_dict){
        // Generating dictionary command with prefix and key  
        dict_command = prefix + key;
        if (user_command === dict_command) {
            // Getting the voice channel that the member was in when the message was went
            var VC = message.member.voice.channel;
            // Verify voice channel is actually a voice channel
            if (!VC)
               return message.reply("YOU ARE NOT IN A VOICE CHANNEL")
            // Retrieve audio path from the dictionary
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