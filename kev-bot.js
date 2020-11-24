// imports
const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
var mysql = require('mysql');

// Sql pool connection info
var sqlconnection = mysql.createPool({
    connectionLimit     : 10,
    host                : '***REMOVED***',
    user                : '***REMOVED***',
    password            : '***REMOVED***',
    database            : '***REMOVED***',
    multipleStatements  : true
});

// First command line argument determines the token/prefix to use
var token = '';
var prefix = '';
var login_message = '';
var environment = process.argv[2];
if (environment === 'deploy') {
    token = config.deploy_token;
    prefix = config.deploy_prefix;
    login_message = 'kev-bot is ready and logged in!';
} else if (environment === 'test'){
    token = config.test_token;
    prefix = config.test_prefix;
    login_message = 'kev-bot-test is ready and logged in!';
} else {
    console.log("Not a valid command line arg");
    process.exit(1);    // end program
}

// Creating dictionary for command to audio file path. yes -> ./audio/yes.mp3
var audio_dict = {};
var audio_file_names = fs.readdirSync(config.audio_path);   // generates array of file names
for(var file_name of audio_file_names){
    var command = file_name.split('.')[0];  // remove .mp3 from end of file
    audio_dict[command] = config.audio_path + file_name;
}

// Creating dictionary of dictionaries for the categories
// catergories.csv has format of audio_file,category1,category2,category3,...
var category_dict = {};
category_dict["all"] = Object.keys(audio_dict);     // adding all the files to category "all"
var category_data_str = fs.readFileSync(config.categories_path,'utf8');
var category_data_str = category_data_str.split(' ').join('');  // removes all spaces
if (environment === 'deploy') { // windows uses \r\n, linux uses \n, apple uses \r
    var category_data_rows = category_data_str.split("\n"); 
} else if (environment === 'test'){
    var category_data_rows = category_data_str.split("\r\n"); 
}
for (const row of category_data_rows) {
    var categories = row.split(",");
    var audio_file = categories.shift();  // first item of row is the audio_file, the rest will be categories
    for (const category of categories) {
        if (category in category_dict) {
            category_dict[category].push(audio_file);
        } else {
            category_dict[category] = [audio_file];
        }
    }
}

// Creating client and reading in command functions from the command folder
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Ready Event
var ready = false;
client.once('ready', () => {
    console.log(login_message);
    ready = true;
});

// User joins or exits the channel event
client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.channel;
    let oldUserChannel = oldMember.channel;
    if(oldUserChannel === null && newUserChannel !== null && !newMember.member.user.bot) { // User Joins a voice channel
        const get_greeting_command = client.commands.get('getgreeting').execute; 
        get_greeting_command({member : newMember.member})
            .then((greeting) => {
                const play_command = client.commands.get('p').execute; 
                play_command({member : newMember.member, command_name : greeting, voice_channel : newUserChannel});
            });

    } else if(newUserChannel === null && !newMember.member.user.bot){ // User leaves a voice channel
    }
})

// User sends text message in channel event
client.on('message', message => {
    // Return if the message does not start with the prefix or if the message was from a bot
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Get args and commands name. Format of every command should follow "prefixcommand!arg1 arg2 arg3 arg4"
    const prefix_removed = message.content.toLowerCase().slice(prefix.length).trim().split('!'); // ["command", "arg1 arg2 arg3 arg4"]
    const commandName = prefix_removed[0]; // "command"
    if (typeof prefix_removed[1] === 'undefined') {
        return;
    } else {
        var args = prefix_removed[1].split(/ +/); // array of the args ["arg1", "arg2", "arg3", "arg4"]  
    }

    // Retreive command if it exists
    if (!client.commands.has(commandName)) return;
    const command = client.commands.get(commandName);  

    // Execute command
    (async function () {
        try {
            await command.execute({message : message, args : args});
        } catch (err) {
            console.error(`command "${commandName}" has failed: `, err);
            if (typeof err.userResponse === 'undefined') {
                message.author.send('There was an issue executing that command!');
            } else {
                message.author.send(err.userResponse);
            }
        }
    })();
});

// Export important data for commands
module.exports = {audio_dict, client, category_dict, sqlconnection};

// Login
client.login(token);