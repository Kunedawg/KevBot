const { updateUserNames } = require("../functions/updaters/updateUserNames.js");

module.exports = {
  name: "OncePerDay",
  once: false,
  async execute(client) {
    await updateUserNames(client);
  },
};
