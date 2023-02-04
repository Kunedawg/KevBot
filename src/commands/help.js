const { Message } = require("discord.js");

module.exports = {
  name: "help",
  description: "Help with kev-bot commands.",
  usage: "help!kevbot, help!kb",
  /**
   * @param {Object} methodargs
   * @param {Message} methodargs.message
   * @param {Array.<string>} methodargs.args
   */
  execute({ message, args }) {
    return new Promise(async (resolve, reject) => {
      // Validate inputs
      var helpCategory = args?.[0];
      if (helpCategory === undefined || helpCategory === "") {
        return resolve();
      }

      // Return if the help category is not kevbot
      if (!["kevbot", "kb", "kev-bot"].includes(helpCategory)) {
        return reject({ userMess: `Please use the command "help!kb" for help with kev-bot.` });
      }

      // Header of response
      var response =
        "Thanks for using kev-bot! This bot is for people who are ballsy and don't take shit from anyone.\n\n";
      response += 'General command format: "command!arg1 arg2 arg3".\n\n' + "!@#";

      // Loop over commands
      for (let command of message.client.commands.values()) {
        response += `command:     ${command.name}\n`;
        response += `usage:       ${command.usage}\n`;
        response += `description: ${command.description}\n\n!@#`;
      }

      // Send link to github
      message.author.send("https://github.com/Kunedawg/kev-bot");

      // return promise
      return resolve({ userMess: response, wrapChar: "```" });
    });
  },
};
