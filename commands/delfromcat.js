// imports
const gd = require('../globaldata.js');
const { Message } = require('discord.js');
const hf = require('../helperfcns.js');

module.exports = {
    name: 'delfromcat',
    description: 'Deletes audio from the specified category.',
    usage: 'delfromcat!categoryName audioName1 audioName2 audioName3...',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async(resolve,reject) => {
            // Get discord id and check that it is valid
            let discordId = message?.author?.id;
            if (!discordId) { return reject({ userMess: `Failed to retrieve discord id!`}); }

            // Check that the args length is at least 2 (category and audio)
            if (args.length < 2) { return reject({userMess: `Please provide at least two arguments. Category name followed by as many audio names as you would like.`}); }          

            // Get category and audio array
            var category = args.shift();
            var audioArray = args;

            // Check that category name is in the categoryDict
            if (!Object.keys(gd.categoryDict).includes(category)) { return reject({ userMess: `The category "${category}" does not exist!`}); }       

            // Check that the user orginally created this category or is the master user
            try {
                if (Number(discordId) != Number(process.env.MASTER_DISCORD_ID)) {
                    let queryStr = `SELECT discord_id FROM categories INNER JOIN player_info ON player_info.player_id = categories.player_id WHERE category_name = '${category}';`;
                    let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
                    if (!results[0]) {  return reject({userMess: `The creator of the category "${category}" could not be determined, so you may not remove audio "${audio}" from it!`}); }
                    let rtnDiscordId = results[0]["discord_id"];
                    if (Number(discordId) != Number(rtnDiscordId)) {  return reject({userMess: `You did not create the category "${category}" so you may not remove audio "${audio}" from it!`}); }
                }
            } catch (err) {
                return reject(err);               
            }                   

            // Loop over the audio array and call the store procedure
            try {
                for (let audio of audioArray) {
                    // Check if that audio is already in the category
                    if (!gd.categoryDict[category].includes(audio)) { 
                        message.author.send(`Audio "${audio}" is not in the category "${category}", so it cannot be removed from that category!`);
                        continue;
                    }                    

                    // Call stored procedure
                    let queryStr = `CALL del_audio_category('${audio}', '${category}', @message); SELECT @message;`;
                    let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
                    let rtnMess = results[1][0]['@message'];
                    if (rtnMess === 'Success') {
                        hf.updateCategoryDict(gd.categoryDict, category, audio, "remove");
                        message.author.send(`audio "${audio}" has been deleted from the category "${category}"!`);
                    } else {
                        return reject({
                            userMess: "Deleting audio from category was aborted! Try again later or talk to Kevin.",
                            err: rtnMess
                        });
                    }
                }
            } catch (err) {
                return reject(err);               
            }

            // Return resolve promise
            return resolve({userMess: `Deleting audio from category complete!`});
        });
    }
};