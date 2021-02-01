// imports
var gd = require('../globaldata.js');
const { Message } = require('discord.js');

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
            // Validate category and determine list of files to choose from
            var category = args?.[0];
            if (category === 'all' || category === undefined) {
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
                    voiceChannel : message?.member?.voice?.channel
                });
            } catch (err) {
                return reject(err);
            }

            // return promise, no user message is needed
            return resolve();
        });
    }
};