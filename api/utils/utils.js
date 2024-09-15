const ffmpeg = require("fluent-ffmpeg");

// exports.isValidMp3 = async (filePath) => {
//   try {
//     const metadata = await new Promise((resolve, reject) => {
//       ffmpeg.ffprobe(filePath, (err, metadata) => {
//         if (err) {
//           return reject(err);
//         }
//         resolve(metadata);
//       });
//     });

//     return metadata.format.format_name === "mp3";
//   } catch (err) {
//     return false;
//   }
// };

// exports.getAudioDuration = async (filePath) => {
//   try {
//     const metadata = await new Promise((resolve, reject) => {
//       ffmpeg.ffprobe(filePath, (err, metadata) => {
//         if (err) {
//           return reject(err);
//         }
//         resolve(metadata);
//       });
//     });

//     // Return the duration of the audio file
//     return metadata.format.duration;
//   } catch (err) {
//     // Handle any error that occurred during ffprobe
//     throw new Error("Error retrieving audio duration: " + err.message);
//   }
// };

exports.getTrackMetaData = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata);
    });
  });
};

/**
 * normalizes mp3 files
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {number} duration
 */
exports.normalizeAudio = (inputPath, outputPath, duration = 3.1) => {
  // inputPath does not need an extension, but it needs to be a valid audio file
  // outputPath needs a valid extension (.mp3, .wav, etc.)
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioFilters(
        duration > 3.0
          ? `loudnorm=I=-16:TP=-1.5:LRA=11`
          : `apad,atrim=0:3,loudnorm=I=-16:TP=-1.5:LRA=11,atrim=0:${duration}`
      )
      .on("error", (err) => {
        return reject(err);
      })
      .on("end", () => {
        return resolve("Normalizing finished!");
      })
      .save(outputPath);
  });
};
