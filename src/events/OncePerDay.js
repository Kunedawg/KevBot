const { updateUserNames } = require("../functions/updateUserNames.js");

module.exports = {
  name: "OncePerDay",
  once: false,
  execute() {
    return new Promise(async (resolve, reject) => {
      try {
        await updateUserNames();
      } catch (err) {
        return reject(err);
        // TODO: this reject is not going to get caught anywhere
      }
      return resolve();
    });
  },
};
