// imports
const Discord = require('discord.js');
var mysql = require('mysql');
const path = require('path');

// current environment
var env = '';
function getEnv() {return env;}
function setEnv(e) {env = e;}

// Audio dictionary
var audioDict = {};
function getAudioDict() {return audioDict;}
function setAudioDict(dict) {audioDict = dict;}
function pushAudioDict(key,value){audioDict[key] = value;}

// catergory dictionary
var categoryDict = {};
function getCategoryDict() {return categoryDict;}
function setCategoryDict(dict) {categoryDict = dict;}
function pushCategoryDict(key,value){categoryDict[key] = value;}

// discord client
var client = new Discord.Client();
function getClient() {return client;}
function setClient(cln) {client = cln;}

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
    getEnv,
    setEnv,
    getAudioDict, 
    setAudioDict, 
    pushAudioDict, 
    getCategoryDict, 
    setCategoryDict, 
    pushCategoryDict, 
    getClient, 
    setClient,
    sqlconnection,
    audioPath,
    categoriesCsvPath,
    tempDataPath
};