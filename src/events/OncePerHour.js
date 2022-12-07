const { updateMostPlayed } = require("../functions/updateMostPlayed.js");
const { updateUploadsByUsers } = require("../functions/updateUploadsByUsers.js");

module.exports = {
  name: "OncePerHour",
  once: false,
  execute() {
    return new Promise(async (resolve, reject) => {
      try {
        await updateMostPlayed();
        await updateUploadsByUsers();
      } catch (err) {
        return reject(err);
        // TODO: this reject is not going to get caught anywhere
      }
      return resolve();
    });
  },
};
