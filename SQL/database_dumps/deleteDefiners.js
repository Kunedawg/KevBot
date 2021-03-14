// imports
const fs = require('fs');
const path = require('path');

// Setup file paths
const schema_path_raw = path.join(__dirname, './schema_raw.sql');
const schema_path_no_definers = path.join(__dirname, './schema_no_definers.sql');
const data_path_raw = path.join(__dirname, './data_raw.sql');
const data_path__no_definers = path.join(__dirname, './data_no_definers.sql');

// Create write stream and line reader
var lineReaderSchema = require('readline').createInterface({input: require('fs').createReadStream(schema_path_raw)});
var writeStreamSchema = fs.createWriteStream(schema_path_no_definers);
var lineReaderData = require('readline').createInterface({input: require('fs').createReadStream(data_path_raw)});
var writeStreamData = fs.createWriteStream(data_path__no_definers);

// Write line to no_definers file with DEFINER removed
lineReaderSchema.on('line', function (line) {
    if (line.includes("DEFINER")) {
        line = line.replace(/(DEFINER=`.*`@`%` )/g, "");
    }
    writeStreamSchema.write(line + "\n", 'utf8');
});

// Close write steam on line reader finish
lineReaderSchema.on('close', (input) => {
    writeStreamSchema.end();
});

// Write line to no_definers file with DEFINER removed
lineReaderData.on('line', function (line) {
    if (line.includes("DEFINER")) {
        line = line.replace(/(DEFINER=`.*`@`%` )/g, "");
    }
    writeStreamData.write(line + "\n", 'utf8');
});

// Close write steam on line reader finish
lineReaderData.on('close', (input) => {
    writeStreamData.end();
});