// imports
const gd = require('../globaldata.js');
const { Message } = require('discord.js');
const hf = require('../helperfcns.js');
const {updateUserNames} = require('./updateUserNames.js')

// For logging calls of pr!
function oncePerDay() {
    return new Promise(async(resolve,reject) => {
        try {
            updateUserNames();
        } catch (err) {
            return reject(err);
        }
        return resolve();
    });
}

module.exports = {
    oncePerDay
};