const { GatewayIntentBits, Client, Partials } = require("discord.js");
const { directories } = require("./functions/initialization/directories");
const { audio } = require("./functions/initialization/audio");
const { categories } = require("./functions/initialization/categories");
const { updateUserNames } = require("./functions/updaters/updateUserNames.js");
const { handleEvents } = require("./functions/handlers/handleEvents");
const { handleCommands } = require("./functions/handlers/handleCommands");
require("dotenv").config();

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
  await updateUserNames(client);
  handleEvents(client);
  handleCommands(client);
  await client.login(process.env.BOT_TOKEN);
  console.log("Initializing...done!");
})().catch((err) => {
  console.error(err);
  console.error("Initializing...failed! Exiting program!");
  process.exit(1);
});
