const fs = require("fs-extra");

/**
 * turns piping into an async operation
 * @param {fs.ReadStream} reader
 * @param {fs.WriteStream} writer
 */
function asyncPipe(reader, writer) {
  return new Promise((resolve, reject) => {
    reader.pipe(writer);
    reader.on("end", () => {
      return resolve("pipe done!");
    });
    setTimeout(() => {
      return reject("pipe timed out after 20 sec!");
    }, 20000);
  });
}

module.exports = { asyncPipe };
