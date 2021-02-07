// imports
const gd = require('../globaldata.js');
const { Message } = require('discord.js');
const hf = require('../helperfcns.js');

// For logging calls of pr!
function logCategoryPlaySQL (discordId, category) {
    return new Promise(async(resolve,reject) => {
        // Call stored procedure
        let queryStr = `CALL log_category_play('${discordId}', '${category}', @message); SELECT @message;`;
        let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
        let rtnMess = results[1][0]['@message'];
        if (rtnMess === 'Success') {
            return resolve('Logged audio successfully');
        } else {
            return reject("Failed to log audio");
        }
    });
}

module.exports = {
    logCategoryPlaySQL
};