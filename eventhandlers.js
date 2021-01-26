// imports
const gd = require('./globaldata.js');
const Discord = require('discord.js');
const hf = require('./helperfcns');

// Ready event handler
/**
 * @param {string} loginMessage
 */
async function onReady(loginMessage){
    console.log(loginMessage);
}

// Voice Status update handler
/**
 * @param {Discord.VoiceState} oldUserVoiceState
 * @param {Discord.VoiceState} newUserVoiceState
 */
async function onVoiceStateUpdate(oldUserVoiceState, newUserVoiceState){
    try {
        if (gd.env === 'test') { return; } // do not run a command if the test environment is being used
        var newUserChannel = newUserVoiceState.channel;
        var oldUserChannel = oldUserVoiceState.channel;
        var newMember = newUserVoiceState.member;
        var oldMember = oldUserVoiceState.member;
        if(oldUserChannel === null && newUserChannel !== null && !newMember.user.bot) { // User Joins a voice channel
            var response = await gd.client.commands.get('getgreeting').execute({user : newMember.user});
            if (!response.greeting) {return;}
            await gd.client.commands.get('p').execute({commandName : response.greeting, voiceChannel : newUserChannel});
        } else if(newUserChannel === null && oldUserChannel !== null && !oldMember.user.bot){ // User leaves a voice channel
        }
    } catch (err) {
        // Console logging
        console.error(err);
        // User response
        if (err.userMess) {
            newMember.user.send(err.userMess);
        } else {
            newMember.user.send(`Something went wrong! Talk to Kevin.`);
        }
    }
}

// Message handler
/**
 * @param {Discord.Message} message
 * @param {string} prefix
 */    
async function onMessage(message, prefix){
    try {
        // Return if the message does not start with the prefix or if the message was from a bot
        if (!message.content.startsWith(prefix) || message.author.bot) {return;}

        // Get args and command name. Format of every command should follow "prefixcommand!arg1 arg2 arg3 arg4"
        const messageSplit = message.content.toLowerCase().slice(prefix.length).trim().split('!'); // ["command", "arg1 arg2 arg3 arg4"]
        var commandName = messageSplit[0]; // "command"
        var args = messageSplit[1] ? messageSplit[1].split(/ +/) : undefined; // array of the args ["arg1", "arg2", "arg3", "arg4"]  

        // Execute command if it exists
        if (gd.client.commands.has(commandName)) {
            let response = await gd.client.commands.get(commandName).execute({message : message, args : args});
            if (response?.userMess) {
                for (res of hf.breakUpResponse(response.userMess, '!@#', response.wrapChar || '')) {
                    await message.author.send(res);
                }
            }
        }
    } catch (err) {
        // Console logging
        let discordId = message?.author?.id;
        let commandAttempted = message;
        if (!discordId) { discordId = "undefined";}
        if (!commandAttempted) { commandAttempted = "undefined";}
        console.error(`DiscordID: "${discordId}". Command: "${commandAttempted}". Failed with err: `, err);

        // User response
        if (err.userMess) {
            message.author.send(err.userMess);
        } else {
            if (commandName) {
                message.author.send(`There was an issue executing command "${commandName}"! Talk to Kevin.`);
            } else {
                message.author.send(`Something went wrong! Talk to Kevin.`);
            }
        }
    }
}


module.exports = {
    onReady,
    onVoiceStateUpdate,
    onMessage
}
    