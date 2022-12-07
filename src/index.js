const init = require("./init.js");
const { updateUserNames } = require("./functions/updateUserNames.js");
const { GatewayIntentBits, Client, Partials } = require("discord.js");

// Client
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
async function initialize() {
  console.log(await init.directories());
  console.log(await init.audio(process.env.CLEAR_AUDIO_PRIOR_TO_DOWNLOAD === "true"));
  console.log(await init.categories());
  console.log(await init.commands());
  await client.login(process.env.BOT_TOKEN);
  await updateUserNames();
}
initialize().catch((err) => {
  console.error(err);
  console.error("Initialization failed! Exiting program!");
  process.exit(1);
});

// Event Handlers
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

// Timed event start
const MS_PER_HOUR = 3600000;
const MS_PER_DAY = 86400000;
setInterval(client.emit("OncePerHour"), MS_PER_HOUR);
setInterval(client.emit("OncePerDay"), MS_PER_DAY);
