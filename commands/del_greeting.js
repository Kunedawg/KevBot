// import data from kev-bot.js
var gd = require('../globaldata.js');
const { Message } = require('discord.js');

module.exports = {
    name: 'delgreeting',
    description: 'Deletes and removes your greeting.',
    usage: 'delgreeting!',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async(resolve,reject) => {
            // Get discord id
            let discordId = message?.author?.id;
            if(!discordId) { return reject({ userResponse: `Failed to retrieve discord id!`}); }
            
            // Call get_greeting stored procedure
            let queryStr = `CALL del_greeting('${discordId}', @message); SELECT @message;`;
            gd.sqlconnection.query(queryStr, (err, results) => {
                if (err) {
                    return reject({
                        userResponse: "Failed to delete greeting. Try again later or talk to Kevin.",
                        err: err
                    });
                } else {
                    let ret_message = results[1][0]['@message'];
                    if (ret_message === 'Success') {
                        message.author.send(`Your greeting has been deleted!`);
                        return resolve("Delete greeting succeeded.");
                    } else {
                        return reject({
                            userResponse: "Failed to delete greeting. Try again later or talk to Kevin.",
                            err: ret_message
                        });
                    }
                }
            });
        });
    }
};