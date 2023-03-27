const { SqlDatabase } = require("./db/SqlDatabase");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
require("dotenv").config();

// Google Cloud Bucket
const audioBucket = new Storage({
  projectId: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS).project_id,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS),
}).bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

// SQL Database
const sqlDatabase = new SqlDatabase({
  connectionLimit: 10,
  host: process.env.SQL_DB_HOST,
  user: process.env.SQL_DB_USER,
  password: process.env.SQL_DB_PASSWORD,
  database: process.env.SQL_DB_DATABASE,
  multipleStatements: true,
  dateStrings: true,
});

// Data structures for use throughout code
const audioDict = {}; // Audio dictionary, just maps names to filepaths. audioDict[name] -> filepath
const categoryDict = {}; // category dictionary, maps category names to sets of audio categoryDict[category_name] -> [audio1, audio2, audio3, ...]
const categoryList = []; // Just a simple list of categories
var mostPlayedList = []; // Most played list [{audio,playCount},{audio,playCount},..] (sorted by playCount)
var uploadsByDiscordId = {}; // List of uploads done by each discord ID
var recentlyPlayedList = []; // List of recently played audio [{audio,datetime},{audio,datetime},..] (sorted by datetime)
var recentlyUploadedList = []; // List of the recently uploaded audio [{audio,datetime},{audio,datetime},..] (sorted by datetime)

// paths
const tempPath = path.join(__dirname, "./temp/");
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
  sqlDatabase,
  audioDict,
  categoryDict,
  categoryList,
  mostPlayedList,
  uploadsByDiscordId,
  recentlyPlayedList,
  recentlyUploadedList,
  tempPath,
  audioPath,
  tempDataPath,
  protectedCategoryNames,
};
