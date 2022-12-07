const gd = require("./globaldata.js.js");
var fs = require("fs-extra");
const path = require("path");
const hf = require("./helperfcns.js.js");

/**
 * Downloads from google cloud server, checks SQL server list, creates audioDict that does this mapping, yes -> ./audio/yes.mp3
 * @param {Boolean} freshDownload - Defaults to false. When set to true it will trigger the local audio folder to be purged
 */
function audio(freshDownload = false) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Audio initializing...");

      // Retrieve SQL server list of audio
      let queryStr = `SELECT audio_name FROM audio;`;
      let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
      if (!results[0]) {
        throw "Audio could not be retrieved by the SQL server!";
      }
      let sqlAudioList = [];
      for (let result of results) {
        sqlAudioList.push(result["audio_name"]);
      }

      // Retrieve google cloud list of audio
      var files = await gd.audioBucket.getFiles();
      let googleAudioList = [];
      for (let file of files[0]) {
        googleAudioList.push(file.name.split(".")[0]);
      }
      console.log(`There are ${googleAudioList.length} files on google cloud!`);

      // Compare SQL list to google list
      let sqlGoogleAudioComparePass = true;
      for (let sqlAudio of sqlAudioList) {
        if (!googleAudioList.includes(sqlAudio)) {
          console.log(`The google cloud audio list does not have the sql file "${sqlAudio}"`);
          sqlGoogleAudioComparePass = false;
        }
      }
      for (let googleAudio of googleAudioList) {
        if (!sqlAudioList.includes(googleAudio)) {
          console.log(`The sql audio list does not have the google file "${googleAudio}"`);
          sqlGoogleAudioComparePass = false;
        }
      }
      if (!sqlGoogleAudioComparePass) {
        throw "There is a mismatch between the google and sql audio files.";
      }

      // Empty audio folder if a fresh download is needed
      if (freshDownload) {
        fs.emptyDirSync(gd.audioPath);
      }

      // Determine files that have not been downloaded and download them
      let currentFiles = fs.readdirSync(gd.audioPath);
      let notDownloadedFiles = [];
      for (let file of files[0]) {
        if (!currentFiles.includes(file.name)) {
          notDownloadedFiles.push(file);
        }
      }
      if (notDownloadedFiles.length > 0) {
        for (let [i, file] of notDownloadedFiles.entries()) {
          console.log(`Downloading audio files from google cloud...[${i + 1}/${notDownloadedFiles.length}]`);
          await file.download({ destination: path.join(gd.audioPath, file.name) });
        }
        console.log("\nDownload of audio files complete!");
      }

      // Store all of the file paths in a dictionary
      for (var f of fs.readdirSync(gd.audioPath)) {
        if (f.split(".")[1] === "mp3") {
          let audio = f.split(".")[0];
          let audioFilePath = path.join(gd.audioPath, f);
          gd.audioDict[audio] = audioFilePath;
        }
      }

      // Check that the audioDict matches the google file list
      let dictGoogleAudioComparePass = true;
      for (let dictAudio of Object.keys(gd.audioDict)) {
        if (!googleAudioList.includes(dictAudio)) {
          console.log(`The google audio list does not have the audioDict file "${dictAudio}"`);
          dictGoogleAudioComparePass = false;
        }
      }
      for (let googleAudio of googleAudioList) {
        if (!Object.keys(gd.audioDict).includes(googleAudio)) {
          console.log(`The audioDict does not have the google file "${googleAudio}"`);
          dictGoogleAudioComparePass = false;
        }
      }
      if (!dictGoogleAudioComparePass) {
        throw "There is a mismatch between the google files and the audio dict.";
      }

      // Return promise
      return resolve("Audio initialization done!\n");
    } catch (err) {
      return reject("Audio failed to init!\n" + err);
    }
  });
}

module.exports = { audio };
