var gd = require("../globaldata.js");
const hf = require("../helperfcns.js");
const { Message } = require("discord.js");

module.exports = {
  name: "list",
  description: "List all commands of the given category or list all categories.",
  usage:
    "list!all, list!cats, list!categories, list!arnold, list!emptycats, list!allcats list!mostplayed <num_to_list>",
  /**
   * @param {Object} methodargs
   * @param {Message} methodargs.message
   * @param {Array.<string>} methodargs.args
   */
  execute({ message, args }) {
    return new Promise(async (resolve, reject) => {
      // FUNCTION: Defines a function that splits an array into equal chunks based on the given size
      function chunk(array, size) {
        const chunkedArray = [];
        let index = 0;
        while (index < array.length) {
          chunkedArray.push(array.slice(index, size + index));
          index += size;
        }
        return chunkedArray;
      }

      // FUNCTION: Sort lists of strings
      function sortAlphaAndIntoColumns(listArr) {
        // Sort the list (alphabetically)
        listArr.sort();

        // Finding the largest number of chars in a string of the list Array and then pad list with spaces
        let maxNumOfChars = listArr.reduce((a, b) => Math.max(a, b.length), 0);
        if (maxNumOfChars === 0) {
          return reject("Couldn't get largest number of characters");
        }
        listArr = listArr.map((str) => str + " ".repeat(maxNumOfChars - str.length + 2));

        // Split the list array into 4 arrays of roughly equal size (last array will be shorter potentially)
        let numCols = 4;
        const numRows = Math.ceil(listArr.length / numCols);
        colArr = chunk(listArr, numRows);

        // Loop over the rows and concat the columns together
        let response = "";
        for (let row = 0; row < numRows; row++) {
          response += colArr[0]?.[row] || "";
          response += colArr[1]?.[row] || "";
          response += colArr[2]?.[row] || "";
          response += (colArr[3]?.[row] || "") + "\n";
        }
        return response;
      }

      // FUNCTION: Formats the most played list
      function formatTwoColumnList(nameList, supplementalDataList) {
        // Finding the largest number of chars in a string of the list Array and then pad list with spaces
        let maxNumOfChars = nameList.reduce((a, b) => Math.max(a, b.length), 0);
        if (maxNumOfChars === 0) {
          return reject("Couldn't get largest number of characters");
        }
        if (nameList.length !== supplementalDataList.length) {
          return reject("nameList and supplementalDataList do not match");
        }

        // Package data into single string
        let responseStr = "";
        for (let i in nameList) {
          responseStr +=
            nameList[i] + " ".repeat(maxNumOfChars - nameList[i].length + 2) + supplementalDataList[i] + "\n";
        }
        return responseStr;
      }

      try {
        // Inputs
        let category = args?.[0] || "all";
        const listLength = args?.[1];
        let discordId = message?.author?.id;

        // Get the lists of data that should be listed and perform some checks
        let lists = await hf.getList(category, discordId, listLength);
        if ((!lists?.audioNameList && !lists?.categoryNameList) || (lists?.audioNameList && lists?.categoryNameList)) {
          return reject({
            userMess: "Something went wrong! Talk to Kevin.",
            err: "audioNameList and categoryNameList are both undefined or both defined",
          });
        }
        if (
          (lists?.audioNameList && lists?.audioNameList?.length === 0) ||
          (lists?.categoryNameList && lists?.categoryNameList?.length === 0)
        ) {
          return resolve({ userMess: "There is nothing to list!" });
        }
        // Format data based on the returned arrays
        let responseStr = "";
        if (lists?.supplementalDataList) {
          if (lists?.headers) {
            if (lists?.audioNameList) {
              lists.audioNameList.unshift(lists.headers[0]);
            }
            if (lists?.categoryNameList) {
              lists.categoryNameList.unshift(lists.headers[0]);
            }
            lists.supplementalDataList.unshift(lists.headers[1]);
          }
          responseStr = formatTwoColumnList(
            lists?.audioNameList || lists?.categoryNameList,
            lists?.supplementalDataList
          );
        } else {
          responseStr = sortAlphaAndIntoColumns(lists?.audioNameList || lists.categoryNameList);
        }

        return resolve({ userMess: responseStr, wrapChar: "```" });
      } catch (err) {
        reject(err);
      }
    });
  },
};
