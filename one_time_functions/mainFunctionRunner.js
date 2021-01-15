const { initAudioTable } = require('./initAudioTable.js');
const { sqlGoogleAudioTableCheck } = require('./sqlGoogleAudioTableCheck.js');

async function asyncFunction() {
    await initAudioTable();
    await sqlGoogleAudioTableCheck();    
}

asyncFunction();