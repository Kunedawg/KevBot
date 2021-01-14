// imports
var gd = require('../globaldata.js');
const hf = require('../helperfcns.js');

module.exports = {
    name: 'list',
    description: 'List all commands of the given category or list all categories.',
    usage: 'list!all, list!cats, list!categories, list!arnold, list!emptycats, list!allcats',
    /**
     * @param {Object} methodargs
     * @param {Array.<string>} methodargs.args
     */
    execute({args}) {
        return new Promise(async (resolve, reject) => {
            // Validate inputs
            var category = args?.[0];

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
            } else if (category in gd.categoryDict) {
                var listArr = Array.from(gd.categoryDict[category]);
            } else if (gd.categoryList.includes(category)) {
                return reject({userMess: `"${category}" is an empty category, nothing to list!`});
            } else {
                return reject({ userMess: `"${category}" is not a valid argument for the list command!` })
            }

            // Sort the list
            listArr.sort();

            // Finding the largest number of chars in a string of the list Array
            var largetNumOfChars = listArr.reduce((a,b) => {return Math.max(a,b.length);},0);
            if (largetNumOfChars === 0) {return reject("Couldn't get largest number of characters");}   

            // Loop over the list array and pad every string with spaces to make each string equal length
            for (let idx in listArr) {listArr[idx] += ' '.repeat(largetNumOfChars - listArr[idx].length + 2);}

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
                response += (colArr[3]?.[row] || "") + "\n";  // last row might be undefined
            }           
            
            // return promise
            return resolve({ userMess: response, wrapChar: "```" });
        });
    }
};