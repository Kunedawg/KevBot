const { Message } = require('discord.js');

module.exports = {
    name: 'upload',
    description: 'Upload an mp3 file to the bot. Make sure to attach the mp3 file to the message.',
    usage: 'upload!',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async(resolve,reject) => {
            // Importing all the required modules
            const {Storage} = require('@google-cloud/storage');
            const kev_bot = require('../kev-bot');
            var ffmpeg = require('fluent-ffmpeg');
            var fs = require('fs');
            var request = require('request');
            const config = require('../config.json');
            const path = require('path');
            const fetch = require('node-fetch');

            // Defining path to save temporary data to
            var tempDataPath = path.join(__dirname, '../temp_data');
            
            // Check if a file was actually attached
            if (!(message.attachments.size !== 0)) {
                console.log("Made it here!");
                return reject({
                    userResponse: "You did not attach a file ya dingus!",
                    err: 'upload: No file attached.'
                });
            }

            console.log("Made it here!2");

            // Determining the url, filename, and extension of the attached file
            const messageAttachment = message.attachments.values().next().value;
            const discordFileUrl = messageAttachment.url;
            const fileName = messageAttachment.name;
            const fileExtension = fileName.split('.').pop();
            const filePath = path.join(tempDataPath, fileName);

            // Check that the file name meets kevbot requirements

            // Check that the file is actually an mp3
            if (fileExtension !== "mp3") {
                return reject({
                    userResponse: "The file you are trying to upload is not an mp3 file! You can only upload mp3 files.",
                    err: 'file extension is not mp3'
                });
            }

            // Download file from discord to a local file path
            const downloadFilePath = path.join(tempDataPath, 'downloaded_file.mp3');
            try {
                var response = await fetch(discordFileUrl);
                await response.body.pipe(fs.createWriteStream(downloadFilePath));
            } catch (err) {
                return reject({
                    userResponse: "The file failed to download from discord! Try again later.",
                    err: err
                });
            }

            // Check the duration of file
            
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

            // Check if file already exists on the cloud server

            // Upload file to google cloud server
            try {
                const gc = new Storage({
                    projectId: config.cloud_credentials.project_id,
                    credentials: config.cloud_credentials
                });
                const audio_bucket = gc.bucket(config.bucket_name);
                await audio_bucket.upload(filePath, { gzip: true});
            } catch (err) {
                return reject({
                    userResponse: "The file failed to upload to the cloud server. Try again later.",
                    err: err
                });
            }
            message.author.send(`"${fileName}" has been uploaded to kev-bot!`);
            
            // Add to audio dictionary and audio folder

            // clean up the temporary data

            // return resolve promise
            return resolve("The file was uploaded!");
        });
    }
};