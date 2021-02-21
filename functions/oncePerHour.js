// imports
const gd = require('../globaldata.js');
const { Message } = require('discord.js');
const hf = require('../helperfcns.js');
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