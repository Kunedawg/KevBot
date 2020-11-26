// imports
const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
var gd = require('./globaldata.js');

// First command line argument determines the token/prefix to use
var env = process.argv[2];
if (env === 'deploy') {
    var token = config.deployToken;
    var prefix = config.deployPrefix;
    var login_message = 'kev-bot is ready and logged in!';
} else if (env === 'test'){
    var token = config.testToken;
    var prefix = config.testPrefix;
    var login_message = 'kev-bot-test is ready and logged in!';
} else {
    console.log("Not a valid command line arg");
    process.exit(1);    // end program
}

// Creating dictionary for command to audio file path. yes -> ./audio/yes.mp3
for(var file_name of fs.readdirSync(gd.audioPath)){
    var command = file_name.split('.')[0];  // remove .mp3 from end of file
    gd.pushAudioDict(command,(gd.audioPath + file_name));
}

// Creating dictionary of arrays for the categories
// catergories.csv has format of audio_file,category1,category2,category3,...
gd.pushCategoryDict("all", Object.keys(gd.getAudioDict()));
var catData = fs.readFileSync(gd.categoriesCsvPath,'utf8').split(' ').join(''); // read categories string and remove spaces.
if (env === 'deploy')  // windows uses \r\n, linux uses \n, apple uses \r
    var catRows = catData.split("\n"); 
if (env === 'test')
    var catRows = catData.split("\r\n"); 
for (const row of catRows) {
    var categories = row.split(",");
    var audioFile = categories.shift();  // first item of row is the audioFile, the rest will be categories
    for (const category of categories) {
        let catergoryDict = gd.getCategoryDict();
        if (category in catergoryDict) {
            catergoryDict[category].push(audioFile);
            gd.setCategoryDict(catergoryDict);
        } else {
            gd.pushCategoryDict(category, [audioFile]);
        }
    }
}

// Storing the commands in a collection
var tempClient = gd.getClient();
tempClient.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    tempClient.commands.set(command.name, command);
}
gd.setClient(tempClient);

// Ready Event
gd.getClient().once('ready', () => console.log(login_message));

// User joins or exits the channel event
gd.getClient().on('voiceStateUpdate', (oldUserVoiceState, newUserVoiceState) => {
    async function onVoiceStateUpdate(){
        let newUserChannel = newUserVoiceState.channel;
        let oldUserChannel = oldUserVoiceState.channel;
        let newMember = newUserVoiceState.member;
        let oldMember = oldUserVoiceState.member;
        if(oldUserChannel === null && newUserChannel !== null && !newMember.user.bot) { // User Joins a voice channel
            var greeting = await gd.getClient().commands.get('getgreeting').execute({user : newMember.user});
            gd.getClient().commands.get('p').execute({command_name : greeting, voice_channel : newUserChannel});
        } else if(newUserChannel === null && oldUserChannel !== null && !oldMember.user.bot){ // User leaves a voice channel
        }
    }
    onVoiceStateUpdate();
})

// User sends text message in channel event
gd.getClient().on('message', message => {
    async function onMessage(){
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
        if (!gd.getClient().commands.has(commandName)) return;
        const command = gd.getClient().commands.get(commandName);  

        // Execute command
        try {
            await command.execute({message : message, args : args});
        } catch (err) {
            console.error(`command "${commandName}" has failed: `, err);
            if (typeof err.userResponse === 'undefined') {
                message.author.send(`There was an issue executing command "${commandName}"! Talk to Kevin.`);
            } else {
                message.author.send(err.userResponse);
            }
        }
    }
    onMessage();
});

// Login
gd.getClient().login(token);