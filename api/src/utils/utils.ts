import ffmpeg from "fluent-ffmpeg";

export const getTrackMetaData = (filePath: string): Promise<ffmpeg.FfprobeData> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata);
    });
  });
};

export const normalizeAudio = (inputPath: string, outputPath: string, duration: number = 3.1): Promise<string> => {
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
