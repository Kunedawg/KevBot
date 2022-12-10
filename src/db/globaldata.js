const mysql = require("mysql");
const path = require("path");
const { Storage } = require("@google-cloud/storage");

// Google cloud credentials from the .env file / heroku credentials
const gc = new Storage({
  projectId: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS).project_id,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS),
});
const audioBucket = gc.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

// sql connection
const sqlconnection = mysql.createPool({
  connectionLimit: 10,
  host: process.env.SQL_DB_HOST,
  user: process.env.SQL_DB_USER,
  password: process.env.SQL_DB_PASSWORD,
  database: process.env.SQL_DB_DATABASE,
  multipleStatements: true,
  dateStrings: true,
});

// Data structures for use throughout code
var audioDict = {}; // Audio dictionary, just maps names to filepaths. filepath = audioDict[name]
var categoryDict = {}; // category dictionary, maps category names to sets of audio [name1, name2, name3, ...] = categoryDict[category_name]
var categoryList = []; // Just a simple list of categories
var mostPlayedList = []; // Most played list [{audio,playCount},{audio,playCount},..] (sorted by playCount)
var uploadsByDiscordId = {}; // List of uploads done by each discord ID
var recentlyPlayedList = []; // List of recently played audio [{audio,datetime},{audio,datetime},..] (sorted by datetime)
var recentlyUploadedList = []; // List of the recently uploaded audio [{audio,datetime},{audio,datetime},..] (sorted by datetime)

// paths
const audioPath = path.join(__dirname, "./temp/audio/");
const tempDataPath = path.join(__dirname, "./temp/data/");

// Protected named
const protectedCategoryNames = [
  "categories",
  "cats",
  "emptycats",
  "all",
  "mostplayed",
  "myuploads",
  "playhistory",
  "uploadhistory",
];

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
};
