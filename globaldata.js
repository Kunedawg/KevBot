// imports
const Discord = require('discord.js');

// Audio dictionary
function setAudioDict(dict) { audioDict = dict; }
function getAudioDict() { return audioDict;}

var audioDict = {};
const client = new Discord.Client();
var categoryDict = {}
const sqlconnection = mysql.createPool({
    connectionLimit     : 10,
    host                : '***REMOVED***',
    user                : '***REMOVED***',
    password            : '***REMOVED***',
    database            : '***REMOVED***',
    multipleStatements  : true
});

function setAudioDict(dict) { audioDict = dict; }
function getAudioDict() { return audioDict;}


module.exports = {audio_dict, client, category_dict, sqlconnection};