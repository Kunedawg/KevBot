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
            // Getting file to play and checking that it exists
            let audioToPlay = args?.[0];
            let channelNum = args?.[1];
            let time = args?.[2];
            if (channelNum === undefined) return reject({userMess: "Specify a voice channel, ya dingus!"});
            // Get voice channel number and time info and print in terminal. E.g. channel number: 1 \n time: 10:00pm
            /*var channel = message?.member?.voice?.channel;*/
            // let VCCurrent = message?.member?.voice?.channel;
            let VC = message?.member?.guild?.channels?.cache.filter(channel => channel.type === 'voice'); //.channel.type;
            // let VCSort = VC.sort(channel => channel.type === 'rawPosition');
            let VCSort = VC.sort(function(a,b){return a.rawPosition-b.rawPosition});
            let VCId = Array.from(VCSort.keys());
            // if (channelNum['status'] === undefined || channelNum['status'] === null) return reject({userMess: "That is not a voice channel, ya dingus!"})
            let i = channelNum-1;
            let VCSelect = VCSort.get(VCId[i]);
            if (VCSelect === undefined) return reject({userMess: "That is not a voice channel, ya dingus!"});
            // if (i<0 || i>VCId.length || i['status'] === undefined) return reject({userMess: "That is not a voice channel, ya dingus!"});
            // let VCIds = VC.map(channel => channel.id);
            // var ch_test = VC;
            let t_test = '10:00pm';
            // console.log('channel number: ', channelNum, '\ntime: ', time);
            // console.log('current channel: \n', VCCurrent, '\nselected channel: \n', VCSelect);
            // console.log('channels: \n', VCSort, '\ntime: ', time);
            // console.log('channels: \n', VCId, '\ntime: ', time);
            // Calling the play command
            try {
                await gd.client.commands.get('p').execute({audio : audioToPlay, voiceChannel : VCSelect});
            } catch (err) {
                return reject(err);
            }
            
            // return resolve promise
            return resolve();
        });
    }
};