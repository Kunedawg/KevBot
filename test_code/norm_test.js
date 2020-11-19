const NormalizeVolume = require('normalize-volume');
 
let options = {
   normalize: true, 
   waveform: { width: 1400, height: 225 },
   volume: 1
}
 
NormalizeVolume('C:/maindir/kev-bot/test_code/4d3d.mp3', 'C:/maindir/kev-bot/test_code/4d3d_norm.mp3', options)
.then(result => {
   console.log(result);
})
// .catch(err => {
//    console.log("error occured!");
//    console.log(err);
// })