// imports
const config = require('./config.json');
const gd = require('./globaldata.js');
const init = require('./init.js');
const event = require('./eventhandlers.js');

// Get command line arguments
gd.setEnv(process.argv[2]);             // environment
var downloadFlag = process.argv[3];     // download flag

// Determine some key variables based on the run environment
switch(gd.getEnv()) {
    case 'deploy':
        var downloadAudio = true;       // always download
        var token = config.deployToken;
        var prefix = config.deployPrefix;
        var loginMessage = 'kev-bot is ready and logged in!';
        break;
    case 'test':
        var downloadAudio = (downloadFlag === 'dl');
        var token = config.testToken;
        var prefix = config.testPrefix;
        var loginMessage = 'kev-bot-test is ready and logged in!';
        break;
    default:
        console.error("Not a valid command line arg");
        process.exit(1);    // end program
}

// Initialization
try {
    (async function initialize() {
        console.log(await init.Audio(downloadAudio));
        console.log(await init.Categories());;
        console.log(await init.Commands());;
        await gd.getClient().login(token);
    })();
} catch(err) {
    console.error(err);
    console.error("Initialization failed! Exiting program!");
    process.exit(1);    // end program
}

// Events
try {
    gd.getClient().once('ready', () => {event.onReady(loginMessage)});
    gd.getClient().on('voiceStateUpdate', (a,b) => {event.onVoiceStateUpdate(a,b)});
    gd.getClient().on('message', (message) => {event.onMessage(message,prefix)});
} catch(err) {
    console.error(err);
}