const { Message } = require('discord.js');

module.exports = {
    name: 'upload',
    description: 'Upload an mp3 file to the bot. Make sure to attach the mp3 file to the message. 15 sec max.',
    usage: 'upload!',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async(resolve,reject) => {
            // Imports
            const {Storage, Bucket} = require('@google-cloud/storage');
            var ffmpeg = require('fluent-ffmpeg');
            var fs = require('fs-extra');
            const config = require('../config.json');
            const path = require('path');
            const fetch = require('node-fetch');
            const {getAudioDurationInSeconds} = require('get-audio-duration');
            const gd = require('../globaldata.js');
            const hf = require('../helperfcns.js');
            
            // Check if a file was actually attached
            if (!(message.attachments.size !== 0)) {
                console.log("Made it here!");
                return reject({
                    userResponse: "You did not attach a file ya dingus!",
                    err: 'upload: No file attached.'
                });
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
            if (commandName.length > (MAX_COMMAND_NAME_LENGTH))
                return reject({userResponse: `The file name can only be ${MAX_COMMAND_NAME_LENGTH} characters long, not including the .mp3.`});

            // check that the filename contains on lowercase letters  
            if (!hf.kevbotStringOkay(commandName))
                return reject({userResponse: `The file name can only contain lower case letters and numbers.`});

            // Check that the file is actually an mp3
            if (fileExtension !== "mp3") 
                return reject({userResponse: "The file you are trying to upload is not an mp3 file! You can only upload mp3 files."});

            // Try to make a connection to the cloud server bucket
            try {
                const gc = new Storage({
                    projectId: config.cloudCredentials.project_id,
                    credentials: config.cloudCredentials
                });
                var audioBucket = gc.bucket(config.bucketName);
            } catch (err) {
                return reject({
                    userResponse: "Failed to connect to cloud server. Try again later.",
                    err: err
                });
            }

            // Getting list of files from cloud server
            try {
                var cloudFiles = await hf.getFiles(audioBucket);
            } catch (err) {
                return reject({
                    userResponse: "Failed to retrieve files from the cloud server! Talk to Kevin.",
                    err: err
                });                
            }

            // Check if the file is already on the server
            if (cloudFiles.includes(fileName))
                return reject({userResponse: `"${fileName}" is already on the cloud server, please pick a new name.`});

            // Download file from discord to a local file path
            try {
                var response = await fetch(discordFileUrl);
                await response.body.pipe(fs.createWriteStream(downloadFilePath));
            } catch (err) {
                return reject({
                    userResponse: "The file failed to download from discord! Try again later.",
                    err: err
                });
            }

            // Check the duration of file does not exceed the max duration
            const MAX_DURATION = 15.0; // sec
            const duration = await getAudioDurationInSeconds(downloadFilePath);
            if(duration > MAX_DURATION)
                return reject({userResponse: `${fileName} has a duration of ${duration} sec. Max duration is ${MAX_DURATION} sec. Talk to Kevin for exceptions to this rule`});

            // async function for normalizing the audio
            function normalizeAudio(inputPath,outputPath) {
                return new Promise((resolve,reject) => {
                    ffmpeg(inputPath)
                        .audioFilters('loudnorm=I=-16:LRA=11:TP=-1.5')
                        .on('error', function(err) {
                            return reject(err);
                        })
                        .on('end', function() {
                            return resolve('Normalizing finished!');
                        })
                        .save(outputPath);
                });
            }

            // Call the normalize audio function
            try {
                await normalizeAudio(downloadFilePath,filePath);
            } catch (err) {
                return reject({
                    userResponse: "The file failed to normalize! Talk to Kevin.",
                    err: err
                });
            } 

            // Upload file to google cloud server
            try {
                await audioBucket.upload(filePath, { gzip: true});
            } catch (err) {
                return reject({
                    userResponse: "The file failed to upload to the cloud server. Try again later.",
                    err: err
                });
            }
            message.author.send(`"${fileName}" has been uploaded to kev-bot!`);
            
            // Add to audio dictionary and audio folder
            try {
                gd.pushAudioDict(commandName,filePath);
            } catch (err) {
                return reject({
                    userResponse: "Audio dictionary failed to update. Talk to kevin.",
                    err: err
                });                
            }

            // Clean up the temporary data
            try {
                await fs.emptyDir(gd.tempDataPath);
            } catch (err) {
                return reject({
                    userResponse: "Cleanup failed. You're file should be uploaded though.",
                    err: err
                });                
            }

            // return resolve promise
            return resolve("The file was uploaded!");
        });
    }
};