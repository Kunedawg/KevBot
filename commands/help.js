// imports
var gd = require('../globaldata.js');
const {breakUpResponse} = require("../helperfcns.js")
const { Message } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Help with kev-bot commands.',
    usage: 'help!kevbot, help!kb',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async(resolve,reject) => {
            try {
                // Getting category
                var helpCategory = args?.[0];

                // Determine if help command was called by accident
                if (!helpCategory) {
                    return resolve("Accidental help call, no help sent!");
                }

                // Return if the help category is not kevbot
                if (helpCategory !== 'kevbot' && helpCategory !== 'kb') {
                    return reject({
                        userResponse: `Please use the command "help!kb" for help with kev-bot.`
                    });
                }

                // Header of response
                var response = 'Thanks for using kev-bot! This bot is for people who are ballsy and dont take shit from anyone.\n\n';
                response += 'General command format: "command!arg1 arg2 arg3".\n\n' + '!@#';

                // Loop over commands
                for (let command of gd.getClient().commands.values()) {
                    response += `command:     ${command.name}\n`;
                    response += `usage:       ${command.usage}\n`;
                    response += `description: ${command.description}\n\n!@#`;
                }

                // send the reponse in chunks
                for (let responseChunk of breakUpResponse(response)) await message.author.send(responseChunk);

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