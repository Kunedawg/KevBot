var ffmpeg = require('fluent-ffmpeg');
const {getAudioDurationInSeconds} = require('get-audio-duration');

// // normalizes mp3 files
// function normalizeAudio(inputPath,outputPath) {
//     return new Promise((resolve,reject) => {
//         ffmpeg(inputPath)
//             .audioFilters('loudnorm=I=-16:LRA=11:TP=-1.5')
//             .on('error', function(err) {
//                 return reject(err);
//             })
//             .on('end', function() {
//                 return resolve('Normalizing finished!');
//             })
//             .save(outputPath);
//     });
// }


// // Check the duration of file does not exceed the max duration
// try {
//     const MAX_DURATION = 15.0; // sec
//     var duration = await getAudioDurationInSeconds(downloadFilePath);
//     if(duration > MAX_DURATION) {
//         return reject({
//             userMess: `${fileName} has a duration of ${duration} sec. Max duration is ${MAX_DURATION} sec. Talk to Kevin for exceptions to this rule`
//         });
//     }
// } catch(err) {
//     return reject({
//         userMess: "Failed to get audio duration! Try again later.",
//         err: err
//     }); 
// }





// normalizes mp3 files
function normalizeAudio(inputPath, outputPath, duration = 3.1) {
    return new Promise((resolve,reject) => {
        ffmpeg(inputPath)
            .audioFilters((duration > 3.0) ? `loudnorm=I=-16:TP=-1.5:LRA=11` : `apad,atrim=0:3,loudnorm=I=-16:TP=-1.5:LRA=11,atrim=0:${duration}`)
            .on('error', function(err) {
                return reject(err);
            })
            .on('end', function() {
                return resolve('Normalizing finished!');
            })
            .save(outputPath);
    });
}

async function asyncFunction() {
    var inputFile = process.argv[2];
    var outputFile = inputFile.split(".mp3")[0] + "_norm.mp3"
    var duration = await getAudioDurationInSeconds(inputFile);

    console.log(inputFile);
    console.log(outputFile);
    console.log(`input duration: ${duration}`);

    await normalizeAudio(inputFile, outputFile, duration);

    duration = await getAudioDurationInSeconds(outputFile);
    console.log(`output duration: ${duration}`);
}

asyncFunction();
