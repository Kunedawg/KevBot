// imports
const Discord = require('discord.js');
const mysql = require('mysql');
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
    multipleStatements  : true,
    dateStrings         : true
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
var recentlyPlayedList = [];    // List of recently played audio [{audio,datetime},{audio,datetime},..] (sorted by datetime)
var recentlyUploadedList = [];  // List of the recently uplaoded audio [{audio,datetime},{audio,datetime},..] (sorted by datetime)

// paths
const audioPath = path.join(__dirname, './audio/');
const tempDataPath = path.join(__dirname, './temp_data/');
let avatarPath = path.join(__dirname, './docs/pumping-iron-cropped.png');

// Protected named
let protectedCategoryNames = ["categories", "cats", "emptycats", "all", "mostplayed", "myuploads", "playhistory", "uploadhistory"];

// CONSTANTS
let DEFAULT_LIST_LENGTH = 25;
let MAX_UPLOAD_CLIP_DURATION = 15;      // sec
let MAX_FAREWELL_CLIP_DURATION = 4;    // sec


// Play type enumeration (0: p!, 1 : pr!, 2 : greeting!, 3 : raid!, 4: farewell!)
const PLAY_TYPE = {
    PLAY                : 0,
    PLAY_RANDOM         : 1,
    GREETING            : 2,
    RAID                : 3,
    FAREWELL            : 4,
    CATEGORY_GREETING   : 5
}

// Greeting type
const GREETING_TYPE = {
    FILE        : 0,
    CATEGORY    : 1
}

module.exports = {
    audioBucket,
    sqlconnection,
    client,
    audioDict,
    categoryDict,
    categoryList,
    mostPlayedList,
    uploadsByDiscordId,
    recentlyPlayedList,
    recentlyUploadedList,
    audioPath,
    tempDataPath,
    avatarPath,
    protectedCategoryNames,
    DEFAULT_LIST_LENGTH,
    MAX_UPLOAD_CLIP_DURATION,
    MAX_FAREWELL_CLIP_DURATION,
    PLAY_TYPE,
    GREETING_TYPE
};