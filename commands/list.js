module.exports = {
    name: 'list',
    description: 'List all commands',
    args: true,
    execute(message, args) {
        // import the audio dict
        const kev_bot = require('../kev-bot');

        // Getting category
        var category = args[0];

        // Logging all commands
        if (category === 'all') {

            // Finding the command with the largest number of characters
            var largetNumOfChars = 0;
            for (var command in kev_bot.audio_dict) {
                if (command.length > largetNumOfChars) {
                    largetNumOfChars = command.length;
                }
            }

            // Generating the response message (by row)
            // var response = '';
            // var i = 1;
            // var num_columns = 4;
            // var space_str = '';
            // for (var command in kev_bot.audio_dict) {
            //     space_str = ' '.repeat(largetNumOfChars - command.length);
            //     response = response + command + space_str + (i >= num_columns ? '\n' : '  ');
            //     i = (i >= num_columns) ? 1 : i + 1;              
            // }

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

            // Sending response
            message.author.send('```' + response + '```'); // Note ``` turns the message into a code block
        }
    }
};