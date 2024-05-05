var ffmpeg = require('fluent-ffmpeg');
const {getAudioDurationInSeconds} = require('get-audio-duration');
const hf = require('../helperfcns.js');
// const gd = require('../globaldata.js');
const fs = require('fs-extra');
const path = require('path');

async function asyncFunction() {
    // Folder paths
    const inputFolderPath = path.join(__dirname, process.argv[2]);
    const outputFolderPath = path.join(inputFolderPath, './norm/');

    // Make the output directory
    fs.mkdirSync(outputFolderPath); 

    // Loop over input files
    let inputFiles = fs.readdirSync(inputFolderPath);
    for (let inputFile of inputFiles) {
        if (inputFile.split('.').pop() != "mp3") {
            continue;
        }
        let inputFilePath = path.join(inputFolderPath, inputFile);
        let duration = await getAudioDurationInSeconds(inputFilePath);
        let outputFilePath = path.join(outputFolderPath, inputFile);
        await hf.normalizeAudio(inputFilePath, outputFilePath, duration);

    }
}

asyncFunction();