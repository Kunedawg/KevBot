const { sqlDatabase, audioBucket, audioPath, audioDict } = require("../../data");
const fs = require("fs-extra");
const path = require("path");

/**
 * Compare SQL audio table to files on the google bucket, they should match.
 */
async function compareSqlToGoogleBucket() {
  let results = await sqlDatabase.asyncQuery(`SELECT audio_name FROM audio;`);
  if (!results[0]) {
    throw "Audio could not be retrieved by the SQL server!";
  }
  const sqlAudioList = results.map((result) => result["audio_name"]);
  const [googleFiles] = await audioBucket.getFiles();
  const googleAudioList = googleFiles.map((file) => file.name.split(".")[0]);
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
  return [googleFiles, googleAudioList];
}

/**
 * Determine files that have not been downloaded and download them
 * @param {any} googleFiles
 */
async function downloadGoogleFiles(googleFiles) {
  if (!googleFiles) {
    const [googleFiles] = await audioBucket.getFiles();
  }
  let currentFiles = fs.readdirSync(audioPath);
  const notDownloadedFiles = googleFiles.filter((file) => !currentFiles.includes(file.name));
  if (notDownloadedFiles.length > 0) {
    for (let [i, file] of notDownloadedFiles.entries()) {
      console.log(`Downloading audio files from google cloud...[${i + 1}/${notDownloadedFiles.length}]`);
      await file.download({ destination: path.join(audioPath, file.name) });
    }
    console.log("\nDownload of audio files complete!");
  }
}

/**
 * Store all of the file paths in a dictionary
 */
async function saveFilePaths() {
  for (var f of fs.readdirSync(audioPath)) {
    if (f.split(".")[1] === "mp3") {
      let audio = f.split(".")[0];
      let audioFilePath = path.join(audioPath, f);
      audioDict[audio] = audioFilePath;
    }
  }
}

/**
 * Check that the audioDict matches the google file list
 */
async function compareAudioDictToGoogleList(googleAudioList) {
  let dictGoogleAudioComparePass = true;
  for (let dictAudio of Object.keys(audioDict)) {
    if (!googleAudioList.includes(dictAudio)) {
      console.log(`The google audio list does not have the audioDict file "${dictAudio}"`);
      dictGoogleAudioComparePass = false;
    }
  }
  for (let googleAudio of googleAudioList) {
    if (!Object.keys(audioDict).includes(googleAudio)) {
      console.log(`The audioDict does not have the google file "${googleAudio}"`);
      dictGoogleAudioComparePass = false;
    }
  }
  if (!dictGoogleAudioComparePass) {
    throw "There is a mismatch between the google files and the audio dict.";
  }
}

/**
 * Downloads from google cloud server, checks SQL server list, creates audioDict that does this mapping, yes -> ./audio/yes.mp3
 * @param {Boolean} freshDownload - Defaults to false. When set to true it will trigger the local audio folder to be purged
 */
async function audio(freshDownload = false) {
  try {
    console.log("Audio initializing...");
    const [googleFiles, googleAudioList] = await compareSqlToGoogleBucket();
    if (freshDownload) fs.emptyDirSync(audioPath);
    await downloadGoogleFiles(googleFiles);
    await saveFilePaths();
    await compareAudioDictToGoogleList(googleAudioList);
    console.log("Audio initializing...done!");
  } catch (err) {
    console.error("Audio initializing...failed!");
    throw err;
  }
}

module.exports = { audio };
