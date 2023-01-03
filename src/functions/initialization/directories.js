const { audioPath, tempDataPath } = require("../../data");
const fs = require("fs-extra");

/**
 * Creates / empty some directories on startup
 */
async function directories() {
  try {
    console.log("Directories initializing...");
    if (!fs.existsSync(audioPath)) {
      fs.mkdirSync(audioPath);
    }
    if (!fs.existsSync(tempDataPath)) {
      fs.mkdirSync(tempDataPath);
    }
    fs.emptyDirSync(tempDataPath);
    console.log("Directories initializing...done!");
  } catch (err) {
    console.error("Directories initializing...failed!");
    throw err;
  }
}

module.exports = { directories };
