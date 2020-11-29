// imports
const gd = require('./globaldata.js');
var fs = require('fs-extra');
const Discord = require('discord.js');
const config = require('./config.json');
const {Storage} = require('@google-cloud/storage');
const path = require('path');


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
            return reject("Directories failed to init!" + err);
        }
    });
}

// Creating dictionary for command to audio file path. yes -> ./audio/yes.mp3
function audio(download = true){
    return new Promise(async(resolve,reject) => {
        try {
            // download all of the audio stored on the cloud server
            if (download) {
                const gc = new Storage({
                    projectId: config.cloudCredentials.project_id,
                    credentials: config.cloudCredentials
                });
                var audioBucket = gc.bucket(config.bucketName);
                var files = await audioBucket.getFiles();
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

            // Return promise
            return resolve("Audio inited!");
        } catch(err) {
            return reject("Audio failed to init!" + err);
        }
    });
}

// Creating dictionary of arrays for the categories
// catergories.csv has format of audio_file,category1,category2,category3,...
function categories(){
    return new Promise(async(resolve,reject) => {
        try {
            gd.categoryDict["all"] = Object.keys(gd.audioDict);     // adding all the files to category "all"
            var categoryData = fs.readFileSync(gd.categoriesCsvPath,'utf8').split(' ').join(''); // read categories string and remove spaces.
            if (gd.env === 'deploy')  // windows uses \r\n, linux uses \n, apple uses \r
                var categoryRows = categoryData.split("\n"); 
            if (gd.env === 'test')
                var categoryRows = categoryData.split("\r\n"); 
            for (const row of categoryRows) {
                var categories = row.split(",");
                var audioFile = categories.shift();  // first item of row is the audioFile, the rest will be categories
                for (const category of categories) {
                    if (category in gd.categoryDict) {
                        gd.categoryDict[category].push(audioFile);
                    } else {
                        gd.categoryDict[category] = [audioFile];
                    }
                }
            }            
            
            // Return promise
            return resolve("Categories inited!");
        } catch (err) {
            return reject("Categories failed to init!" + err);
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
            return reject("Commands failed to init!" + err);
        }
    });
}

module.exports = {
    directories,
    audio,
    categories,
    commands
}