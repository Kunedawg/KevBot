// imports
const fs = require('fs');
const path = require('path');

// Setup file paths
const schema_path_raw = path.join(__dirname, './schema_raw.sql');
const schema_path_raw_no_definers = path.join(__dirname, './schema_no_definers.sql');

// Create write stream and line reader
var writeStream = fs.createWriteStream(schema_path_raw_no_definers);
var lineReader = require('readline').createInterface({input: require('fs').createReadStream(schema_path_raw)});

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