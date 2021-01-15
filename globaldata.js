// imports
const Discord = require('discord.js');
var mysql = require('mysql');
const path = require('path');

// current environment
var env = '';

// Audio dictionary, just maps names to filepaths. filepath = audioDict[name]
var audioDict = {};

// catergory dictionary, maps category names to sets of audio [name1, name2, name3, ...] = categoryDict[category_name]
var categoryDict = {};
var categoryList = [];

// discord client
var client = new Discord.Client();

// sql connection
const sqlconnection = mysql.createPool({
    connectionLimit     : 10,
    host                : '***REMOVED***',
    user                : '***REMOVED***',
    password            : '***REMOVED***',
    database            : '***REMOVED***',
    multipleStatements  : true
});

// paths
const audioPath = path.join(__dirname, './audio/');
var tempDataPath = path.join(__dirname, './temp_data/');

module.exports = {
    env,
    audioDict,
    categoryDict,
    client,
    sqlconnection,
    audioPath,
    tempDataPath,
    categoryList
};