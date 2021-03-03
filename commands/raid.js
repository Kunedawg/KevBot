// imports
var gd = require('../globaldata.js');
const { Message, VoiceChannel } = require('discord.js');

module.exports = {
    name: 'raid',
    description: 'Play audio in a voice channel (numbered top-down starting at 1)',
    usage: 'raid!file_name VoiceChannel#      e.g. raid!imback 3',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async(resolve,reject) => {

            // Parsing arguments
            let audioToPlay = args?.[0];
            let channelNum = args?.[1];
            let time = args?.[2];

            // Read-in collection of voice channels, check if user sent message in a text channel
            let voiceChannels = message?.member?.guild?.channels?.cache?.filter(channel => channel.type === 'voice');
            if (!voiceChannels) return reject({userMess: 'You need to send this message in a text channel, ya dingus'}); 

            // Sort voice channels from top to bottom and save array of channel IDs
            let voiceChannelsSorted = voiceChannels.sort((a,b) => {a.rawPosition-b.rawPosition});
            let voiceChannelsIdArray = Array.from(voiceChannelsSorted.keys());
            
            // Get voice channel based on channel #, and check if it exists
            let voiceChannelSelected = voiceChannelsSorted.get(voiceChannelsIdArray[channelNum-1]);
            if (!voiceChannelSelected) return reject({userMess: `Specify a voice channel number between 1 and ${length(voiceChannelsIdArray)}, ya dingus!`});
            
            // Calling the play command
            try {
                await gd.client.commands.get('p').execute({audio : audioToPlay, voiceChannel : voiceChannelSelected, discordId : message?.author?.id, playType : 3});
            } catch (err) {
                return reject(err);
            }
            
            // return resolve promise
            return resolve();
        });
    }
};