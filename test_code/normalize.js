var ffmpeg = require('fluent-ffmpeg');

// normalizes mp3 files
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