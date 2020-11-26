const { Message } = require('discord.js');

module.exports = {
    name: 'list',
    description: 'List all commands of the given category or list all categories.',
    usage: 'list!all, list!categories, list!arnold',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async(resolve,reject) => {
            // imports
            var gd = require('../globaldata.js');
            const {breakUpResponse} = require("../helperfcns.js")

            // Getting category and category dict
            var category = args[0];
            var categoryDict = gd.getCategoryDict();

            // Listing all commands of a given category, or listing all 
            if (category in categoryDict || category === "categories") {
                // Getting the relevant array that needs to be listed and sorting it
                let listArray = category === "categories" ? Object.keys(categoryDict) : categoryDict[category];
                listArray.sort();

                // Finding the item with the largest number of characters
                for (let item of listArray) {
                    if (item.length > (largetNumOfChars || 0)) var largetNumOfChars = item.length;
                }
                if (!largetNumOfChars) return reject("Couldn't get largest number of characters");

                // Generating the response message (by column)
                let response = '';
                const num_columns = 4;
                const num_rows = Math.ceil(listArray.length / num_columns);
                for (let i = 0; i < num_rows; i++) {
                    for (let j = 0; j < num_columns; j++) {
                        if (i +j*num_rows < listArray.length) {
                            let item = listArray[i +j*num_rows];
                            let space_str = ' '.repeat(largetNumOfChars - item.length);
                            response += item + space_str + '  ';
                        }    
                    }
                    response += '\n';
                }
                
                // Send the response in chunks to the author of the message
                try {
                    for (let responseChunk of breakUpResponse(response)) await message.author.send(responseChunk);
                } catch (err) {
                    return reject({
                        userResponse: "Failed to send the requested list! Talk to Kevin.",
                        err: err
                    });
                }
            } else {
                if (category != '') return reject({userResponse: `"${category}" is not a valid argument for the list command!`})
            }

            // return the resolve
            return resolve("List executed succesfully!");
        });
    }
};