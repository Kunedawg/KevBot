// imports
const gd = require('../globaldata.js');
const { Message } = require('discord.js');
const hf = require('../helperfcns.js');

module.exports = {
    name: 'addtocat',
    description: 'Adds audio to the specified category.',
    usage: 'addtocat!categoryName audioName1 audioName2 audioName3...',
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

            // Check that category name is in the categorylist
            if (!gd.categoryList.includes(category)) { return reject({ userMess: `The category "${category}" does not exist!`}); }       

            // Loop over the audio array and call the store procedure
            try {
                for (let audio of audioArray) {
                    // check that audio is in the audioDict
                    if (!Object.keys(gd.audioDict).includes(audio)) { 
                        message.author.send(`Audio "${audio}" does not exist so it will not be added to category "${category}"!`);
                        continue;
                    }

                    // Check if audio is already in the category
                    if (Object.keys(gd.categoryDict).includes(category)) {
                        if (gd.categoryDict[category].includes(audio)) { 
                            message.author.send(`Audio "${audio}" is already in the category "${category}", no need to add it again!`);
                            continue;
                        }
                    }                

                    // Call stored procedure
                    let queryStr = `CALL add_audio_category('${discordId}', '${audio}', '${category}', @message); SELECT @message;`;
                    let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
                    let rtnMess = results[1][0]['@message'];
                    if (rtnMess === 'Success') {
                        hf.updateCategoryDict(gd.categoryDict, category, audio);
                        message.author.send(`audio "${audio}" has been added to the category "${category}"!`);
                    } else {
                        return reject({
                            userMess: "Adding audio to category was aborted! Try again later or talk to Kevin.",
                            err: rtnMess
                        });
                    }
                }
            } catch (err) {
                return reject(err);               
            }

            // Return resolve promise
            return resolve({userMess: `Adding audio to category complete!`});
        });
    }
};