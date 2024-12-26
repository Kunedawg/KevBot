import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { getTrackMetaData, normalizeAudio } from "../utils/utils";
import { i32IdSchema } from "../schemas/sharedSchemas";
import { StatusCodes } from "http-status-codes";
import * as Boom from "@hapi/boom";
import { getAuthenticatedUser } from "../utils/getAuthenticatedUser";
import { Config } from "../config/config";
import { TracksService } from "../services/tracksService";
import { tracksSchemasFactory } from "../schemas/tracksSchemas";

export function tracksControllerFactory(config: Config, tracksService: TracksService) {
  const tracksSchemas = tracksSchemasFactory(config);

  const getTracks = async (req: Request, res: Response) => {
    const { name, include_deleted } = tracksSchemas.getTracksQuerySchema.parse(req.query);
    const tracks = await tracksService.getTracks({ name: name, include_deleted: include_deleted });
    res.status(StatusCodes.OK).json(tracks);
  };

  const getTrackById = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const track = await tracksService.getTrackById(id);
    res.status(StatusCodes.OK).json(track);
  };

  const getTrackDownloadById = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const track = await tracksService.getTrackById(id);
    const file = await tracksService.getTrackFile(track);
    res.setHeader("Content-Disposition", `attachment; filename="${track.name}.mp3"`);
    file
      .createReadStream()
      .on("error", () => {
        throw Boom.internal("Error downloading the file");
      })
      .pipe(res);
  };

  const getTrackStreamById = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const track = await tracksService.getTrackById(id);
    const file = await tracksService.getTrackFile(track);

    // Get file metadata to determine size
    const [metadata] = await file.getMetadata();
    if (metadata.size === undefined) {
      throw Boom.internal("Track fileSize is undefined");
    }
    const fileSize = Number(metadata.size);

    // Check for 'Range' header to serve byte-range requests
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `inline; filename="${track.name}.mp3"`);
    const range = req.headers.range;
    if (!range) {
      res.setHeader("Content-Length", fileSize);
      file.createReadStream().pipe(res);
    } else {
      // Parse the Range header (e.g., "bytes=12345-")
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      if (start >= fileSize || end >= fileSize) {
        throw Boom.rangeNotSatisfiable(`Requested range not satisfiable ${start}-${end}`);
      }
      const chunkSize = end - start + 1;

      // Set appropriate headers for partial content
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Length", chunkSize);
      res.status(StatusCodes.PARTIAL_CONTENT);
      file.createReadStream({ start, end }).pipe(res);
    }
  };

  const patchTrack = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = i32IdSchema.parse(req.params);
    const { name } = tracksSchemas.patchTrackBodySchema.parse(req.body);
    const user = getAuthenticatedUser(req);
    const updatedTrack = await tracksService.patchTrack(id, name, user.id);
    res.status(StatusCodes.OK).json(updatedTrack);
  };

  const postTrack = async (req: Request, res: Response) => {
    const file = req.file;
    let normalizedPath: string | undefined;
    try {
      const { name } = tracksSchemas.postTrackBodySchema.parse(req.body);

      if (!file) {
        throw Boom.badRequest("File is required");
      }

      const parsedPath = path.parse(file.path);
      if (!config.supportedTrackExtensions.includes(parsedPath.ext)) {
        throw Boom.badRequest(
          `Invalid file extension '${parsedPath.ext}'. Supported extensions: ${config.supportedTrackExtensions}`
        );
      }

      const metadata = await getTrackMetaData(file.path).catch((err) => {
        throw Boom.badRequest("Unsupported or corrupt file was received. Failed to parse track metadata from file.", {
          cause: err,
        });
      });
      if (metadata.format.format_name !== "mp3") {
        throw Boom.badRequest("Invalid file format, must be mp3");
      }
      if (!metadata.format.duration) {
        throw Boom.badRequest(`Track duration failed to be determined`);
      }
      if (metadata.format.duration > config.maxTrackDurationInSeconds) {
        throw Boom.badRequest(`Track duration exceeds limit of ${config.maxTrackDurationInSeconds} seconds`);
      }

      const user = getAuthenticatedUser(req);

      normalizedPath = `${parsedPath.dir}/${parsedPath.name}-normalized${parsedPath.ext}`;
      await normalizeAudio(file.path, normalizedPath, metadata.format.duration).catch((err) => {
        throw Boom.internal("Failed to normalize track", { cause: err });
      });

      const track = await tracksService.postTrack(normalizedPath, name, metadata.format.duration, user.id);
      res.status(StatusCodes.CREATED).json(track);
    } finally {
      try {
        if (file?.path) await fs.unlinkSync(file.path);
        if (normalizedPath) await fs.unlinkSync(normalizedPath);
      } catch (error) {
        console.error(`Failed to delete files during track post clean up`, error);
      }
    }
  };

  const deleteTrack = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const user = getAuthenticatedUser(req);
    const updatedTrack = await tracksService.deleteTrack(id, user.id);
    res.status(StatusCodes.OK).json(updatedTrack);
  };

  const restoreTrack = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const { name } = tracksSchemas.restoreTrackBodySchema.parse(req.body);
    const user = getAuthenticatedUser(req);
    const updatedTrack = await tracksService.restoreTrack(id, user.id, name);
    res.status(StatusCodes.OK).json(updatedTrack);
  };

  return {
    getTracks,
    getTrackById,
    getTrackDownloadById,
    getTrackStreamById,
    patchTrack,
    postTrack,
    deleteTrack,
    restoreTrack,
  };
}
