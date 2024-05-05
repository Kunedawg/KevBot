const path = require("path");
const fs = require("fs");

/**
 * Handles event calls
 * @param {Client} client
 */
function handleEvents(client) {
  try {
    console.log("Events initializing...");
    // register events with client
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
    // timed events start
    const MS_PER_HOUR = 3600000;
    const MS_PER_DAY = 86400000;
    setInterval(() => client.emit("OncePerHour"), MS_PER_HOUR);
    setInterval(() => client.emit("OncePerDay"), MS_PER_DAY);
    console.log("Events initializing...done!");
  } catch (err) {
    console.error("Events initializing...failed!");
    throw err;
  }
}

module.exports = { handleEvents };
