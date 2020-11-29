// import data from kev-bot.js
var gd = require('../globaldata.js');
const { Message, User } = require('discord.js');

module.exports = {
    name: 'getgreeting',
    description: 'Returns the current greeting you have set.',
    usage: 'getgreeting!',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {User} methodargs.user
     */
    execute({message, user}) {
        return new Promise(async(resolve,reject) => {
            // Validate inputs. There are two ways to call this fcn: 
            // Either by providing a discord message or discord user, and then the discord id can be obtained.
            var discordId = user?.id || message?.author?.id;
            if(!discordId) { return reject({ userMess: `Failed to retrieve discord id!`}); }

            // Call get_greeting stored procedure
            let queryStr = `CALL get_greeting('${discordId}', @greeting); SELECT @greeting;`;
            gd.sqlconnection.query(queryStr, (err, results) => {
                if (err) {
                    return reject({userMess: "Failed to retrieve greeting. Try again later or talk to Kevin.", err: err});
                } else {
                    let greeting = results[1][0]['@greeting'];
                    if (greeting !== null) {
                        var response = `Your current greeting is set to "${greeting}"!`;
                        if (!(greeting in gd.audioDict)) {
                            response += `\n"${greeting}" is not a valid command. Consider changing it.`;
                        }
                    } else {
                        var response = "You do not have a greeting configured.";
                    }
                    return resolve({greeting : greeting, userMess : response});
                }
            });
        });
    }
};