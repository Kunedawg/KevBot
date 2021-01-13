// imports
const gd = require('../globaldata.js');
const { Message } = require('discord.js');
const hf = require('../helperfcns.js');

module.exports = {
    name: 'addcatsto',
    description: 'Adds the given audio name to the specified categories.',
    usage: 'addtocat!audioName categoryName1 categoryName2 categoryName3...',
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
            var audio = args.shift();
            var categoryArray = args;

            // check that audio is in the audioDict
            if (!Object.keys(gd.audioDict).includes(audio)) { return reject({ userMess: `The audio name "${audio}" does not exist!`}); }       

            // Loop over the audio array and call the store procedure
            try {
                for (let category of categoryArray) {
                    // check that category is in the category list
                    if (!gd.categoryList.includes(category)) { 
                        message.author.send(`The category "${category}" does not exist so the audio "${audio}" will not be added it"!`);
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
                        message.author.send(`Audio "${audio}" has been added to the category "${category}"!`);
                    } else {
                        return reject({
                            userMess: "Adding audio to catogories was aborted! Try again later or talk to Kevin.",
                            err: rtnMess
                        });
                    }
                }
            } catch (err) {
                return reject(err);               
            }

            // Return resolve promise
            return resolve({userMess: `Adding audio to catogories complete!`});
        });
    }
};