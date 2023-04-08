const {
  categoryList,
  categoryDict,
  protectedCategoryNames,
  audioDict,
  mostPlayedList,
  uploadsByDiscordId,
  recentlyPlayedList,
  recentlyUploadedList,
} = require("../../data");
const DEFAULT_LIST_LENGTH = 25;
const { getDateTimeString } = require("./getDateTimeString");

/**
 * Given the category this returns the appropriate data.
 * There are specialized categories, like myuploads or mostplayed, so special treatment is done.
 * @param {string} category
 * @param {number} discordId
 * @param {number} listLen
 *
 */
function getList(category, discordId, listLen) {
  return new Promise(async (resolve, reject) => {
    try {
      let audioNameList; // list of audio files.
      let categoryNameList; //  list of category names.
      let supplementalDataList; // for some categories this returns play count and dates
      let headers; // names of headers for tables that get displayed
      const listLength = listLen || DEFAULT_LIST_LENGTH;
      switch (category) {
        case "categories":
        case "cats":
          categoryNameList = Array.from(categoryList); // Array.from makes a copy
          break;
        case "emptycats":
          categoryNameList = Array.from(categoryList);
          for (let cat of Object.keys(categoryDict)) {
            spliceElement(categoryNameList, cat); // removes the non empty categories from the full list. non empty cats are in the dict
          }
          for (let cat of protectedCategoryNames) {
            spliceElement(categoryNameList, cat); // removes the protected names form the empty category
          }
          break;
        case "all":
          audioNameList = Object.keys(audioDict);
          break;
        case "mostplayed":
          audioNameList = [];
          supplementalDataList = [];
          let mostPlayed = [...mostPlayedList];
          if (listLength < mostPlayed.length && listLength > 0) {
            mostPlayed.length = listLength;
          }
          for (let obj of mostPlayed) {
            audioNameList.push(obj.audio);
            supplementalDataList.push(obj.playCount);
          }
          headers = ["audio_name", "play_count"];
          break;
        case "myuploads":
          if (!discordId) {
            return reject({ userMess: `Failed to retrieve discord id!` });
          }
          if (!uploadsByDiscordId[discordId]) {
            return resolve({ userMess: "You have not uploaded any files!" });
          }
          audioNameList = uploadsByDiscordId[discordId];
          break;
        case "playhistory":
          audioNameList = [];
          supplementalDataList = [];
          let recentlyPlayed = [...recentlyPlayedList];
          if (listLength < recentlyPlayed.length && listLength > 0) {
            recentlyPlayed.length = listLength;
          }
          for (let obj of recentlyPlayed) {
            audioNameList.push(obj.audio);
            supplementalDataList.push(getDateTimeString(obj.datetime));
          }
          headers = ["audio_name", "date_time"];
          break;
        case "uploadhistory":
          audioNameList = [];
          supplementalDataList = [];
          let recentlyUploaded = [...recentlyUploadedList];
          if (listLength < recentlyUploaded.length && listLength > 0) {
            recentlyUploaded.length = listLength;
          }
          for (let obj of recentlyUploaded) {
            audioNameList.push(obj.audio);
            supplementalDataList.push(getDateTimeString(obj.datetime));
          }
          headers = ["audio_name", "date_time"];
          break;
        default:
          if (category in categoryDict) {
            audioNameList = Array.from(categoryDict[category]);
          } else if (categoryList.includes(category)) {
            return reject({
              userMess: `"${category}" is an empty category, nothing to list/play!`,
            });
          } else {
            return reject({
              userMess: `"${category}" is not a valid argument for the list/pr command!`,
            });
          }
      }
      return resolve({
        audioNameList,
        categoryNameList,
        supplementalDataList,
        headers,
      });
    } catch (err) {
      return reject(err);
    }
  });
}

module.exports = { getList };
