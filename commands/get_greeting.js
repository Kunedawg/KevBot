module.exports = {
    name: 'getgreeting',
    description: 'Returns the current greeting you have set.',
    usage: 'getgreeting!',
    execute({message, args, member}) {
        return new Promise((resolve,reject) => {
            // import data from kev-bot.js
            const kevbot = require('../kev-bot.js');

            // Get discord id
            if (member === undefined) {
                var discord_id = message.author.id;
            } else {
                var discord_id = member.user.id;
            }

            // Call get_greeting stored procedure
            let queryStr = `CALL get_greeting('${discord_id}', @greeting); SELECT @greeting;`;
            kevbot.sqlconnection.query(queryStr, (err, results) => {
                if (err) {
                    return reject({
                        userResponse: "Failed to retrieve greeting. Try again later or talk to Kevin.",
                        err: err
                    });
                } else {
                    let greeting = results[1][0]['@greeting'];
                    if (message) {
                        if (greeting !== null) {
                            message.author.send(`Your current greeting is set to "${greeting}"!`);
                            if (!(greeting in kevbot.audio_dict)) message.author.send(`"${greeting}" is not a valid command. Consider changing it.`);
                        } else {
                            message.author.send("You do not have a greeting configured.");
                        }
                    }
                    return resolve(greeting);
                }
            });
        });
    }
};