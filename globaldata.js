// imports
const Discord = require('discord.js');
var mysql = require('mysql');
const path = require('path');
const {Storage} = require('@google-cloud/storage');
require('dotenv').config()

// Google cloud credentials from the .env file / heroku credentials
const gc = new Storage({
    projectId: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS).project_id,
    credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
});
const audioBucket = gc.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

// sql connection
const sqlconnection = mysql.createPool({
    connectionLimit     : 10,
    host                : process.env.SQL_DB_HOST,
    user                : process.env.SQL_DB_USER,
    password            : process.env.SQL_DB_PASSWORD,
    database            : process.env.SQL_DB_DATABASE,
    multipleStatements  : true
});

// discord client
let intents = new Discord.Intents(Discord.Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');
const client = new Discord.Client({ ws: {intents: intents} });

// Data stuctures for use throughout code
var audioDict = {};             // Audio dictionary, just maps names to filepaths. filepath = audioDict[name]
var categoryDict = {};          // catergory dictionary, maps category names to sets of audio [name1, name2, name3, ...] = categoryDict[category_name]
var categoryList = [];          // Just a simple list of categories
var mostPlayedList = [];        // Most played list [{audio,playCount},{audio,playCount},..] (sorted by playCount)
var uploadsByDiscordId = {};    // List of uploads done by each discord ID

// paths
const audioPath = path.join(__dirname, './audio/');
const tempDataPath = path.join(__dirname, './temp_data/');

module.exports = {
    audioBucket,
    sqlconnection,
    client,
    audioDict,
    categoryDict,
    categoryList,
    mostPlayedList,
    uploadsByDiscordId,
    audioPath,
    tempDataPath
};