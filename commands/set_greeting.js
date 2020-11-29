// import data from kev-bot.js
var gd = require('../globaldata.js');
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
            // Get discord id and check that it is valid
            let discordId = message?.author?.id;
            if(!discordId) { return reject({ userMess: `Failed to retrieve discord id!`}); }

            // Get greeting from args and check that it is valid
            var greeting = args?.[0];
            if(!(greeting in gd.getAudioDict())) {
                return reject({ userMess: `"${greeting}" is not a valid greeting name. Check your spelling.`});
            }
            
            // Call get_greeting stored procedure
            let queryStr = `CALL set_greeting('${discordId}','${greeting}', @message); SELECT @message;`;
            gd.sqlconnection.query(queryStr, (err, results) => {
                if (err) {
                    return reject({
                        userMess: "Failed to set greeting. Try again later or talk to Kevin.",
                        err: err
                    });
                } else {
                    let rtnMess = results[1][0]['@message'];
                    if (rtnMess === 'Success') {
                        return resolve({userMess: `Your greeting has been set to "${greeting}"!`});
                    } else {
                        return reject({
                            userMess: "Failed to set greeting. Try again later or talk to Kevin.",
                            err: rtnMess
                        });
                    }
                }
            });
        });
    }
};