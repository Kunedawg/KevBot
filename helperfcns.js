// imports
const {Storage, Bucket} = require('@google-cloud/storage');
var ffmpeg = require('fluent-ffmpeg');

module.exports = {
    breakUpResponse(response, splitChar = '!@#', wrapChar = '```') {
        const MAX_NO_WRAP_LENGTH = 2000 - 2 * wrapChar.length; // Largest message discord can send

        // Need to make sure every element in the array does not exceed MAX_NO_WRAP_LENGTH
        // Perform splits on the splitChar, then newline, then string length if needed
        subResponseArray = [];
        for (let splitElement of response.split(splitChar)) {
            if (splitElement.length <= MAX_NO_WRAP_LENGTH) {
                subResponseArray.push(splitElement);
            } else {
                for (let newLineElement of splitElement.split('\n')) {
                    if ((newLineElement + '\n').length <= MAX_NO_WRAP_LENGTH) {
                        if (newLineElement.length > 0) subResponseArray.push(newLineElement + '\n');
                    } else {
                        const regex = new RegExp(`(.{${MAX_NO_WRAP_LENGTH}})`);
                        for (let element of newLineElement.split(regex).filter(O=>O)) {
                            subResponseArray.push(element);
                        }
                    }
                }
            }
        }

        // Merge strings back together into chuncks that do not exceed MAX_NO_WRAP_LENGTH
        let strBuild = '';
        let responseArray = [];
        for (let subResponse of subResponseArray) {
            if ((strBuild + subResponse).length > MAX_NO_WRAP_LENGTH) {
                responseArray.push(wrapChar + strBuild + wrapChar);
                strBuild = subResponse;
            } else {
                strBuild += subResponse;
            }
        }
        if (strBuild.length > 0 && strBuild.length <= MAX_NO_WRAP_LENGTH) responseArray.push(wrapChar + strBuild + wrapChar);

        return responseArray;
    },
    /**
     * @param {Bucket} bucket
     */
    getFiles(bucket) {
        return new Promise((resolve,reject) => {
            bucket.getFiles((err,files)=>{
                if (err) return reject(err);
                let fileNameArray = [];
                for (var file of files) fileNameArray.push(file.name);
                return resolve(fileNameArray);
            });
        });
    },
    kevbotStringOkay(string){
        const lowercaseOnly = /^[a-z\d]+$/g;
        return lowercaseOnly.test(string);
    },
    normalizeAudio(inputPath,outputPath) {
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
}