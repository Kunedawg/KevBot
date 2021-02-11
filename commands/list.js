// imports
var gd = require('../globaldata.js');
const hf = require('../helperfcns.js');
// const {parseAudioLogSQL} = require('../functions/parseAudioLogSQL.js')

module.exports = {
    name: 'list',
    description: 'List all commands of the given category or list all categories.',
    usage: 'list!all, list!cats, list!categories, list!arnold, list!emptycats, list!allcats list!mostplayed <num_to_list>',
    /**
     * @param {Object} methodargs
     * @param {Array.<string>} methodargs.args
     */
    execute({args}) {
        return new Promise(async (resolve, reject) => {
            try {
                // Validate inputs
                var category = args?.[0];
                const mostPlayedListLength = args?.[1] || 25;   // list either 25 or the user requested amount

                // Determine the array that should be listed
                if (["categories", "cats"].includes(category)) {
                    var listArr = Object.keys(gd.categoryDict);
                } else if (["all", undefined].includes(category)) {
                    var listArr = Object.keys(gd.audioDict);
                } else if (["allcats"].includes(category)) {
                    var listArr = Array.from(gd.categoryList); // Want to make a copy of the array, that's what Array.from is for
                } else if (["emptycats"].includes(category)) {
                    var listArr = Array.from(gd.categoryList);
                    for (let cat of Object.keys(gd.categoryDict)) {
                        hf.removeElementFromArray(listArr,cat); // only none empty categories should be in the category dictionary
                    }
                } else if (["mostplayed"].includes(category)) {
                    var listArr = gd.mostPlayedList;
                } else if (category in gd.categoryDict) {
                    var listArr = Array.from(gd.categoryDict[category]);
                } else if (gd.categoryList.includes(category)) {
                    return reject({userMess: `"${category}" is an empty category, nothing to list!`});
                } else {
                    return reject({userMess: `"${category}" is not a valid argument for the list command!`})
                }

                // Defines a function that splits an array into equal chunks based on the given size
                function chunk(array, size) {
                    const chunkedArray = [];
                    let index = 0;
                    while (index < array.length) {
                        chunkedArray.push(array.slice(index, size + index));
                        index += size;
                    }
                    return chunkedArray;
                }
                
                // Sort lists of strings 
                function sortAndFormatStringList(listArr) {
                    // Sort the list (alphabetically)
                    listArr.sort();

                    // Finding the largest number of chars in a string of the list Array and then pad list with spaces
                    let maxNumOfChars = listArr.reduce((a,b) => Math.max(a,b.length),0);
                    if (maxNumOfChars === 0) {return reject("Couldn't get largest number of characters");}   
                    listArr = listArr.map(str => (str + ' '.repeat(maxNumOfChars - str.length + 2)));
                    
                    // Split the list array into 4 arrays of roughly equal size (last array will be shorter potentially)
                    let numCols = 4;
                    const numRows = Math.ceil(listArr.length / numCols);
                    colArr = chunk(listArr, numRows);

                    // Loop over the rows and concat the columns together
                    let response = '';
                    for (let row = 0; row < numRows; row++) {
                        response += (colArr[0]?.[row] || "");
                        response += (colArr[1]?.[row] || "");
                        response += (colArr[2]?.[row] || "");
                        response += (colArr[3]?.[row] || "") + "\n";
                    }
                    return response;
                }

                // Formats the most played list
                function formatMostPlayedList(gd_mostPlayedList) {
                    let mostPlayedList = [...gd_mostPlayedList]; // makes a copy

                    // Only use the first 10 elements
                    if (mostPlayedList.length > mostPlayedListLength) {mostPlayedList.length = mostPlayedListLength;}

                    // Add table heades to list
                    mostPlayedList.unshift({audio : "audio_name", playCount : "play_count"});

                    // Finding the largest number of chars in a string of the list Array and then pad list with spaces
                    let maxNumOfChars = mostPlayedList.reduce((a,b) => Math.max(a,b.audio.length),0);
                    if (maxNumOfChars === 0) {return reject("Couldn't get largest number of characters");}
                    mostPlayedList = mostPlayedList.map(obj => ({
                        audio : obj.audio + ' '.repeat(maxNumOfChars - obj.audio.length + 2),
                        playCount : obj.playCount
                    }));
                    
                    // Loop over the list and make the rows of the response
                    let response = '';
                    for (let obj of mostPlayedList) {
                        response += obj.audio + obj.playCount + "\n";
                    }

                    return response;
                }

                // Determines the response based on the category that was called
                if (["mostplayed"].includes(category)) {
                    var response = formatMostPlayedList(listArr);
                } else {
                    var response = sortAndFormatStringList(listArr);
                }
            } catch (err) {
                reject(err);
            }

            // return promise
            return resolve({ userMess: response, wrapChar: "```" });
        });
    }
};