module.exports = {
    name: 'list',
    description: 'List all commands of the given category.',
    usage: 'list!all',
    args: true,
    execute(message, args) {
        // import the audio dict
        const kev_bot = require('../kev-bot');

        // Getting category
        var category = args[0];

        // Listing all commands
        if (category === 'all') {

            // Finding the command with the largest number of characters
            var largetNumOfChars = 0;
            for (var command in kev_bot.audio_dict) {
                if (command.length > largetNumOfChars) {
                    largetNumOfChars = command.length;
                }
            }

            // Creating array of keys
            var i = 0;
            var command_array = [];
            for (var command in kev_bot.audio_dict) {
                command_array[i] = command;
                i++;
            }

            // Generating the response message (by column)
            var response = '';
            var space_str = '';
            var command = ''; 
            var num_columns = 4;
            var num_rows = Math.ceil(command_array.length / num_columns);
            for (var i = 0; i < num_rows; i++) {
                for (var j = 0; j < num_columns; j++) {
                    if (i +j*num_rows < command_array.length) {
                        command = command_array[i +j*num_rows];
                        space_str = ' '.repeat(largetNumOfChars - command.length);
                        response = response + command + space_str + '  ';
                    }    
                }
                response = response + '\n';
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