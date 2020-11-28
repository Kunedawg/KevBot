// imports
const gd = require('./globaldata.js');
const Discord = require('discord.js');

module.exports = {
    // Ready event handler
    /**
     * @param {string} loginMessage
     */
    async onReady(loginMessage){
        console.log(loginMessage);
    },
    // Voice Status update handler
    /**
     * @param {Discord.VoiceState} oldUserVoiceState
     * @param {Discord.VoiceState} newUserVoiceState
     */
    async onVoiceStateUpdate(oldUserVoiceState, newUserVoiceState){
        try {
            var newUserChannel = newUserVoiceState.channel;
            var oldUserChannel = oldUserVoiceState.channel;
            var newMember = newUserVoiceState.member;
            var oldMember = oldUserVoiceState.member;
            if(oldUserChannel === null && newUserChannel !== null && !newMember.user.bot) { // User Joins a voice channel
                var greeting = await gd.getClient().commands.get('getgreeting').execute({user : newMember.user});
                if (!greeting) {return;}
                await gd.getClient().commands.get('p').execute({commandName : greeting, voiceChannel : newUserChannel});
            } else if(newUserChannel === null && oldUserChannel !== null && !oldMember.user.bot){ // User leaves a voice channel
            }
        } catch (err) {
            // Console logging
            console.error(err);
            // User response
            if (err.userResponse) {
                newMember.user.send(err.userResponse);
            } else {
                newMember.user.send(`Something went wrong! Talk to Kevin.`);
            }
        }
    },
    // Message handler
    /**
     * @param {Discord.Message} message
     * @param {string} prefix
     */    
    async onMessage(message, prefix){
        try {
            // Return if the message does not start with the prefix or if the message was from a bot
            if (!message.content.startsWith(prefix) || message.author.bot) {return;}

            // Get args and command name. Format of every command should follow "prefixcommand!arg1 arg2 arg3 arg4"
            const messageSplit = message.content.toLowerCase().slice(prefix.length).trim().split('!'); // ["command", "arg1 arg2 arg3 arg4"]
            var commandName = messageSplit[0]; // "command"
            var args = messageSplit[1] ? messageSplit[1].split(/ +/) : undefined; // array of the args ["arg1", "arg2", "arg3", "arg4"]  

            // Execute command if it exists
            if (gd.getClient().commands.has(commandName)) {
                await gd.getClient().commands.get(commandName).execute({message : message, args : args});
            }
        } catch (err) {
            // Console logging
            if (commandName) {
                console.error(`command "${commandName}" has failed: `, err);
            } else {
                console.error(err);
            }
            // User response
            if (err.userResponse) {
                message.author.send(err.userResponse);
            } else {
                if (commandName) {
                    message.author.send(`There was an issue executing command "${commandName}"! Talk to Kevin.`);
                } else {
                    message.author.send(`Something went wrong! Talk to Kevin.`);
                }
            }
        }
    },
}