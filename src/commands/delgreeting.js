// imports
var gd = require('../globaldata.js');
const { Message } = require('discord.js');
const hf = require('../helperfcns.js');

module.exports = {
    name: 'delgreeting',
    description: 'Deletes and removes your greeting.',
    usage: 'delgreeting!',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     */
    execute({message}) {
        return new Promise(async(resolve,reject) => {
            // Validate inputs 
            let discordId = message?.author?.id;
            if(!discordId) {return reject({userMess: `Failed to retrieve discord id!`});}
            
            // Call get_greeting stored procedure
            try {
                let queryStr = `CALL del_greeting('${discordId}', @message); SELECT @message;`;
                let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
                let rtnMess = results[1][0]['@message'];
                if (rtnMess === 'Success') {
                    return resolve({userMess: `Your greeting has been deleted!`});
                } else {
                    return reject({
                        userMess: "Failed to delete greeting. Try again later or talk to Kevin.",
                        err: rtnMess
                    });
                }              
            } catch (err) {
                return reject({
                    userMess: "Failed to delete greeting. Try again later or talk to Kevin.",
                    err: err
                });
            }
        });
    }
};