// imports
const {Storage, Bucket} = require('@google-cloud/storage');
var ffmpeg = require('fluent-ffmpeg');
const gd = require('./globaldata.js');

// function to break responses into 2000 char length (max discord allows)
function breakUpResponse(response, splitChar = '!@#', wrapChar = '```') {
    const MAX_NO_WRAP_LENGTH = 2000 - 2 * wrapChar.length; // Largest message discord can send

    // Need to make sure every element in the array does not exceed MAX_NO_WRAP_LENGTH
    // Perform splits on the splitChar, then newline, then string length if needed
    subResponseArray = [];
    for (let splitElement of response.split(splitChar)) {
        if (splitElement.length <= MAX_NO_WRAP_LENGTH) {
            subResponseArray.push(splitElement);
        } else {
            for (let newLineElement of splitElement.split('\n')) {
                if ((newLineElement + '\n').length <= MAX_NO_WRAP_LENGTH) {
                    if (newLineElement.length > 0) subResponseArray.push(newLineElement + '\n');
                } else {
                    const regex = new RegExp(`(.{${MAX_NO_WRAP_LENGTH}})`);
                    for (let element of newLineElement.split(regex).filter(O=>O)) {
                        subResponseArray.push(element);
                    }
                }
            }
        }
    }

    // Merge strings back together into chuncks that do not exceed MAX_NO_WRAP_LENGTH
    let strBuild = '';
    let responseArray = [];
    for (let subResponse of subResponseArray) {
        if ((strBuild + subResponse).length > MAX_NO_WRAP_LENGTH) {
            responseArray.push(`${wrapChar}\n${strBuild}${wrapChar}`);
            strBuild = subResponse;
        } else {
            strBuild += subResponse;
        }
    }
    if (strBuild.length > 0 && strBuild.length <= MAX_NO_WRAP_LENGTH) responseArray.push(`${wrapChar}\n${strBuild}${wrapChar}`);

    return responseArray;
}

// Gets files from a google cloud bucket
/**
 * @param {Bucket} bucket
 */
function getFiles(bucket) {
    return new Promise((resolve,reject) => {
        bucket.getFiles((err,files)=>{
            if (err) return reject(err);
            let fileNameArray = [];
            for (var file of files) fileNameArray.push(file.name);
            return resolve(fileNameArray);
        });
    });
}

// Tests if a string is lowercase and numbers only (for validating file names)
function kevbotStringOkay(string){
    const regex = /^[a-z\d]+$/g;
    return regex.test(string);
}

// normalizes mp3 files
function normalizeAudio(inputPath, outputPath, duration = 3.1) {
    return new Promise((resolve,reject) => {
        ffmpeg(inputPath)
            .audioFilters((duration > 3.0) ? `loudnorm=I=-16:TP=-1.5:LRA=11` : `apad,atrim=0:3,loudnorm=I=-16:TP=-1.5:LRA=11,atrim=0:${duration}`)
            .on('error', function(err) {
                return reject(err);
            })
            .on('end', function() {
                return resolve('Normalizing finished!');
            })
            .save(outputPath);
    });
}

// turns piping into an async operation
function asyncPipe(reader,writer) {
    return new Promise((resolve,reject) => {
        reader.pipe(writer);
        reader.on('end', () => {return resolve("pipe done!")});
        setTimeout(()=>{return reject("pipe timed out after 20 sec!")}, 20000);
    });        
}

// turns a query into an async operation
function asyncQuery(connection,queryStr) {
    return new Promise((resolve,reject) => {
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
        if ( array[index] === element) {
            var savedIndex = index;
            break;
        }
    }
    if (savedIndex) { array.splice(savedIndex,1); } 
}

// Removes the element from the array
function updateCategoryDict(categoryDict, category, audio, type) {
    switch(type) {
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
function printProgress(progress){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(String(progress));
}

// List function. This function should return an array of sorts. Mostplayed is an exception, it is a 2d array.
function getList(category, discordId, optionalArg) {
    return new Promise(async (resolve, reject) => {
        let listLength;
        switch (category){
            case "categories":
            case "cats":
                return resolve(Object.keys(gd.categoryDict));
            case undefined:
            case "all":
                return resolve(Object.keys(gd.audioDict));
            case "allcats":
                return resolve(Array.from(gd.categoryList)); // Array.from makes a copy
            case "emptycats":
                let listArr = Array.from(gd.categoryList);
                for (let cat of Object.keys(gd.categoryDict)) {
                    removeElementFromArray(listArr,cat); // only none empty categories should be in the category dictionary
                }
                return resolve(listArr);
            case "mostplayed":
                let mostPlayed = [...gd.mostPlayedList]
                listLength = optionalArg || gd.DEFAULT_LIST_LENGTH;
                if (listLength < mostPlayed.length && listLength > 0) {
                    mostPlayed.length = listLength;
                }
                return resolve(mostPlayed);
            case "myuploads":    
                if (!discordId) { return reject({ userMess: `Failed to retrieve discord id!`}); }   
                if (!gd.uploadsByDiscordId[discordId]) {return resolve({ userMess: "You have not uploaded any files!"})};
                return resolve(gd.uploadsByDiscordId[discordId]);
            case "recentlyplayed":
            case "history":
                let recentlyPlayed = [...gd.recentlyPlayedList]
                listLength = optionalArg || gd.DEFAULT_LIST_LENGTH;
                if (listLength < recentlyPlayed.length && listLength > 0) {
                    recentlyPlayed.length = listLength;
                }
                return resolve(recentlyPlayed);
            default:
                if (category in gd.categoryDict) {
                    return resolve(Array.from(gd.categoryDict[category]));
                } else if (gd.categoryList.includes(category)) {
                    return reject({userMess: `"${category}" is an empty category, nothing to list/play!`});
                } else {
                    return reject({userMess: `"${category}" is not a valid argument for the list/pr command!`})
                }
        }
    });
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
    getList
}