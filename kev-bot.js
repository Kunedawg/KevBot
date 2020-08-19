// imports
const Discord = require('discord.js');
const { deploy_prefix, test_prefix, deploy_token, test_token, audio_path } = require('./config.json');
const fs = require('fs');

// First command line argument determines the token/prefix to use
var token = '';
var prefix = '';
var login_message = '';
if (process.argv[2] === 'deploy') {
    token = deploy_token;
    prefix = deploy_prefix;
    login_message = 'kev-bot is ready and logged in!';
} else if (process.argv[2] === 'test'){
    token = test_token;
    prefix = test_prefix;
    login_message = 'kev-bot-test is ready and logged in!';
} else {
    console.log("Not a valid command line arg");
    process.exit(1);    // end program
}

// Creating dictionary for audio file paths
var audio_dict = {};
var audio_folders = fs.readdirSync(audio_path);
var command = '';
for(var folder in audio_folders){
    command = audio_folders[folder].split('.')[0];
    audio_dict[command] = audio_path + audio_folders[folder];
}

// Creating client
const client = new Discord.Client();

// On log in
var ready = false;
client.once('ready', () => {
    console.log(login_message);
    ready = true;
});

// On a text message in a text channel
client.on('message', message => {
    if (ready) {
        // Getting the user command
        var user_command = message.content.toLowerCase();
        for(var key in audio_dict){
            // Generating dictionary command with prefix and key  
            dict_command = prefix + key;
            if (user_command === dict_command) {
                // Getting the voice channel that the member was in when the message was went
                var VC = message.member.voice.channel;
                // Verify voice channel is actually a voice channel
                if (!VC)
                return message.reply("YOU ARE NOT IN A VOICE CHANNEL")
                // Retrieve audio path from the dictionary
                var audio_full_path = audio_dict[key]; 
                // Join channel, play mp3 from the dictionary, leave when completed.
                VC.join()
                .then(connection => {
                    const dispatcher = connection.play(audio_full_path);
                    dispatcher.on("finish", end => {VC.leave()});
                })
                .catch(console.error);
            }
        }
    }
});

// Login
client.login(token);