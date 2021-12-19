// imports
const { Storage, Bucket } = require("@google-cloud/storage");
var ffmpeg = require("fluent-ffmpeg");
const gd = require("./globaldata.js");

// function to break responses into 2000 char length (max discord allows)
function breakUpResponse(response, splitChar = "!@#", wrapChar = "```") {
  const MAX_NO_WRAP_LENGTH = 2000 - 2 * wrapChar.length; // Largest message discord can send

  // Need to make sure every element in the array does not exceed MAX_NO_WRAP_LENGTH
  // Perform splits on the splitChar, then newline, then string length if needed
  subResponseArray = [];
  for (let splitElement of response.split(splitChar)) {
    if (splitElement.length <= MAX_NO_WRAP_LENGTH) {
      subResponseArray.push(splitElement);
    } else {
      for (let newLineElement of splitElement.split("\n")) {
        if ((newLineElement + "\n").length <= MAX_NO_WRAP_LENGTH) {
          if (newLineElement.length > 0)
            subResponseArray.push(newLineElement + "\n");
        } else {
          const regex = new RegExp(`(.{${MAX_NO_WRAP_LENGTH}})`);
          for (let element of newLineElement.split(regex).filter((O) => O)) {
            subResponseArray.push(element);
          }
        }
      }
    }
  }

  // Merge strings back together into chuncks that do not exceed MAX_NO_WRAP_LENGTH
  let strBuild = "";
  let responseArray = [];
  for (let subResponse of subResponseArray) {
    if ((strBuild + subResponse).length > MAX_NO_WRAP_LENGTH) {
      responseArray.push(`${wrapChar}\n${strBuild}${wrapChar}`);
      strBuild = subResponse;
    } else {
      strBuild += subResponse;
    }
  }
  if (strBuild.length > 0 && strBuild.length <= MAX_NO_WRAP_LENGTH)
    responseArray.push(`${wrapChar}\n${strBuild}${wrapChar}`);

  return responseArray;
}

// Gets files from a google cloud bucket
/**
 * @param {Bucket} bucket
 */
function getFiles(bucket) {
  return new Promise((resolve, reject) => {
    bucket.getFiles((err, files) => {
      if (err) return reject(err);
      let fileNameArray = [];
      for (var file of files) fileNameArray.push(file.name);
      return resolve(fileNameArray);
    });
  });
}

// Tests if a string is lowercase and numbers only (for validating file names)
function kevbotStringOkay(string) {
  const regex = /^[a-z\d]+$/g;
  return regex.test(string);
}

// normalizes mp3 files
function normalizeAudio(inputPath, outputPath, duration = 3.1) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioFilters(
        duration > 3.0
          ? `loudnorm=I=-16:TP=-1.5:LRA=11`
          : `apad,atrim=0:3,loudnorm=I=-16:TP=-1.5:LRA=11,atrim=0:${duration}`
      )
      .on("error", function (err) {
        return reject(err);
      })
      .on("end", function () {
        return resolve("Normalizing finished!");
      })
      .save(outputPath);
  });
}

// turns piping into an async operation
function asyncPipe(reader, writer) {
  return new Promise((resolve, reject) => {
    reader.pipe(writer);
    reader.on("end", () => {
      return resolve("pipe done!");
    });
    setTimeout(() => {
      return reject("pipe timed out after 20 sec!");
    }, 20000);
  });
}

// turns a query into an async operation
function asyncQuery(connection, queryStr) {
  return new Promise((resolve, reject) => {
    connection.query(queryStr, (err, results) => {
      if (err) {
        return reject(`SQL query "${queryStr}" failed!\n` + err);
      } else {
        return resolve(results);
      }
    });
  });
}

// Removes the element from the array
function removeElementFromArray(array, element) {
  for (let index in array) {
    if (array[index] === element) {
      array.splice(index, 1);
      return;
    }
  }
}

// Removes the element from the array
function updateCategoryDict(categoryDict, category, audio, type) {
  switch (type) {
    case "add":
      if (category in categoryDict) {
        categoryDict[category].push(audio);
      } else {
        categoryDict[category] = [audio];
      }
      break;

    case "remove":
      removeElementFromArray(categoryDict[category], audio);
      if (categoryDict[category].length === 0) {
        delete categoryDict[category];
      }
      break;

    default:
      if (category in categoryDict) {
        categoryDict[category].push(audio);
      } else {
        categoryDict[category] = [audio];
      }
  }
}

// For printing in progress information
function printProgress(progress) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(String(progress));
}

// Given the category this returns the appropriate data. There are specialized categories, like myuploads or mostplayed, so special treatment is done.
// audioNameList = list of audio files. 
// categoryNameList = list of category names. 
// supplementalDataList = for some categories this returns play count and dates
// headers = names of headers for tables that get displayed
function getList(category, discordId, listLen) {
  return new Promise(async (resolve, reject) => {
    try {
      let audioNameList;
      let categoryNameList;
      let supplementalDataList;
      let headers;
      const listLength = listLen || gd.DEFAULT_LIST_LENGTH;
      switch (category) {
        case "categories":
        case "cats":
          categoryNameList = Array.from(gd.categoryList); // Array.from makes a copy
          break;
        case "emptycats":
          categoryNameList = Array.from(gd.categoryList);
          for (let cat of Object.keys(gd.categoryDict)) {
            removeElementFromArray(categoryNameList, cat); // removes the non empty categories from the full list. non empty cats are in the dict
          }
          for (let cat of gd.protectedCategoryNames) {
            removeElementFromArray(categoryNameList, cat); // removes the protected names form the empty category
          }
          break;
        case "all":
          audioNameList = Object.keys(gd.audioDict);
          break;
        case "mostplayed":
          audioNameList = [];
          supplementalDataList = [];
          let mostPlayed = [...gd.mostPlayedList];
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
          if (!gd.uploadsByDiscordId[discordId]) {
            return resolve({ userMess: "You have not uploaded any files!" });
          }
          audioNameList = gd.uploadsByDiscordId[discordId];
          break;
        case "playhistory":
          audioNameList = [];
          supplementalDataList = [];
          let recentlyPlayed = [...gd.recentlyPlayedList];
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
          let recentlyUploaded = [...gd.recentlyUploadedList];
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
          if (category in gd.categoryDict) {
            audioNameList = Array.from(gd.categoryDict[category]);
          } else if (gd.categoryList.includes(category)) {
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

// For nice formatting of a date time string
/**
 * @param {Date} date
 */
function getDateTimeString(date) {
  if (date instanceof Date) {
    let year = String(date.getUTCFullYear());
    let day = String(date.getUTCDate());
    let month = String(date.getUTCMonth());
    let hour = String(date.getUTCHours());
    let min = String(date.getUTCMinutes());
    let sec = String(date.getUTCSeconds());
    let pad = (str) => {
      if (str.length === 1) {
        return `0${str}`;
      } else {
        return `${str}`;
      }
    };
    return `${pad(year)}-${pad(month)}-${day} ${pad(hour)}:${pad(min)}:${pad(
      sec
    )} (UTC)`;
  } else if (typeof date === "string") {
    return date + " (UTC)";
  }
}

module.exports = {
  breakUpResponse,
  getFiles,
  kevbotStringOkay,
  normalizeAudio,
  asyncPipe,
  asyncQuery,
  removeElementFromArray,
  updateCategoryDict,
  printProgress,
  getList,
  getDateTimeString,
};
