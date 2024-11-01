import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import fs from "fs";
import path from "path";
import * as tracksService from "../services/tracksService";
import { getTrackMetaData, normalizeAudio } from "../utils/utils";
import config from "../config/config";

const getTracksQuerySchema = z.object({
  name: z.string().optional(),
  include_deleted: z.coerce.boolean().optional().default(false),
});

export const getTracks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = getTracksQuerySchema.safeParse(req.query);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      } else {
        res.status(400).json(result.error.issues);
        return;
      }
    }
    const { name, include_deleted } = result.data;
    const tracks = await tracksService.getTracks({ name: name, include_deleted: include_deleted });
    res.status(200).json(tracks);
    return;
  } catch (error) {
    next(error);
  }
};

export const getTrackById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const track = await tracksService.getTrackById(req.params.id);
    if (!track) {
      res.status(404).json({ error: "Track not found" });
      return;
    }
    res.status(200).json(track);
    return;
  } catch (error) {
    next(error);
  }
};

export const getTrackDownloadById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const track = await tracksService.getTrackById(req.params.id);
    if (!track) {
      res.status(404).json({ error: "Track not found" });
      return;
    }
    const file = await tracksService.getTrackFile(track);
    if (!file) {
      res.status(404).json({ error: "Track file not found" });
      return;
    }
    res.setHeader("Content-Disposition", `attachment; filename="${track.name}.mp3"`);
    file
      .createReadStream()
      .on("error", (err: any) => {
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

export const getTrackStreamById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const track = await tracksService.getTrackById(req.params.id);
    if (!track) {
      res.status(404).json({ error: "Track not found" });
      return;
    }
    const file = await tracksService.getTrackFile(track);
    if (!file) {
      res.status(404).json({ error: "Track file not found" });
      return;
    }

    // Get file metadata to determine size
    const [metadata] = await file.getMetadata();
    if (metadata.size === undefined) {
      throw new Error("Track fileSize is undefined");
    }
    const fileSize = typeof metadata.size === "string" ? parseInt(metadata.size) : metadata.size;

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

export const patchTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const track = await tracksService.getTrackById(req.params.id);
    if (!track) {
      res.status(404).json({ error: "Track not found" });
      return;
    }

    if (!req.user?.id) {
      res.status(500).json({ error: "Unexpected issue" });
      return;
    }

    if (track.user_id !== req.user.id) {
      res.status(403).json({ error: "User does not have permission to change this track." });
      return;
    }

    const result = patchTrackBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      } else {
        res.status(400).json(result.error.issues);
        return;
      }
    }

    const nameLookupResult = await tracksService.getTracks({ name: result.data.name });
    if (nameLookupResult.length !== 0) {
      res.status(400).json({ error: "Track name is already taken" });
      return;
    }

    const updatedTrack = await tracksService.patchTrack(req.params.id, result.data.name);
    res.status(200).json(updatedTrack);
  } catch (error) {
    next(error);
  }
};

const postTrackBodySchema = z.object({
  name: config.trackNameValidation,
});

export const postTrack = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  let normalizedPath;
  try {
    const result = postTrackBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      } else {
        res.status(400).json(result.error.issues);
        return;
      }
    }

    if (!file) {
      res.status(400).json({ error: "File is required" });
      return;
    }
    const parsedPath = path.parse(file.path);

    if (!config.supportedTrackExtensions.includes(parsedPath.ext)) {
      res.status(400).json({
        error: `Invalid file extension '${parsedPath.ext}'. Supported extensions: ${config.supportedTrackExtensions}`,
      });
      return;
    }

    let metadata;
    try {
      metadata = await getTrackMetaData(file.path);
      if (metadata.format.format_name !== "mp3") {
        res.status(400).json({ error: "Invalid file format, must be mp3" });
        return;
      }
      if (!metadata.format.duration) {
        res.status(400).json({ error: `Track duration failed to be determined` });
        return;
      }
      if (metadata.format.duration > config.maxTrackDuration) {
        res.status(400).json({ error: `Track duration exceeds limit of ${config.maxTrackDuration} seconds` });
        return;
      }
    } catch (error) {
      res
        .status(400)
        .json({ error: "Unsupported or corrupt file was received. Failed to parse track metadata from file." });
      return;
    }

    const nameLookupResult = await tracksService.getTracks({ name: result.data.name });
    if (nameLookupResult.length !== 0) {
      res.status(400).json({ error: "Track name is already taken" });
      return;
    }

    if (!req.user?.id) {
      res.status(500).json({ error: "Unexpected issue" });
      return;
    }

    try {
      normalizedPath = `${parsedPath.dir}/${parsedPath.name}-normalized${parsedPath.ext}`;
      await normalizeAudio(file.path, normalizedPath, metadata.format.duration);
    } catch (error) {
      console.error("Failed to normalize track:", error);
      res.status(500).json({ error: "Failed to normalize track" });
      return;
    }

    const track = await tracksService.postTrack(
      normalizedPath,
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
      if (normalizedPath) await fs.unlinkSync(normalizedPath);
    } catch (error) {
      console.error(`Failed to delete files during track post clean up`, error);
    }
  }
};

export const deleteTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const track = await tracksService.getTrackById(req.params.id);
    if (!track) {
      res.status(404).json({ error: "Track not found" });
      return;
    }

    if (!req.user?.id) {
      res.status(500).json({ error: "Unexpected issue" });
      return;
    }

    if (track.user_id !== req.user.id) {
      res.status(403).json({ error: "User does not have permission to delete this track." });
      return;
    }

    const updatedTrack = await tracksService.deleteTrack(req.params.id);
    res.status(200).json(updatedTrack);
  } catch (error) {
    next(error);
  }
};

const restoreTrackBodySchema = z.object({
  name: config.trackNameValidation.optional(),
});

export const restoreTrack = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = restoreTrackBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        res.status(400).json({ error: result.error.issues[0].message });
        return;
      } else {
        res.status(400).json(result.error.issues);
        return;
      }
    }
    const { name } = result.data;

    const track = await tracksService.getTrackById(req.params.id);
    if (!track) {
      res.status(404).json({ error: "Track not found" });
      return;
    }

    if (track.deleted_at === null) {
      res.status(400).json({ error: "Track is not deleted, so it cannot be restored." });
      return;
    }

    const tracksWithSameName = await tracksService.getTracks({ name: name ?? track.name });
    if (tracksWithSameName.length !== 0) {
      res.status(400).json({ error: "Track name is already taken." });
      return;
    }

    if (!req.user?.id) {
      res.status(500).json({ error: "Unexpected issue" });
      return;
    }

    if (track.user_id !== req.user.id) {
      res.status(403).json({ error: "User does not have permission to restore this track." });
      return;
    }

    if (name) {
      await tracksService.patchTrack(track.id, name);
    }

    const updatedTrack = await tracksService.restoreTrack(track.id);
    res.status(200).json(updatedTrack);
  } catch (error) {
    next(error);
  }
};

export default {
  getTracks,
  getTrackById,
  getTrackDownloadById,
  getTrackStreamById,
  patchTrack,
  postTrack,
  deleteTrack,
  restoreTrack,
};
