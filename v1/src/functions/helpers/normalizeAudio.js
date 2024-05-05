const ffmpeg = require("fluent-ffmpeg");

/**
 * normalizes mp3 files
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {number} duration
 */
function normalizeAudio(inputPath, outputPath, duration = 3.1) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioFilters(
        duration > 3.0
          ? `loudnorm=I=-16:TP=-1.5:LRA=11`
          : `apad,atrim=0:3,loudnorm=I=-16:TP=-1.5:LRA=11,atrim=0:${duration}`
      )
      .on("error", function (err) {
        return reject(err);
      })
      .on("end", function () {
        return resolve("Normalizing finished!");
      })
      .save(outputPath);
  });
}

module.exports = { normalizeAudio };
