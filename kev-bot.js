const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

const client = new Discord.Client();

client.once('ready', () => {
	console.log('kev-bot is ready and logged in!');
});

client.on('message', message => {
	if (message.content === 'k!BoNanNo') {
        var VC = message.member.voice.channel;
        // console.log(VC);
        if (!VC)
           return message.reply("MESSAGE IF NOT IN A VOICE CHANNEL")
        VC.join()
        .then(connection => {
            const dispatcher = connection.play('./audio/bonanno.mp3');
            dispatcher.on("finish", end => {VC.leave()});
        })
        .catch(console.error);
    } else if (message.content === 'k!imback') {
        var VC = message.member.voice.channel;
        // console.log(VC);
        if (!VC)
           return message.reply("MESSAGE IF NOT IN A VOICE CHANNEL")
        VC.join()
        .then(connection => {
            const dispatcher = connection.play('./audio/trex.mp3');
            dispatcher.on("finish", end => {VC.leave()});
        })
        .catch(console.error);
    }
});

client.login(token);