const { Client, Collection } = require("discord.js");
const fs = require("fs-extra");

/**
 * Stores commands into a collection
 * @param {Client} client
 */
function handleCommands(client) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Commands initializing...");
      client.commands = new Collection();
      const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
      }
      return resolve("Commands initialization done!\n");
    } catch (err) {
      return reject("Commands failed to init!\n" + err);
    }
  });
}

module.exports = { handleCommands };
