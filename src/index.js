const { GatewayIntentBits, Client, Partials } = require("discord.js");
const { directories } = require("./functions/initialization/directories");
const { audio } = require("./functions/initialization/audio");
const { categories } = require("./functions/initialization/categories");
require("dotenv").config();

// const { commands } = require("./functions/initialization/commands");
// const { updateUserNames } = require("./functions/updateUserNames.js");

// Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Initialization
(async () => {
  console.log("Initializing...");
  await directories();
  await audio(process.env.CLEAR_AUDIO_PRIOR_TO_DOWNLOAD === "true");
  await categories();
  // console.log(await commands(client));
  await client.login(process.env.BOT_TOKEN);
  // await updateUserNames();
  console.log("Initializing...done!");
})().catch((err) => {
  console.error(err);
  console.error("Initializing...failed! Exiting program!");
  process.exit(1);
});

// delete below once implemented elsewhere

// // Event Handlers
// const eventsPath = path.join(__dirname, "events");
// const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));
// for (const file of eventFiles) {
//   const filePath = path.join(eventsPath, file);
//   const event = require(filePath);
//   if (event.once) {
//     client.once(event.name, (...args) => event.execute(client, ...args));
//   } else {
//     client.on(event.name, (...args) => event.execute(client, ...args));
//   }
// }

// // Timed event start
// const MS_PER_HOUR = 3600000;
// const MS_PER_DAY = 86400000;
// setInterval(client.emit("OncePerHour"), MS_PER_HOUR);
// setInterval(client.emit("OncePerDay"), MS_PER_DAY);
