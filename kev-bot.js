// imports
const Discord = require('discord.js');
const { deploy_prefix, test_prefix, deploy_token, test_token, audio_path, categories_path } = require('./config.json');
const fs = require('fs');

// First command line argument determines the token/prefix to use
var token = '';
var prefix = '';
var login_message = '';
var environment = process.argv[2];
if (environment === 'deploy') {
    token = deploy_token;
    prefix = deploy_prefix;
    login_message = 'kev-bot is ready and logged in!';
} else if (environment === 'test'){
    token = test_token;
    prefix = test_prefix;
    login_message = 'kev-bot-test is ready and logged in!';
} else {
    console.log("Not a valid command line arg");
    process.exit(1);    // end program
}

// Creating dictionary for command to audio file path. yes -> ./audio/yes.mp3
var audio_dict = {};
var audio_file_names = fs.readdirSync(audio_path);   // generates array of file names
for(var file_name of audio_file_names){
    var command = file_name.split('.')[0];  // remove .mp3 from end of file
    audio_dict[command] = audio_path + file_name;
}

// Creating dictionary of dictionaries for the categories
// catergories.csv has format of audio_file,category1,category2,category3,...
var category_dict = {};
category_dict["all"] = Object.keys(audio_dict);     // adding all the files to category "all"
var category_data_str = fs.readFileSync(categories_path,'utf8');
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

// User joins channel event
const KEVIN_KUNEY_ID = '***REMOVED***';
const EVAN_FUMOSO_ID = '145361690328825857';
const CHRIS_WEBSTER_ID = '144335985373741056';
const ETHAN_MEDLER_ID = '189927294968659968';
const MATT_ARMSTRONG_ID ='153385888917749760';
const RICK_MICHAEL_ID ='144206566801801225';
client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.channel;
    let oldUserChannel = oldMember.channel
    if(oldUserChannel === null && newUserChannel !== null && !newMember.member.user.bot) { // User Joins a voice channel
        let file_to_play;
        switch (newMember.member.user.id) {
            case KEVIN_KUNEY_ID:
                file_to_play = "rockbody";
                break;
            case EVAN_FUMOSO_ID:
                file_to_play = "lordbust";
                break;
            case CHRIS_WEBSTER_ID:
                file_to_play = "waitjay";
                break;
            case ETHAN_MEDLER_ID:
                file_to_play = "triple";
                break;
            case MATT_ARMSTRONG_ID:
                file_to_play = "hankbust";
                break;
            case RICK_MICHAEL_ID:
                file_to_play = "yeet";
                break;         
            default:
                file_to_play = "DO_NOT_PLAY";
                return;
        }
        newUserChannel.join()
        .then(connection => {
            const dispatcher = connection.play(audio_dict[file_to_play]);
            dispatcher.on("finish", end => {newUserChannel.leave()});
        })
        .catch(console.error);
    } else if(newUserChannel === null && !newMember.member.user.bot){ 
        // User leaves a voice channel
    }
})

// User sends text message in channel event
client.on('message', message => {
    // Return if the message does not start with the prefix or if the message was from a bot
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Get args and commands name. Format of every command should follow "prefixcommand!arg1 arg2 arg3 arg4"
    const prefix_removed = message.content.slice(prefix.length).trim().split('!'); // ["command", "arg1 arg2 arg3 arg4"]
    const commandName = prefix_removed[0]; // "command"
    var args;
    if (typeof prefix_removed[1] === 'undefined') {
        return;
    } else {
        args = prefix_removed[1].split(/ +/); // array of the args ["arg1", "arg2", "arg3", "arg4"]  
    }

    // Retreive command if it exists
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
module.exports = {audio_dict, client, category_dict};

// Login
client.login(token);