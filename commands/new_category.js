// imports
const gd = require('../globaldata.js');
const { Message } = require('discord.js');
const hf = require('../helperfcns.js');

module.exports = {
    name: 'newcategory',
    description: 'Creates a new category. You can add commands to this category after it has been created.',
    usage: 'newcategory!category_name',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async(resolve,reject) => {
            console.log("newcat call!");
            // Get discord id and check that it is valid
            let discordId = message?.author?.id;
            if(!discordId) { return reject({ userMess: `Failed to retrieve discord id!`}); }

            // Get greeting from args and check that it is not null
            var category = args?.[0];
            if(!category) {
                return reject({ userMess: `You did not provide a category name, ya dingus!`});
            }
            
            // Check that category name is unique
            console.log(gd.categoryList);
            if(gd.categoryList.includes(category)) {
                return reject({ userMess: `The category "${category}" already exists!`});
            }            

            // check that the category name format is valid
            if (!hf.kevbotStringOkay(category)){
                return reject({userMess: `The category name can only contain lower case letters and numbers.`});
            }

            // Check that no additional args were given
            if (args.length > 1){
                return reject({userMess: `Please only provide one category at a time. Also remember spaces are not allowed in category names.`});
            }            

            // Call get_greeting stored procedure
            let queryStr = `CALL add_category('${discordId}','${category}', @message); SELECT @message;`;
            gd.sqlconnection.query(queryStr, (err, results) => {
                if (err) {
                    return reject({
                        userMess: "Failed to add new category. Try again later or talk to Kevin.",
                        err: err
                    });
                } else {
                    let rtnMess = results[1][0]['@message'];
                    if (rtnMess === 'Success') {
                        return resolve({userMess: `You have created the new category, "${category}"!`});
                    } else {
                        return reject({
                            userMess: "Failed to add new category. Try again later or talk to Kevin.",
                            err: rtnMess
                        });
                    }
                }
            });
        });
    }
};