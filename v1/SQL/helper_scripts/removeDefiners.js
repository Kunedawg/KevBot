// imports
const fs = require('fs');
const path = require('path');

// Setup file paths
const inputFilePath = path.join('./', process.argv[2]);
const outputFilePath = path.join('./', process.argv[2].split(".sql")[0]+"_definers_removed.sql");

// Create write stream and line reader
var lineReader = require('readline').createInterface({input: require('fs').createReadStream(inputFilePath)});
var writeStream = fs.createWriteStream(outputFilePath);

// Write line to no_definers file with DEFINER removed
lineReader.on('line', function (line) {
    if (line.includes("DEFINER")) {
        line = line.replace(/(DEFINER=`.*`@`%` )/g, "");
    }
    writeStream.write(line + "\n", 'utf8');
});

// Close write steam on line reader finish
lineReader.on('close', (input) => {
    writeStream.end();
});