module.exports = {
    name: 'delgreeting',
    description: 'Deletes and removes your greeting.',
    usage: 'delgreeting!',
    args: true,
    execute({message, args}) {
        return new Promise((resolve,reject) => {
            // import data from kev-bot.js
            const kevbot = require('../kev-bot.js');

            // Get discord id
            let discord_id = message.author.id;
            
            // Call get_greeting stored procedure
            let queryStr = `CALL del_greeting('${discord_id}', @message); SELECT @message;`;
            kevbot.sqlconnection.query(queryStr, (err, results) => {
                if (err) {
                    return reject({
                        userResponse: "Failed to delete greeting. Try again later or talk to Kevin.",
                        err: err
                    });
                } else {
                    let ret_message = results[1][0]['@message'];
                    if (ret_message === 'Success') {
                        message.author.send(`Your greeting has been deleted!`);
                        return resolve("Delete greeting succeeded.");
                    } else {
                        return reject({
                            userResponse: "Failed to delete greeting. Try again later or talk to Kevin.",
                            err: ret_message
                        });
                    }
                }
            });
        });
    }
};