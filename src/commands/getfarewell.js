// imports
var gd = require('../globaldata.js');
const { Message, User } = require('discord.js');
const hf = require('../helperfcns.js');

module.exports = {
    name: 'getfarewell',
    description: 'Returns the current farewell you have set.',
    usage: 'getfarewell!',
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

            // Call get_farewell stored procedure
            try {
                let queryStr = `CALL get_farewell('${discordId}', @farewell); SELECT @farewell;`;
                let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
                let farewell = results[1][0]['@farewell'];
                if (farewell !== null) {
                    var response = `Your current farewell is set to "${farewell}"!`;
                    if (!(farewell in gd.audioDict)) {
                        response += `\n"${farewell}" is not a valid command. Consider changing it.`;
                    }
                } else {
                    var response = "You do not have a farewell configured.";
                }
                return resolve({farewell : farewell, userMess : response});
            } catch (err) {
                return reject({userMess: "Failed to retrieve farewell. Try again later or talk to Kevin.", err: err});
            }
        });
    }
};