const { z } = require("zod");
const fs = require("fs");
const path = require("path");
const trackService = require("../services/trackService");
const { getTrackMetaData, normalizeAudio } = require("../utils/utils");
const config = require("../config/config");

const getTracksQuerySchema = z.object({
  name: z.string().optional(),
  include_deleted: z.coerce.boolean().optional().default(false),
});

exports.getTracks = async (req, res, next) => {
  try {
    const result = getTracksQuerySchema.safeParse(req.query);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }
    const { name, include_deleted } = result.data;
    const tracks = await trackService.getTracks({ name: name, include_deleted: include_deleted });
    return res.status(200).json(tracks);
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
    res.setHeader("Content-Disposition", `attachment; filename="${track.name}.mp3"`);
    file
      .createReadStream()
      .on("error", (err) => {
        console.error("Error downloading the file:", err);
        res.status(500).send("Error downloading the file");
      })
      .pipe(res)
      .on("finish", () => {
        // console.log("File successfully sent");
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
    if (!range) {
      // No range provided, send the entire file (default behavior)
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", fileSize);
      res.setHeader("Content-Disposition", `inline; filename="${track.name}.mp3"`);
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
      res.setHeader("Content-Disposition", `inline; filename="${track.name}.mp3"`);
      res.status(206); // HTTP status 206 for Partial Content

      // Stream the requested range of bytes from Google Cloud Storage
      file.createReadStream({ start, end }).pipe(res);
    }
  } catch (err) {
    next(err);
  }
};

const patchTrackBodySchema = z.object({
  name: config.trackNameValidation,
});

exports.patchTrack = async (req, res, next) => {
  try {
    const track = await trackService.getTrackById(req.params.id);
    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }

    if (!req.user?.id) {
      return res.status(500).json({ error: "Unexpected issue" });
    }

    if (track.user_id !== req.user.id) {
      return res.status(403).json({ error: "User does not have permission to change this track." });
    }

    const result = patchTrackBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }

    const nameLookupResult = await trackService.getTracks({ name: result.data.name });
    if (nameLookupResult.length !== 0) {
      return res.status(400).json({ error: "Track name is already taken" });
    }

    const updatedTrack = await trackService.patchTrack(req.params.id, result.data.name);
    res.status(200).json(updatedTrack);
  } catch (error) {
    next(error);
  }
};

const postTrackBodySchema = z.object({
  name: config.trackNameValidation,
});

exports.postTrack = async (req, res, next) => {
  const file = req.file;
  try {
    const result = postTrackBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }

    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }
    file.parsedPath = path.parse(file.path);

    if (!config.supportedTrackExtensions.includes(file.parsedPath.ext)) {
      return res.status(400).json({
        error: `Invalid file extension '${file.parsedPath.ext}'. Supported extensions: ${config.supportedTrackExtensions}`,
      });
    }

    try {
      metadata = await getTrackMetaData(file.path);
      if (metadata.format.format_name !== "mp3") {
        return res.status(400).json({ error: "Invalid file format, must be mp3" });
      }
    } catch (error) {
      return res
        .status(400)
        .json({ error: "Unsupported or corrupt file was received. Failed to parse track metadata from file." });
    }

    if (metadata.format.duration > config.maxTrackDuration) {
      return res.status(400).json({ error: `Track duration exceeds limit of ${config.maxTrackDuration} seconds` });
    }

    const nameLookupResult = await trackService.getTracks({ name: result.data.name });
    if (nameLookupResult.length !== 0) {
      return res.status(400).json({ error: "Track name is already taken" });
    }

    if (!req.user?.id) {
      return res.status(500).json({ error: "Unexpected issue" });
    }

    try {
      file.normalizedPath = `${file.parsedPath.dir}/${file.parsedPath.name}-normalized${file.parsedPath.ext}`;
      await normalizeAudio(file.path, file.normalizedPath, metadata.format.duration);
    } catch (error) {
      console.error("Failed to normalize track:", error);
      return res.status(500).json({ error: "Failed to normalize track" });
    }

    const track = await trackService.postTrack(
      file.normalizedPath,
      result.data.name,
      metadata.format.duration,
      req.user.id
    );

    res.status(201).json(track);
  } catch (error) {
    next(error);
  } finally {
    try {
      if (file?.path) await fs.unlinkSync(file.path);
      if (file?.normalizedPath) await fs.unlinkSync(file.normalizedPath);
    } catch (error) {
      console.error(`Failed to delete files during track post clean up`, error);
    }
  }
};

exports.deleteTrack = async (req, res, next) => {
  try {
    const track = await trackService.getTrackById(req.params.id);
    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }

    if (!req.user?.id) {
      return res.status(500).json({ error: "Unexpected issue" });
    }

    if (track.user_id !== req.user.id) {
      return res.status(403).json({ error: "User does not have permission to delete this track." });
    }

    const updatedTrack = await trackService.deleteTrack(req.params.id);
    res.status(200).json(updatedTrack);
  } catch (error) {
    next(error);
  }
};

const restoreTrackBodySchema = z.object({
  name: config.trackNameValidation.optional(),
});

exports.restoreTrack = async (req, res, next) => {
  try {
    const result = restoreTrackBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }
    const { name } = result.data;

    const track = await trackService.getTrackById(req.params.id);
    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }

    if (track.deleted_at === null) {
      return res.status(400).json({ error: "Track is not deleted, so it cannot be restored." });
    }

    const tracksWithSameName = await trackService.getTracks({ name: name ?? track.name });
    if (tracksWithSameName.length !== 0) {
      return res.status(400).json({ error: "Track name is already taken." });
    }

    if (!req.user?.id) {
      return res.status(500).json({ error: "Unexpected issue" });
    }

    if (track.user_id !== req.user.id) {
      return res.status(403).json({ error: "User does not have permission to restore this track." });
    }

    if (name) {
      await trackService.patchTrack(track.id, name);
    }

    const updatedTrack = await trackService.restoreTrack(track.id);
    res.status(200).json(updatedTrack);
  } catch (error) {
    next(error);
  }
};
