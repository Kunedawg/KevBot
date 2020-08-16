const Discord = require('discord.js');
const client = new Discord.Client();

client.login("NzQ0MDMxNDY3OTMxNDM1MTA5.XzdTTQ.jmPutro7dQ2HWT56B7Y6MLD7Sok");

client.on('ready', ()=>{
    console.log("The bot is logged in!");
});

client.on('message', message => {
    if(message.author.bot)
        return;

    if(message.content.toLowerCase() === 'hello')
        message.channel.send("Fuck off Evan!")
});