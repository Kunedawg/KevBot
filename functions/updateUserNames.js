// imports
const gd = require('../globaldata.js');
const hf = require('../helperfcns.js');

// Updates the user names on SQL
function updateUserNames () {
    return new Promise(async(resolve,reject) => {
        try {
            // Retrieve all discord ids and user names from discord
            let userNameDict = {};
            for (let guild of gd.client.guilds.cache) {
                let members = await guild[1].members.fetch();
                for (member of members) {
                    let discordId = member[1].user.id
                    let userName = member[1].user.username;
                    userNameDict[discordId] = userName;
                }
            }

            // Retieve all the discord IDs and user names from SQL
            let queryStr = 'SELECT player_info.discord_id, player_info.discord_user_name FROM player_info;';
            let results = await hf.asyncQuery(gd.sqlconnection, queryStr);

            // Loop over SQL results and check if there are any name mismatches, update name if there is
            for (result of results) {
                let discordId = result["discord_id"];
                if (Object.keys(userNameDict).includes(discordId)) {
                    let userNameDiscord = userNameDict[discordId];
                    let userNameSQL = result["discord_user_name"]
                    if (userNameDiscord != userNameSQL) {
                        // Update discord user names if needed
                        console.log(`Update discord id "${discordId}" username from "${userNameSQL}" to "${userNameDiscord}"`);
                        let queryStr = `CALL update_discord_user_name('${discordId}', '${userNameDiscord}', @message); SELECT @message;`;
                        let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
                        let rtnMess = results[1][0]['@message'];
                        if (rtnMess !== 'Success') {return reject(`Failed to update discord username for discord ID "${discordId}"`);}
                    }
                }
            }

            return resolve();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    updateUserNames
};