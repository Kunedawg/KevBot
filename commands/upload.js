// Imports
const {Storage} = require('@google-cloud/storage');
var fs = require('fs-extra');
const config = require('../config.json');
const path = require('path');
const fetch = require('node-fetch');
const {getAudioDurationInSeconds} = require('get-audio-duration');
const gd = require('../globaldata.js');
const hf = require('../helperfcns.js');
const { Message } = require('discord.js');

module.exports = {
    name: 'upload',
    description: 'Upload an mp3 file to the bot. Make sure to attach the mp3 file to the message. 15 sec max. 15 char file name max.',
    usage: 'upload!',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     */
    execute({message}) {
        return new Promise(async(resolve,reject) => {  
            // Check if a file was actually attached
            if (!(message.attachments.size !== 0)) {
                return reject({userMess: "You did not attach a file ya dingus!"});
            }

            // Determining the url, filename, and extension of the attached file
            const messageAttachment = message.attachments.values().next().value;
            const discordFileUrl = messageAttachment.url;
            const fileName = messageAttachment.name;
            const commandName = fileName.split('.')[0];
            const fileExtension = fileName.split('.')[1];
            const filePath = path.join(gd.audioPath, fileName);
            const downloadFilePath = path.join(gd.tempDataPath, 'downloaded_file.mp3');

            // Check that the file name is not too long
            const MAX_COMMAND_NAME_LENGTH = 15;
            if (commandName.length > (MAX_COMMAND_NAME_LENGTH)){
                return reject({userMess: `The file name can only be ${MAX_COMMAND_NAME_LENGTH} characters long, not including the .mp3.`});
            }

            // check that the filename format
            if (!hf.kevbotStringOkay(commandName)){
                return reject({userMess: `The file name can only contain lower case letters and numbers.`});
            }

            // Check that the file is actually an mp3
            if (fileExtension !== "mp3"){
                return reject({userMess: "The file you are trying to upload is not an mp3 file! You can only upload mp3 files."});
            }

            // Try to make a connection to the cloud server bucket
            try {
                const gc = new Storage({
                    projectId: config.cloudCredentials.project_id,
                    credentials: config.cloudCredentials
                });
                var audioBucket = gc.bucket(config.bucketName);
            } catch (err) {
                return reject({
                    userMess: "Failed to connect to cloud server. Try again later.",
                    err: err
                });
            }

            // Getting list of files from cloud server
            try {
                var cloudFiles = await hf.getFiles(audioBucket);
            } catch (err) {
                return reject({
                    userMess: "Failed to retrieve files from the cloud server! Talk to Kevin.",
                    err: err
                });                
            }

            // Check if the file is already on the server
            if (cloudFiles.includes(fileName))
                return reject({userMess: `"${fileName}" is already on the cloud server, please pick a new name.`});

            // Download file from discord to a local file path
            try {
                var response = await fetch(discordFileUrl);
                var readStream = response.body;
                var writeSteam = fs.createWriteStream(downloadFilePath);
                await hf.asyncPipe(readStream,writeSteam);
                //await readStream.pipe(fs.createWriteStream(downloadFilePath));
            } catch (err) {
                return reject({
                    userMess: "The file failed to download from discord! Try again later.",
                    err: err
                });
            }

            // Check the duration of file does not exceed the max duration
            try {
                const MAX_DURATION = 15.0; // sec
                const duration = await getAudioDurationInSeconds(downloadFilePath);
                if(duration > MAX_DURATION) {
                    return reject({
                        userMess: `${fileName} has a duration of ${duration} sec. Max duration is ${MAX_DURATION} sec. Talk to Kevin for exceptions to this rule`
                    });
                }
            } catch(err) {
                return reject({
                    userMess: "Failed to get audio duration! Try again later.",
                    err: err
                }); 
            }

            // Call the normalize audio function
            try {
                await hf.normalizeAudio(downloadFilePath,filePath);
            } catch (err) {
                return reject({
                    userMess: "The file failed to normalize! Talk to Kevin.",
                    err: err
                });
            } 

            // Upload file to google cloud server
            try {
                await audioBucket.upload(filePath, { gzip: true});
            } catch (err) {
                return reject({
                    userMess: "The file failed to upload to the cloud server. Try again later.",
                    err: err
                });
            }
            message.author.send(`"${fileName}" has been uploaded to kev-bot!`);
            
            // Add to audio dictionary and audio folder
            try {
                gd.pushAudioDict(commandName,filePath);
            } catch (err) {
                return reject({
                    userMess: "Audio dictionary failed to update. Talk to kevin.",
                    err: err
                });                
            }

            // Clean up the temporary data
            try {
                await fs.emptyDir(gd.tempDataPath);
            } catch (err) {
                return reject({
                    userMess: "Cleanup failed. You're file should be uploaded though.",
                    err: err
                });                
            }

            // return resolve promise
            return resolve();
        });
    }
};