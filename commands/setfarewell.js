// imports
var gd = require('../globaldata.js');
const {Message} = require('discord.js');
const hf = require('../helperfcns.js');

module.exports = {
    name: 'setfarewell',
    description: 'Used for updating or setting your farewell. Use delfarewell to remove farewell entirely.',
    usage: 'setfarewell!farewell',
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

            // Get farewell from args and check that it is valid
            var farewell = args?.[0];
            if(!(farewell in gd.audioDict)) {
                return reject({ userMess: `"${farewell}" is not a valid farewell name. Check your spelling.`});
            }
            
            // Call set_farewell stored procedure
            try {
                let queryStr = `CALL set_farewell('${discordId}','${farewell}', @message); SELECT @message;`;
                let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
                let rtnMess = results[1][0]['@message'];
                if (rtnMess === 'Success') {
                    return resolve({userMess: `Your farewell has been set to "${farewell}"!`});
                } else {
                    return reject({
                        userMess: "Failed to set farewell. Try again later or talk to Kevin.",
                        err: rtnMess
                    });
                }
            } catch (err) {
                return reject({
                    userMess: "Failed to set farewell. Try again later or talk to Kevin.",
                    err: err
                });
            }
        });
    }
};