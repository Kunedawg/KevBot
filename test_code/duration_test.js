const {getAudioDurationInSeconds} = require('get-audio-duration');
 
// From a local path...
getAudioDurationInSeconds('./4d3d.mp3').then((duration) => {
  console.log(duration);
});
 
// From a readable stream...
 
// const fs = require('fs');
// const stream = fs.createReadStream('audio.flac');
 
// getAudioDurationInSeconds(stream).then((duration) => {
//   console.log(duration);
// });