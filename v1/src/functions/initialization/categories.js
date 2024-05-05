const { audioDict, sqlDatabase, categoryList, categoryDict } = require("../../data");
const { updateCategoryDict } = require("../updaters/updateCategoryDict");
const { updateMostPlayed } = require("../updaters/updateMostPlayed.js");
const { updateUploadsByUsers } = require("../updaters/updateUploadsByUsers.js");
const { updateRecentlyPlayed } = require("../updaters/updateRecentlyPlayed.js");
const { updateRecentlyUploaded } = require("../updaters/updateRecentlyUploaded.js");

/**
 * Creates a dictionary of arrays for the categories
 */
async function categories() {
  try {
    console.log("Categories initializing...");

    // category of all by definition contains all of the audio
    categoryDict["all"] = Object.keys(audioDict);

    // Getting all of the categories from SQL
    let categoryIdMap = {};
    let results = await sqlDatabase.asyncQuery(`SELECT category_id, category_name FROM categories;`);
    for (const result of results) {
      categoryIdMap[result["category_id"]] = result["category_name"];
      categoryList.push(result["category_name"]);
    }

    // Getting all of the audio from SQL
    let audioIdMap = {};
    results = await sqlDatabase.asyncQuery(`SELECT audio_id, audio_name FROM audio;`);
    for (const result of results) {
      audioIdMap[result["audio_id"]] = result["audio_name"];
    }

    // Getting all of the audio_category pairs from SQL
    let audioCategoryPairs = [];
    results = await sqlDatabase.asyncQuery(`SELECT audio_id, category_id FROM audio_category;`);
    for (const result of results) {
      audioCategoryPairs.push([audioIdMap[result["audio_id"]], categoryIdMap[result["category_id"]]]);
    }

    // Package the audio category pairs into a dictionary
    for (const audioCategory of audioCategoryPairs) {
      let audio = audioCategory[0];
      let category = audioCategory[1];
      updateCategoryDict(categoryDict, category, audio);
    }

    await updateMostPlayed();
    await updateUploadsByUsers();
    await updateRecentlyPlayed();
    await updateRecentlyUploaded();

    console.log("Categories initializing...done!");
  } catch (err) {
    console.error("Categories initializing...failed!");
    throw err;
  }
}

module.exports = { categories };
