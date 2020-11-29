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
                var categoryCommands = Object.keys(gd.audioDict);
            } else if (category in gd.categoryDict) {
                var categoryCommands = gd.categoryDict[category];
            } else {
                return reject({userMess: `"${category}" is not a valid category, ya dingus!`});
            }

            const indexToPlay = Math.floor(Math.random() * categoryCommands.length);     // returns a random integer from 0 to amount of commands
            await gd.client.commands.get('p').execute({
                commandName  : categoryCommands[indexToPlay], 
                voiceChannel : message?.member?.voice?.channel
            });

            // return promise, no user message is needed
            return resolve();
        });
    }
};