const { Message } = require('discord.js');

module.exports = {
    name: 'setgreeting',
    description: 'Used for updating or setting your greeting. Use delgreeting to remove greeting entirely.',
    usage: 'setgreeting!greeting',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async(resolve,reject) => {
            // import data from kev-bot.js
            var gd = require('../globaldata.js');

            // Get discord id
            let discord_id = message.author.id;

            // Get greeting from args
            var greeting = args[0];

            // Check if greeting is in audio dict
            if(!(greeting in gd.getAudioDict())) {
                message.author.send(`"${greeting}" is not a valid command. Check your spelling.`);
                return resolve("Set greeting succeeded.");
            }
            
            // Call get_greeting stored procedure
            let queryStr = `CALL set_greeting('${discord_id}','${greeting}', @message); SELECT @message;`;
            gd.sqlconnection.query(queryStr, (err, results) => {
                if (err) {
                    return reject({
                        userResponse: "Failed to set greeting. Try again later or talk to Kevin.",
                        err: err
                    });
                } else {
                    let ret_message = results[1][0]['@message'];
                    if (ret_message === 'Success') {
                        message.author.send(`Your greeting has been set to "${greeting}"!`);
                        return resolve("Set greeting succeeded.");
                    } else {
                        return reject({
                            userResponse: "Failed to set greeting. Try again later or talk to Kevin.",
                            err: ret_message
                        });
                    }
                }
            });
        });
    }
};