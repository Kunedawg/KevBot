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

// Creating client and reading in command functions from the command folder
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// On log in
var ready = false;
client.once('ready', () => {
    console.log(login_message);
    ready = true;
});

// Command Handler
client.on('message', message => {
    // Make sure message starts with prefix
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Get args and commands name. Format of every command should follow "[prefix][command]!arg1 arg2 arg3 arg4"
    const prefix_removed = message.content.slice(prefix.length).trim().split('!'); // ["command", "arg1 arg2 arg3 arg4"]
    const commandName = prefix_removed[0]; // "command"
    var args;
    if (typeof prefix_removed[1] === 'undefined') {
        return;
    } else {
        args = prefix_removed[1].split(/ +/); // array of the args ["arg1", "arg2", "arg3", "arg4"]  
    }

    // Check that command exists
    if (!client.commands.has(commandName)) return;
    const command = client.commands.get(commandName);

    // Execute command
    try {
        command.execute(message, args);
        // if (message.deletable) message.delete({timeout: 100}); This works, just don't like it anymore.
    } catch (error) {
        console.error(error);
        message.reply('There was an issue executing that command!')
    }
});

// Export the audio_dict for other modules to use
module.exports = {audio_dict, client};

// Login
client.login(token);