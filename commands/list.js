// imports
var gd = require('../globaldata.js');
const hf = require('../helperfcns.js');
const {Message} = require('discord.js');

module.exports = {
    name: 'list',
    description: 'List all commands of the given category or list all categories.',
    usage: 'list!all, list!cats, list!categories, list!arnold, list!emptycats, list!allcats list!mostplayed <num_to_list>',
    /**
     * @param {Object} methodargs
     * @param {Message} methodargs.message
     * @param {Array.<string>} methodargs.args
     */
    execute({message, args}) {
        return new Promise(async (resolve, reject) => {
            try {
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

                // FUNCTION: Formats the most played list
                function formatMostPlayedList(gd_mostPlayedList) {
                    // makes a copy of array
                    let mostPlayedList = [...gd_mostPlayedList]; 

                    // Add table headers to list
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

                // Inputs
                let category = args?.[0];
                const mostPlayedListLength = args?.[1];
                let discordId = message?.author?.id;

                // Determine the array that should be listed
                let listArr = await hf.getList(category, discordId, mostPlayedListLength);

                // Return message if the list is empty
                if (listArr.length === 0) {return resolve({ userMess: "There is nothing to list!"});}

                // Determines the response based on the category that was called
                let response = '';
                switch (category){
                    case "mostplayed":
                        response = formatMostPlayedList(listArr);
                        break;
                    case "recentlyplayed":
                        for (let str of listArr) {
                            response += `${str}\n`;
                        }
                        break;
                    default:
                        response = sortAndFormatStringList(listArr);
                }
                return resolve({ userMess: response, wrapChar: "```" });

            } catch (err) {
                reject(err);
            }
        });
    }
};