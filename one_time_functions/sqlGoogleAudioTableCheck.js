// imports
const gd = require('../globaldata.js');
var fs = require('fs-extra');
const config = require('../config.json');
const {Storage} = require('@google-cloud/storage');
const path = require('path');
const hf = require('../helperfcns.js');

// Deletes all of the audio from the audio Table and downloads and uploads all the audio from google cloud
async function sqlGoogleAudioTableCheck(){
    try {
        console.log("Starting consistency check of google cloud and sql server...");
        // Retrieve SQL server list of audio            
        let queryStr = `SELECT audio_name FROM audio;`;
        let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
        if (!results[0]) { throw "Audio could not be retrieved by the SQL server!" }
        let sqlAudioList = [];
        for (let result of results) { sqlAudioList.push(result["audio_name"]); }

        // Get the google cloud list of audio
        const gc = new Storage({
            projectId: config.cloudCredentials.project_id,
            credentials: config.cloudCredentials
        });
        var audioBucket = gc.bucket(config.bucketName);
        var files = await audioBucket.getFiles();
        let googleAudioList = [];
        for (let file of files[0]) { googleAudioList.push(file.name.split(".")[0]); }

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
        if (!sqlGoogleAudioComparePass) { throw "There is a mismatch between the google and sql audio files."}

        // Finished
        console.log("Done!")
    } catch(err) {
        console.log("Failed!\n" + err);
        process.exit(1);
    }
}


module.exports = {
    sqlGoogleAudioTableCheck
}