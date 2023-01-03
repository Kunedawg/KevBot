const path = require("path");

/**
 * Handles event calls
 * @param {Client} client
 */
function handleEvents(client) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Events initializing...");
      const eventsPath = path.join(__dirname, "events");
      const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));
      for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
          client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
          client.on(event.name, (...args) => event.execute(client, ...args));
        }
      }
      return resolve("Events initialization done!\n");
    } catch (err) {
      return reject("Events failed to init!\n" + err);
    }
  });
}

handleEvents.logDescription = "Registering Events";

module.exports = { handleEvents };
