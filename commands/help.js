module.exports = {
    name: 'help',
    description: 'Help with kev-bot commands.',
    usage: 'help!kevbot',
    args: true,
    execute({message, args}) {
        // import the audio dict
        const kev_bot = require('../kev-bot');

        // Getting category
        var help_category = args[0];

        // Listing all commands and how to use them
        if (help_category === 'kevbot') {
            var response = '';
            response += 'Thanks for using kev-bot! This bot is for people who are ballsy and dont take shit from anyone.\n\n';
            response += 'General command format: "command!arg1 arg2 arg3".\n\n';
            for (let command of kev_bot.client.commands.values()) {
                response += 'command:     ' + command.name + '\n';
                response += 'usage:       ' + command.usage + '\n';
                response += 'description: ' + command.description + '\n\n';
            }
            // Sending response
            message.author.send('```' + response + '```'); // Note ``` turns the message into a code block
        }
    }
};