const gd = require("./globaldata.js.js");
var fs = require("fs-extra");

/**
 * Creates / empty some directories on startup
 */
function directories() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Directories initializing...");
      if (!fs.existsSync(gd.audioPath)) {
        fs.mkdirSync(gd.audioPath);
      }
      if (!fs.existsSync(gd.tempDataPath)) {
        fs.mkdirSync(gd.tempDataPath);
      }
      fs.emptyDirSync(gd.tempDataPath);
      return resolve("Directories initialization done!\n");
    } catch (err) {
      return reject("Directories failed to init!\n" + err);
    }
  });
}

module.exports = { directories };
