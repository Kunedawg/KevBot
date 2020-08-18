// imports
const Discord = require('discord.js');
const { deploy_prefix, test_prefix, deploy_token, test_token, audio_path, cmd_audio_dict } = require('./config.json');

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

// Creating client
const client = new Discord.Client();

// On log in
client.once('ready', () => {
	console.log(login_message);
});

// On a text message in a text channel
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

// Login
client.login(token);