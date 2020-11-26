const { Message, User } = require('discord.js');

module.exports = {
    name: 'getgreeting',
    description: 'Returns the current greeting you have set.',
    usage: 'getgreeting!',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     * @param {User} methodargs.user
     */
    execute({message, args, user}) {
        return new Promise(async(resolve,reject) => {
            // import data from kev-bot.js
            var gd = require('../globaldata.js');

            // Use the discord id from the user if the user is defined
            var discord_id = user ? user.id : message.author.id;

            // Call get_greeting stored procedure
            let queryStr = `CALL get_greeting('${discord_id}', @greeting); SELECT @greeting;`;
            gd.sqlconnection.query(queryStr, (err, results) => {
                if (err) {
                    return reject({
                        userResponse: "Failed to retrieve greeting. Try again later or talk to Kevin.",
                        err: err
                    });
                } else {
                    let greeting = results[1][0]['@greeting'];
                    // If the mesage exists, then respond to the user, otherwise do not respond.
                    if (message) {
                        if (greeting !== null) {
                            message.author.send(`Your current greeting is set to "${greeting}"!`);
                            if (!(greeting in gd.getAudioDict())) message.author.send(`"${greeting}" is not a valid command. Consider changing it.`);
                        } else {
                            message.author.send("You do not have a greeting configured.");
                        }
                    }
                    return resolve(greeting);
                }
            });
        });
    }
};