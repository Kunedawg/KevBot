// imports
const {parseAudioLogSQL} = require('./parseAudioLogSQL.js')
const {parseAudioSQL} = require('./parseAudioSQL.js')

// For logging calls of pr!
function oncePerHour() {
    return new Promise(async(resolve,reject) => {
        // Update the most played list
        try {
            await parseAudioLogSQL();
            await parseAudioSQL();
        } catch (err) {
            return reject(err);
        }
        return resolve();
    });
}

module.exports = {
    oncePerHour
};