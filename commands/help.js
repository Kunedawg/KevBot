const { Message } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Help with kev-bot commands.',
    usage: 'help!kevbot',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async(resolve,reject) => {
            // imports
            const kevbot = require('../kev-bot');
            const {breakUpResponse} = require("../helper_functions/helperfcns.js")

            // Getting category
            var helpCategory = args[0];

            // Determine if help command was called by accident
            if (helpCategory === '') {
                return resolve("Accidental help call, no help sent!");
            }

            // Return if the help category is not kevbot
            if (helpCategory !== 'kevbot') {
                return reject({
                    userResponse: `Please use the command "help!kevbot" for help with kev-bot.`,
                    err: "help: invalid arg"
                });
            }

            // Listing all commands and how to use them
            try {
                // Header
                var response = 'Thanks for using kev-bot! This bot is for people who are ballsy and dont take shit from anyone.\n\n';
                response += 'General command format: "command!arg1 arg2 arg3".\n\n';

                // Command text
                const MAX_CHAR_LENGTH = 2000;
                for (let command of kevbot.client.commands.values()) {
                    var commandText = '';
                    commandText += 'command:     ' + command.name + '\n';
                    commandText += 'usage:       ' + command.usage + '\n';
                    commandText += 'description: ' + command.description + '\n\n';
                    if ((response.length + commandText.length) <= (MAX_CHAR_LENGTH - 6)) {  // Check to make sure we do not exceed character limit
                        response += commandText;
                    } else {
                        response = '```' + response + '```'; // Wrapping the response with ``` to turn it into a code block
                        await message.author.send(response);
                        response = commandText;
                    }
                }
                if (response.length > 0){
                    response = '```' + response + '```'; 
                    await message.author.send(response);
                }
            } catch (err) {
                return reject({
                    userResponse: "Failed to generate the help file. Talk to Kevin.",
                    err: err
                });
            }

            // Return the promise
            return resolve("Help sent!");
        });
    }
};