const { Events, Message, Client } = require("discord.js");
const hf = require("../helperfcns");

module.exports = {
  name: Events.MessageCreate,
  once: false,
  /**
   * @param {Client} client
   * @param {Message} message
   */
  async execute(client, message) {
    try {
      // retrieve prefix from ENV
      const prefix = process.env.COMMAND_PREFIX;

      // Return if the message does not start with the prefix or if the message was from a bot
      if (!message.content.startsWith(prefix) || message.author.bot || !message.content.includes("!")) {
        return;
      }

      // Get args and command name. Format of every command should follow "<prefix><command>!<arg1> <arg2> <arg3> <arg4>"
      const messageSplit = message.content.toLowerCase().slice(prefix.length).trim().split("!"); // ["command", "arg1 arg2 arg3 arg4"]
      var commandName = messageSplit[0]; // "command"
      var args = messageSplit[1] ? messageSplit[1].split(/ +/) : undefined; // array of the args ["arg1", "arg2", "arg3", "arg4"]

      // Execute command if it exists
      if (client.commands.has(commandName)) {
        let response = await client.commands.get(commandName).execute({ message: message, args: args });
        if (response?.userMess) {
          for (res of hf.breakUpResponse(response.userMess, "!@#", response.wrapChar || "")) {
            await message.author.send(res);
          }
        }
      }
    } catch (err) {
      console.error(
        `DiscordID: "${message?.author?.id || "undefined"}". Command: "${message || "undefined"}". Failed with err: `,
        err
      );

      // User response
      if (message) {
        if (err.userMess) {
          if (err.userMess != "SUPPRESS_GENERAL_ERR_MESSAGE") {
            message.author.send(err.userMess);
          }
        } else {
          if (commandName) {
            message.author.send(`There was an issue executing command "${commandName}"! Talk to Kevin.`);
          } else {
            message.author.send(`Something went wrong! Talk to Kevin.`);
          }
        }
      }
    }
  },
};
