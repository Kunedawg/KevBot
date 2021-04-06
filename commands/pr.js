// imports
var gd = require('../globaldata.js');
const { Message } = require('discord.js');
const {logCategoryPlaySQL} = require('../functions/logCategoryPlaySQL.js')

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
            // Get discord id. If the discordId is undefined then set it to zero
            let _discordId = message?.author?.id;
            if (!_discordId) {_discordId = '0';}            
            
            // Validate category and determine list of files to choose from
            var category = args?.[0];
            if (category === 'all' || category === undefined) {
                category = 'all';
                var audioList = Object.keys(gd.audioDict);
            } else if (category in gd.categoryDict) {
                var audioList = gd.categoryDict[category];
            } else if (gd.categoryList.includes(category)) {
                return reject({userMess: `"${category}" is an empty category, nothing to play!`});
            } else {
                return reject({userMess: `"${category}" is not a valid category, ya dingus!`});
            }
            
            // Play a random file that category
            try {
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