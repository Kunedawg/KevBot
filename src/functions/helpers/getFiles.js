const { Bucket } = require("@google-cloud/storage");

/**
 * Gets files from a google cloud bucket
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

module.exports = { getFiles };
