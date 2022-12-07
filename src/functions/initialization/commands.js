const gd = require("./globaldata.js.js");
var fs = require("fs-extra");
const Discord = require("discord.js");

/**
 * Stores commands into a collection
 */
function commands() {
  return new Promise(async (resolve, reject) => {
    try {
      // Starting message
      console.log("Commands initializing...");

      // Loop over the commands
      gd.client.commands = new Discord.Collection();
      const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        gd.client.commands.set(command.name, command);
      }

      // Return promise
      return resolve("Commands initialization done!\n");
    } catch (err) {
      return reject("Commands failed to init!\n" + err);
    }
  });
}

module.exports = { commands };
