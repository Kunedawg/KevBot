var ffmpeg = require('fluent-ffmpeg');

// For normalizing audio
ffmpeg('./4d3d.mp3')
    .audioFilters('loudnorm=I=-16:LRA=11:TP=-1.5')
    .on('error', function(err) {
        console.log('An error occurred: ' + err.message);
    })
    .on('end', function() {
        console.log('Processing finished !');
    })
    .save('./4d3d_fluent.mp3');