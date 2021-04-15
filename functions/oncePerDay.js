// imports
const {updateUserNames} = require('./updateUserNames.js')

// To be called once per day
function oncePerDay() {
    return new Promise(async(resolve,reject) => {
        try {
            await updateUserNames();
        } catch (err) {
            return reject(err);
        }
        return resolve();
    });
}

module.exports = {
    oncePerDay
};