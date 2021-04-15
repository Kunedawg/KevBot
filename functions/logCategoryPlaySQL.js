// imports
const gd = require('../globaldata.js');
const hf = require('../helperfcns.js');

// For logging category plays with pr!
/**
 * @param {string} discordId
 * @param {string} category
 */
function logCategoryPlaySQL (discordId, category) {
    return new Promise(async(resolve,reject) => {
        // Call stored procedure
        let queryStr = `CALL log_category_play('${discordId}', '${category}', @message); SELECT @message;`;
        let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
        let rtnMess = results[1][0]['@message'];
        if (rtnMess === 'Success') {
            return resolve('Logged audio successfully');
        } else {
            return reject(`Failed to log random play. SQL says: ${rtnMess}`);
        }
    });
}

module.exports = {
    logCategoryPlaySQL
};