const { Client, Collection } = require("discord.js");
const fs = require("fs-extra");

/**
 * Stores commands into a collection
 * @param {Client} client
 */
function handleCommands(client) {
  try {
    console.log("Commands initializing...");
    client.commands = new Collection();
    const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const command = require(`../../commands/${file}`);
      client.commands.set(command.name, command);
    }
    console.log("Commands initializing...done!");
  } catch (err) {
    console.error("Commands initializing...failed!");
    throw err;
  }
}

module.exports = { handleCommands };
