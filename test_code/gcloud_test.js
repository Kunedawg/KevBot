const {Storage} = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
// const { config } = require('process');
const config = require('../config.json');

const gc = new Storage({
    // keyFilename: path.join(__dirname, '***REMOVED***-c11be83afb83.json'),
    projectId: '***REMOVED***',
    credentials: config.cloud_credentials
});

// to test if everything is working
// gc.getBuckets().then(x => console.log(x));


const bucketName = '***REMOVED***';
const audio_bucket = gc.bucket(config.bucket_name);

const filename = path.join(__dirname, 'awwhell.mp3');

console.log('filename: ', filename);


// fs.createReadStream()
//     .pipe(
//         audio_bucket.file(filename).createWriteStream({
//             resumable: false,
//             gzip: true
//         })
//     )
//     .on("finish", console.log("uploaded : ", filename));


async function uploadFile() {
    // Uploads a local file to the bucket
    await audio_bucket.upload(filename, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        // By setting the option `destination`, you can change the name of the
        // object you are uploading to a bucket.
        metadata: {
        // Enable long-lived HTTP caching headers
        // Use only if the contents of the file will never change
        // (If the contents will change, use cacheControl: 'no-cache')
        cacheControl: 'public, max-age=31536000',
        },
    });
    console.log(`${filename} uploaded to ${bucketName}.`); 
}


async function getFiles() {
    // modify this code to return a promise that we can await on
    audio_bucket.getFiles((err,files)=>{
        if (!err) {
            console.log('-------------------------------------------------------------------------------');
            for (var file of files){
                console.log(file.name);
            }
        }
    });
}

// uploadFile().catch(console.error);
getFiles().catch(console.error);