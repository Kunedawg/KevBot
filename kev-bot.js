// const Discord = require('discord.js');
// const client = new Discord.Client();

// client.login("NzQ0MDMxNDY3OTMxNDM1MTA5.XzdTTQ.jmPutro7dQ2HWT56B7Y6MLD7Sok");

// client.on('ready', ()=>{
//     console.log("The bot is logged in!");
// });

// client.on('message', message => {
//     if(message.author.bot)
//         return;

//     if(message.content.toLowerCase() === 'hello')
//         message.channel.send("Fuck off Evan!")
// });

const Discord = require('discord.js');
//const { prefix, token } = require('./config.json');

const client = new Discord.Client();

client.once('ready', () => {
	console.log('kev-bot is ready and logged in!');
});

client.on('message', message => {
	if (message.content === '!BoNanNo') {
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
    } else if (message.content === '!imback') {
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

client.login(NzQ0MDMxNDY3OTMxNDM1MTA5.XzdTTQ.jmPutro7dQ2HWT56B7Y6MLD7Sok);