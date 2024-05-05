// imports
const gd = require("../globaldata.js");
var fs = require("fs-extra");
const path = require("path");
const hf = require("../helperfcns.js");
const { getAudioDurationInSeconds } = require("get-audio-duration");

// Deletes all of the audio from the audio Table and downloads and uploads all the audio from google cloud
async function initAudioTable() {
  try {
    console.log("Starting init of Audio Table...");
    // Clears the audio Table of all entries
    let queryStr = `DELETE FROM audio;`;
    await hf.asyncQuery(gd.sqlconnection, queryStr);

    // Get files from the google cloud server and empty the audio directory
    var files = await gd.audioBucket.getFiles();
    fs.emptyDirSync(gd.audioPath);

    // Loop over the files, download them, determine the duration, and update the audio Table
    let loopCount = 0;
    for (f of files[0]) {
      loopCount++;
      let downloadFilePath = path.join(gd.audioPath, f.name);
      await f.download({ destination: downloadFilePath });
      let duration = await getAudioDurationInSeconds(downloadFilePath);
      let queryStr = `CALL add_audio('1124', '${f.name.split(".")[0]}', '${duration}', @message); SELECT @message;`;
      let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
      let rtnMess = results[1][0]["@message"];
      if (rtnMess !== "Success") {
        throw "SQL add_audio stored procedure failed!";
      }
      console.log(
        `downloaded:\t\t${f.name}\t\tduration:\t\t${duration}\t\tnumber:\t\t${loopCount}\\${files[0].length}`
      );
    }

    // Finished
    console.log("Done!");
  } catch (err) {
    console.log("Failed!\n" + err);
    process.exit(1);
  }
}

module.exports = {
  initAudioTable,
};
