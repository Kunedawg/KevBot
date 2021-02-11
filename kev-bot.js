// imports
const config = require('./config.json');
const gd = require('./globaldata.js');
const init = require('./init.js');
const event = require('./eventhandlers.js');
const {oncePerHour} = require("./functions/oncePerHour.js")

// Get command line arguments
gd.env = process.argv[2];             // environment
var downloadFlag = process.argv[3];     // download flag

// Determine some key variables based on the run environment
switch(gd.env) {
    case 'deploy':
        var downloadAudio = true;       // always download
        var token = config.deployToken;
        var prefix = config.deployPrefix;
        break;
    case 'test':
        var downloadAudio = (downloadFlag === 'dl');
        var token = config.testToken;
        var prefix = config.testPrefix;
        break;
    default:
        console.error("Not a valid command line arg");
        process.exit(1);    // end program
}

// Initialization
async function initialize(){
    console.log(await init.directories());
    console.log(await init.audio(downloadAudio));
    console.log(await init.categories());
    console.log(await init.commands());
    await gd.client.login(token);
}
initialize().catch((err) => {
    console.error(err);
    console.error("Initialization failed! Exiting program!");
    process.exit(1);    // end program 
});

// Events
try {
    gd.client.once('ready', event.onReady);
    gd.client.on('voiceStateUpdate', (a,b) => {event.onVoiceStateUpdate(a,b)});
    gd.client.on('message', (message) => {event.onMessage(message,prefix)});
    setInterval(oncePerHour, 1000*60*60);  // once per hour updates
} catch(err) {
    console.error(err);
}