const { updateMostPlayed } = require("../functions/updaters/updateMostPlayed.js");
const { updateUploadsByUsers } = require("../functions/updaters/updateUploadsByUsers.js");

module.exports = {
  name: "OncePerHour",
  once: false,
  async execute() {
    await updateMostPlayed();
    await updateUploadsByUsers();
  },
};
