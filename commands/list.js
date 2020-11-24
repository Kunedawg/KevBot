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
        // import the audio dict
        const kev_bot = require('../kev-bot');

        // Getting category
        var category = args[0];

        // Listing all commands of a given category, or listing all 
        if (category in kev_bot.category_dict || category === "categories") {
            // Getting the relevant array that needs to be listed
            if (category === "categories") {
                list_array = Object.keys(kev_bot.category_dict);
            } else {
                list_array = kev_bot.category_dict[category];
            }

            // Sort list
            list_array.sort();

            // Finding the item with the largest number of characters
            var largetNumOfChars = 0;
            for (var item of list_array) {
                if (item.length > largetNumOfChars) {
                    largetNumOfChars = item.length;
                }
            }

            // Generating the response message (by column)
            var response = '';
            var num_columns = 4;
            var num_rows = Math.ceil(list_array.length / num_columns);
            for (var i = 0; i < num_rows; i++) {
                for (var j = 0; j < num_columns; j++) {
                    if (i +j*num_rows < list_array.length) {
                        var item = list_array[i +j*num_rows];
                        var space_str = ' '.repeat(largetNumOfChars - item.length);
                        response += item + space_str + '  ';
                    }    
                }
                response += '\n';
            }
            
            // Need to split response into 2000 char chunks
            const MAX_CHAR_LENGTH = 2000;
            var responseSplit = '';
            var responseLines = response.split('\n');
            for(var i = 0;i < responseLines.length;i++){
                if ((responseSplit.length + responseLines[i].length + 6) > MAX_CHAR_LENGTH) {
                    message.author.send('```' + responseSplit + '```');
                    responseSplit = responseLines[i] + '\n';
                } else {
                    responseSplit += responseLines[i] + '\n';
                }
            }
            if (responseSplit.length > 0) {
                message.author.send('```' + responseSplit + '```');
            }  
        }
    }
};