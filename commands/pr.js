// imports
var gd = require('../globaldata.js');
const { Message } = require('discord.js');
const {logCategoryPlaySQL} = require('../functions/logCategoryPlaySQL.js')
const hf = require('../helperfcns.js');

module.exports = {
    name: 'pr',
    description: 'Play a random file from the given category.',
    usage: 'pr!, pr!all, pr!arnold',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async(resolve,reject) => {
            try {
                // Get discord id. If the discordId is undefined then set it to zero
                var _discordId = message?.author?.id;
                if (!_discordId) {_discordId = '0';}            
                
                // Get the category from the args
                var category = args?.[0];
                
                // Ignore attempts to play certain protected categories
                if (["categories", "cats", "allcats", "emptycats"].includes(category)) {return reject({userMess: `"${category}" is not a valid category, ya dingus!`});}

                // Get the audioList and do some extra processes if it is the mostPlayed category
                let audioList = await hf.getList(category, _discordId);
                if (category === "mostplayed") {
                    const mostPlayedListLength = args?.[1] || gd.MOST_PLAYED_DEFAULT_LENGTH;
                    if (audioList.length > mostPlayedListLength) {audioList.length = mostPlayedListLength;}
                    audioList = audioList.map(obj => obj.audio);
                }

                // Play a random file that category
                const indexToPlay = Math.floor(Math.random()*audioList.length);     // returns a random integer from 0 to amount of commands
                await gd.client.commands.get('p').execute({
                    audio : audioList[indexToPlay], 
                    voiceChannel : message?.member?.voice?.channel,
                    discordId : _discordId,
                    playType : 1
                });
            } catch (err) {
                return reject(err);
            }

            // On every random play log it
            try {
                await logCategoryPlaySQL(_discordId, category);
            } catch (err) {
                return reject({
                    userMess: 'NO_MESSAGE',
                    err: err
                });
            }

            // return promise, no user message is needed
            return resolve();
        });
    }
};