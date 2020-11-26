const { Message } = require('discord.js');

module.exports = {
    name: 'pr',
    description: 'Play a random file from the given category.',
    usage: 'pr!all',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async(resolve,reject) => {
            // import the audio dict

            var gd = require('../globaldata.js');

            // Getting category from args
            var category = args[0];

            try {
                if (category in gd.getCategoryDict()) {
                    // Determining random file to play
                    const categoryCommands = gd.getCategoryDict()[category];
                    const indexToPlay = Math.floor(Math.random() * categoryCommands.length);     // returns a random integer from 0 to amount of commands
                    const commandToPlay = categoryCommands[indexToPlay];
                    await gd.getClient().commands.get('p').execute({
                        commandName  : commandToPlay, 
                        voiceChannel : message?.member?.voice?.channel});
                } else {
                    return reject({userResponse: `"${category}" is not a valid category, ya dingus!`});
                }
            } catch (err) {
                return reject(err);
            }

            // Return resolve promise if everything went well
            return resolve("Random song played!")
        });
    }
};