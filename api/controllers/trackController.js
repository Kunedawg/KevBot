const trackService = require("../services/trackService");
const { z } = require("zod");

// Define the Zod schema for query parameters
const getTracksQuerySchema = z.object({
  name: z.string().optional(),
});

exports.getTracks = async (req, res, next) => {
  try {
    const result = getTracksQuerySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json(result.error.issues);
    }
    const { name } = result.data;
    if (name) {
      const track = await trackService.getTrackByName(name);
      return res.status(200).json(track);
    } else {
      const tracks = await trackService.getAllTracks();
      return res.status(200).json(tracks);
    }
  } catch (error) {
    next(error);
  }
};

exports.getTrackById = async (req, res, next) => {
  try {
    const track = await trackService.getTrackById(req.params.id);
    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }
    return res.status(200).json(track);
  } catch (error) {
    next(error);
  }
};

exports.getTrackDownloadById = async (req, res, next) => {
  try {
    const track = await trackService.getTrackById(req.params.id);
    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }
    const file = await trackService.getTrackFile(track);
    if (!file) {
      return res.status(404).json({ error: "Track file not found" });
    }
    res.setHeader("Content-Disposition", `attachment; filename="${track.audio_name}.mp3"`);
    file
      .createReadStream()
      .on("error", (err) => {
        console.error("Error downloading the file:", err);
        res.status(500).send("Error downloading the file");
      })
      .pipe(res)
      .on("finish", () => {
        console.log("File successfully sent");
      });
  } catch (error) {
    next(error);
  }
};

exports.getTrackStreamById = async (req, res, next) => {
  try {
    const track = await trackService.getTrackById(req.params.id);
    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }
    const file = await trackService.getTrackFile(track);
    if (!file) {
      return res.status(404).json({ error: "Track file not found" });
    }

    // Get file metadata to determine size
    const [metadata] = await file.getMetadata();
    const fileSize = metadata.size;

    // Check for 'Range' header to serve byte-range requests
    const range = req.headers.range;
    console.log(range);
    if (!range) {
      // No range provided, send the entire file (default behavior)
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", fileSize);
      res.setHeader("Content-Disposition", `inline; filename="${track.audio_name}.mp3"`);
      file.createReadStream().pipe(res);
    } else {
      // Parse the Range header (e.g., "bytes=12345-")
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Check if requested range is valid
      if (start >= fileSize || end >= fileSize) {
        res.status(416).send(`Requested range not satisfiable ${start}-${end}`);
        return;
      }

      const chunkSize = end - start + 1;

      // Set appropriate headers for partial content
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Length", chunkSize);
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Disposition", `inline; filename="${track.audio_name}.mp3"`);
      res.status(206); // HTTP status 206 for Partial Content

      // Stream the requested range of bytes from Google Cloud Storage
      file.createReadStream({ start, end }).pipe(res);
    }
  } catch (err) {
    next(err);
  }
};

// exports.createTrack = async (req, res, next) => {
//   try {
//     const track = await trackService.createTrack(req.body);
//     res.status(201).json(track);
//   } catch (error) {
//     next(error);
//   }
// };
