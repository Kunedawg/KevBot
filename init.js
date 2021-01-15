// imports
const gd = require('./globaldata.js');
var fs = require('fs-extra');
const Discord = require('discord.js');
const config = require('./config.json');
const {Storage} = require('@google-cloud/storage');
const path = require('path');
const hf = require('./helperfcns.js');

// Creates some directories on startup
function directories(){
    return new Promise(async(resolve,reject) => {
        try {
            // Create directories if they do not exist
            if (!fs.existsSync(gd.audioPath)) {
               fs.mkdirSync(gd.audioPath); 
            }
            if (!fs.existsSync(gd.tempDataPath)) {
                fs.mkdirSync(gd.tempDataPath); 
            }            

            // empty the temp data directory
            fs.emptyDirSync(gd.tempDataPath);

            // Return promise
            return resolve("Directories inited!");
        } catch (err) {
            return reject("Directories failed to init!\n" + err);
        }
    });
}

// Downloads from google cloud server, checks SQL server list, creates audioDict that does this mapping, yes -> ./audio/yes.mp3
function audio(download = true){
    return new Promise(async(resolve,reject) => {
        try {
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

            // download all of the audio stored on the cloud server
            if (download) {
                fs.emptyDirSync(gd.audioPath);
                for (f of files[0]) {
                    console.log("downloading: ", f.name);
                    await f.download({destination: path.join(gd.audioPath, f.name)});
                }
            }

            // Store all of the file paths in a dictionary
            for(var f of fs.readdirSync(gd.audioPath)) {
                if (f.split(".")[1] === "mp3") {
                    let commandName = f.split('.')[0];
                    let filePath = path.join(gd.audioPath, f);
                    gd.audioDict[commandName] = filePath;
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
            if (!dictGoogleAudioComparePass) { throw "There is a mismatch between the google files and the audio dict."}

            // Return promise
            return resolve("Audio inited!");
        } catch(err) {
            return reject("Audio failed to init!\n" + err);
        }
    });
}

// Creating dictionary of arrays for the categories
function categories(){
    return new Promise(async(resolve,reject) => {
        try {
            // category of all by definition contains all of the audio
            gd.categoryDict["all"] = Object.keys(gd.audioDict);     // adding all the files to category "all"

            // Creating data structures that will be filled in
            let categoryIdMap = {};
            let audioIdMap = {};
            let audioCategoryPairs = [];
            
            // Getting all of the categories from SQL
            let queryStr = `SELECT category_id, category_name FROM categories;`;
            let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
            for (const result of results) {
                categoryIdMap[result['category_id']] = result['category_name'];
                gd.categoryList.push(result['category_name']);
            }

            // Getting all of the audio from SQL
            queryStr = `SELECT audio_id, audio_name FROM audio;`;
            results = await hf.asyncQuery(gd.sqlconnection, queryStr);
            for (const result of results) {
                audioIdMap[result['audio_id']] = result['audio_name'];
            }

            // Getting all of the audio_category pairs from SQL
            queryStr = `SELECT audio_id, category_id FROM audio_category;`;
            results = await hf.asyncQuery(gd.sqlconnection, queryStr);
            for (const result of results) {
                audioCategoryPairs.push([audioIdMap[result['audio_id']], categoryIdMap[result['category_id']]]);
            }

            // Package the audio category pairs into a dictionary
            for (const audioCategory of audioCategoryPairs) {
                let audio = audioCategory[0];
                let category = audioCategory[1];
                hf.updateCategoryDict(gd.categoryDict, category, audio);
            }
            
            // Return promise
            return resolve("Categories inited!");
        } catch (err) {
            console.log("hello i am here!");
            return reject("Categories failed to init!\n" + err);
        }
    });
}

// Storing the commands in a collection
function commands(){
    return new Promise(async(resolve,reject) => {
        try {
            // Loop over the commands
            gd.client.commands = new Discord.Collection();
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`./commands/${file}`);
                gd.client.commands.set(command.name, command);
            }

            // Return promise
            return resolve("Commands inited!");
        } catch (err) {
            return reject("Commands failed to init!\n"  + err);
        }
    });
}

module.exports = {
    directories,
    audio,
    categories,
    commands
}