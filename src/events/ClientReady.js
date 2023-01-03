const { Events, ActivityType, Client } = require("discord.js");
const path = require("path");
const AVATAR_PATH = path.join(__dirname, "../images/pumping-iron-cropped.png");

module.exports = {
  name: Events.ClientReady,
  once: true,
  /**
   * @param {Client} client
   */
  async execute(client) {
    await client.user.setAvatar(AVATAR_PATH);
    await client.user.setActivity("kev-bot | help!kb", { type: ActivityType.Playing });
    console.log(`Logged in as ${client.user.tag}!`);
  },
};
