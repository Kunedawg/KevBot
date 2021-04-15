// imports
const {updateMostPlayed} = require('./updateMostPlayed.js')
const {updateUploadsByUsers} = require('./updateUploadsByUsers.js')

// To be called once per hour
function oncePerHour() {
    return new Promise(async(resolve,reject) => {
        // Update the most played list
        try {
            await updateMostPlayed();
            await updateUploadsByUsers();
        } catch (err) {
            return reject(err);
        }
        return resolve();
    });
}

module.exports = {
    oncePerHour
};