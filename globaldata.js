// imports
const Discord = require('discord.js');
var mysql = require('mysql');
const path = require('path');

// current environment
var env = '';

// Audio dictionary
var audioDict = {};

// catergory dictionary
var categoryDict = {};

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
const categoriesCsvPath = path.join(__dirname, './data/categories.csv');
var tempDataPath = path.join(__dirname, './temp_data/');

module.exports = {
    env,
    audioDict,
    categoryDict,
    client,
    sqlconnection,
    audioPath,
    categoriesCsvPath,
    tempDataPath
};