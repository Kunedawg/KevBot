const Discord = require('discord.js');
const client = new Discord.Client();

client.login("***REMOVED***");

client.on('ready', ()=>{
    console.log("The bot is logged in!");
});

client.on('message', message => {
    if(message.author.bot)
        return;

    if(message.content.toLowerCase() === 'hello')
        message.channel.send("Fuck off Evan!")
});