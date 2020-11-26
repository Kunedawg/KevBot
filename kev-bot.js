// imports
const config = require('./config.json');
const gd = require('./globaldata.js');
const init = require('./init.js');

// First command line argument determines the token/prefix to use
gd.setEnv(process.argv[2]);
if (gd.getEnv() === 'deploy') {
    var token = config.deployToken;
    var prefix = config.deployPrefix;
    var login_message = 'kev-bot is ready and logged in!';
} else if (gd.getEnv() === 'test'){
    var token = config.testToken;
    var prefix = config.testPrefix;
    var login_message = 'kev-bot-test is ready and logged in!';
} else {
    console.log("Not a valid command line arg");
    process.exit(1);    // end program
}

// Initialization
if (gd.getEnv() === 'deploy') var downloadAudio = true;
if (gd.getEnv() === 'test') var downloadAudio = false;
async function initialize() {
    console.log(await init.Audio(downloadAudio));;
    init.Categories();
    init.Commands();
    gd.getClient().login(token);
}
try {
    initialize();
} catch(err) {
    console.log(err);
}

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