const hf = require("./helperfcns.js.js");
const { updateMostPlayed } = require("../updateMostPlayed.js");
const { updateUploadsByUsers } = require("../updateUploadsByUsers.js");
const { updateRecentlyPlayed } = require("../updateRecentlyPlayed.js");
const { updateRecentlyUploaded } = require("../updateRecentlyUploaded.js");

/**
 * Creates a dictionary of arrays for the categories
 */
function categories() {
  return new Promise(async (resolve, reject) => {
    try {
      // Starting message
      console.log("Categories initializing...");

      // category of all by definition contains all of the audio
      gd.categoryDict["all"] = Object.keys(gd.audioDict); // adding all the files to category "all"

      // Creating data structures that will be filled in
      let categoryIdMap = {};
      let audioIdMap = {};
      let audioCategoryPairs = [];

      // Getting all of the categories from SQL
      let queryStr = `SELECT category_id, category_name FROM categories;`;
      let results = await hf.asyncQuery(gd.sqlconnection, queryStr);
      for (const result of results) {
        categoryIdMap[result["category_id"]] = result["category_name"];
        gd.categoryList.push(result["category_name"]);
      }

      // Getting all of the audio from SQL
      queryStr = `SELECT audio_id, audio_name FROM audio;`;
      results = await hf.asyncQuery(gd.sqlconnection, queryStr);
      for (const result of results) {
        audioIdMap[result["audio_id"]] = result["audio_name"];
      }

      // Getting all of the audio_category pairs from SQL
      queryStr = `SELECT audio_id, category_id FROM audio_category;`;
      results = await hf.asyncQuery(gd.sqlconnection, queryStr);
      for (const result of results) {
        audioCategoryPairs.push([audioIdMap[result["audio_id"]], categoryIdMap[result["category_id"]]]);
      }

      // Package the audio category pairs into a dictionary
      for (const audioCategory of audioCategoryPairs) {
        let audio = audioCategory[0];
        let category = audioCategory[1];
        hf.updateCategoryDict(gd.categoryDict, category, audio);
      }

      updateMostPlayed();
      updateUploadsByUsers();
      updateRecentlyPlayed();
      updateRecentlyUploaded();

      // Return promise
      return resolve("Categories initialization done!\n");
    } catch (err) {
      return reject("Categories failed to init!\n" + err);
    }
  });
}

module.exports = { categories };
