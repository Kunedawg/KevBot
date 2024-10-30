import { Request, Response, NextFunction } from "express";
import { z } from "zod";
// import playsService from "../services/playsService";
// import playlistsService from "../services/playlistsService";
// import tracksService from "../services/tracksService";
const playsService = require("../services/playsService");
const playlistsService = require("../services/playlistsService");
const tracksService = require("../services/tracksService");

const logTracksPlayBodySchema = z.object({
  track_id: z.number().int(),
  play_type: z.union([
    z.literal(playsService.PLAY_TYPE.PLAY),
    z.literal(playsService.PLAY_TYPE.PLAY_RANDOM),
    z.literal(playsService.PLAY_TYPE.GREETING),
    z.literal(playsService.PLAY_TYPE.RAID),
    z.literal(playsService.PLAY_TYPE.FAREWELL),
    z.literal(playsService.PLAY_TYPE.CATEGORY_GREETING),
  ]),
});

export const logTracksPlay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = logTracksPlayBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }
    const { track_id, play_type } = result.data;

    const track = await tracksService.getTrackById(track_id);
    if (!track) {
      res.status(400).json({ error: "Track not found" });
      return;
    }

    const response = await playsService.logTracksPlay(track_id, play_type, { user_id: req.user?.id });
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const logRandomPlaylistsPlayBodySchema = z.object({
  playlist_id: z.number().int(),
});

export const logRandomPlaylistsPlay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = logRandomPlaylistsPlayBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }
    const { playlist_id } = result.data;

    const playlist = await playlistsService.getPlaylistById(playlist_id);
    if (!playlist) {
      res.status(400).json({ error: "Playlist not found" });
      return;
    }

    const response = await playsService.logRandomPlaylistPlay(playlist_id, { user_id: req.user?.id });
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export default {
  logTracksPlay,
  logRandomPlaylistsPlay,
};

// const { z } = require("zod");
// const playsService = require("../services/playsService");
// const playlistsService = require("../services/playlistsService");
// const tracksService = require("../services/tracksService");

// const logTracksPlayBodySchema = z.object({
//   track_id: z.number().int(),
//   play_type: z.union([
//     z.literal(playsService.PLAY_TYPE.PLAY),
//     z.literal(playsService.PLAY_TYPE.PLAY_RANDOM),
//     z.literal(playsService.PLAY_TYPE.GREETING),
//     z.literal(playsService.PLAY_TYPE.RAID),
//     z.literal(playsService.PLAY_TYPE.FAREWELL),
//     z.literal(playsService.PLAY_TYPE.CATEGORY_GREETING),
//   ]),
// });

// exports.logTracksPlay = async (req, res, next) => {
//   try {
//     const result = logTracksPlayBodySchema.safeParse(req.body);
//     if (!result.success) {
//       if (result?.error?.issues[0]?.message) {
//         return res.status(400).json({ error: result.error.issues[0].message });
//       } else {
//         return res.status(400).json(result.error.issues);
//       }
//     }
//     const { track_id, play_type } = result.data;

//     const track = await tracksService.getTrackById(track_id);
//     if (!track) {
//       return res.status(400).json({ error: "Track not found" });
//     }

//     const response = await playsService.logTracksPlay(track_id, play_type, { user_id: req.user?.id });
//     res.status(201).json(response);
//   } catch (error) {
//     next(error);
//   }
// };

// const logRandomPlaylistsPlayBodySchema = z.object({
//   playlist_id: z.number().int(),
// });

// exports.logRandomPlaylistsPlay = async (req, res, next) => {
//   try {
//     const result = logRandomPlaylistsPlayBodySchema.safeParse(req.body);
//     if (!result.success) {
//       if (result?.error?.issues[0]?.message) {
//         return res.status(400).json({ error: result.error.issues[0].message });
//       } else {
//         return res.status(400).json(result.error.issues);
//       }
//     }
//     const { playlist_id } = result.data;

//     const playlist = await playlistsService.getPlaylistById(playlist_id);
//     if (!playlist) {
//       return res.status(400).json({ error: "Playlist not found" });
//     }

//     const response = await playsService.logRandomPlaylistPlay(playlist_id, { user_id: req.user?.id });
//     res.status(201).json(response);
//   } catch (error) {
//     next(error);
//   }
// };
