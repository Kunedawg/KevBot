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
            console.log('largetNumOfChars: ', largetNumOfChars)

            // Generating the response message
            var response = '';
            var i = 1;
            var num_columns = 4;
            var space_str = '';
            for (var command in kev_bot.audio_dict) {
                space_str = ' '.repeat(largetNumOfChars - command.length);
                response = response + command + space_str + (i >= num_columns ? '\n' : '  ');
                i = (i >= num_columns) ? 1 : i + 1;              
            }

            // Sending response
            message.author.send('```' + response + '```'); // Note ``` turns the message into a code block

        }
    }
};