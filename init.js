// imports
const gd = require('./globaldata.js');
const fs = require('fs');
const Discord = require('discord.js');
const hf = require('./helperfcns.js');
const config = require('./config.json');
const {Storage, Bucket} = require('@google-cloud/storage');
const path = require('path');
const { getAudioDict } = require('./globaldata.js');

module.exports = {
    // Creating dictionary for command to audio file path. yes -> ./audio/yes.mp3
    Audio(download = true){
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
                    if (f.split(".")[1] === "mp3")
                        gd.pushAudioDict( f.split('.')[0] , path.join(gd.audioPath, f));
                }
    
                // Return promise
                return resolve("Audio inited!");
            } catch(err) {
                return reject("Audio failed to init!" + err);
            }
        });
    },
    // Creating dictionary of arrays for the categories
    // catergories.csv has format of audio_file,category1,category2,category3,...
    Categories() {
        return new Promise(async(resolve,reject) => {
            try {
                gd.pushCategoryDict("all", []); // just an empty array
                var catData = fs.readFileSync(gd.categoriesCsvPath,'utf8').split(' ').join(''); // read categories string and remove spaces.
                if (gd.getEnv() === 'deploy')  // windows uses \r\n, linux uses \n, apple uses \r
                    var catRows = catData.split("\n"); 
                if (gd.getEnv() === 'test')
                    var catRows = catData.split("\r\n"); 
                for (const row of catRows) {
                    var categories = row.split(",");
                    var audioFile = categories.shift();  // first item of row is the audioFile, the rest will be categories
                    for (const category of categories) {
                        let catergoryDict = gd.getCategoryDict();
                        if (category in catergoryDict) {
                            catergoryDict[category].push(audioFile);
                            gd.setCategoryDict(catergoryDict);
                        } else {
                            gd.pushCategoryDict(category, [audioFile]);
                        }
                    }
                }
                
                // Return promise
                return resolve("Categories inited!");
            } catch (err) {
                return reject("Categories failed to init!" + err);
            }
        });
    },
    // Storing the commands in a collection
    Commands(){
        return new Promise(async(resolve,reject) => {
            try {
                // Loop over the commands
                var tempClient = gd.getClient();
                tempClient.commands = new Discord.Collection();
                const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const command = require(`./commands/${file}`);
                    tempClient.commands.set(command.name, command);
                }
                gd.setClient(tempClient);

                // Return promise
                return resolve("Commands inited!");
            } catch (err) {
                return reject("Commands failed to init!" + err);
            }
        });
    }
}