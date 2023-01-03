const path = require("path");
const fs = require("fs");

/**
 * Handles event calls
 * @param {Client} client
 */
function handleEvents(client) {
  try {
    console.log("Events initializing...");
    const eventsPath = path.join(__dirname, "../../events");
    const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));
    eventFiles.forEach((file) => {
      const event = require(path.join(eventsPath, file));
      if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
      } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
      }
    });
    console.log("Events initializing...done!");
  } catch (err) {
    console.error("Events initializing...failed!");
    throw err;
  }
}

module.exports = { handleEvents };
