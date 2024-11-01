import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as playlistsService from "../services/playlistsService";
import config from "../config/config";
import * as tracksService from "../services/tracksService";

const getPlaylistsQuerySchema = z.object({
  name: z.string().optional(),
  include_deleted: z.coerce.boolean().optional().default(false),
});

export const getPlaylists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = getPlaylistsQuerySchema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }
    const { name, include_deleted } = result.data;
    const playlists = await playlistsService.getPlaylists({ name, include_deleted });
    res.status(200).json(playlists);
    return;
  } catch (error) {
    next(error);
  }
};

export const getPlaylistById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playlist = await playlistsService.getPlaylistById(req.params.id);
    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }
    res.status(200).json(playlist);
    return;
  } catch (error) {
    next(error);
  }
};

const patchPlaylistBodySchema = z.object({
  name: config.playlistNameValidation,
});

export const patchPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playlist = await playlistsService.getPlaylistById(req.params.id);
    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    if (!req.user?.id) {
      res.status(500).json({ error: "Unexpected issue" });
      return;
    }

    if (playlist.user_id !== req.user.id) {
      res.status(403).json({ error: "User does not have permission to change this playlist." });
      return;
    }

    const result = patchPlaylistBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }

    const nameLookupResult = await playlistsService.getPlaylists({ name: result.data.name });
    if (nameLookupResult.length !== 0) {
      res.status(400).json({ error: "Playlist name is already taken" });
      return;
    }

    const updatedPlaylist = await playlistsService.patchPlaylist(req.params.id, result.data.name);
    res.status(200).json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
};

const postPlaylistBodySchema = z.object({
  name: config.playlistNameValidation,
});

export const postPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = postPlaylistBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }

    const nameLookupResult = await playlistsService.getPlaylists({ name: result.data.name });
    if (nameLookupResult.length !== 0) {
      res.status(400).json({ error: "Playlist name is already taken" });
      return;
    }

    if (!req.user?.id) {
      res.status(500).json({ error: "Unexpected issue" });
      return;
    }

    const playlist = await playlistsService.postPlaylist(result.data.name, req.user.id);
    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

export const deletePlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playlist = await playlistsService.getPlaylistById(req.params.id);
    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    if (!req.user?.id) {
      res.status(500).json({ error: "Unexpected issue" });
      return;
    }

    if (playlist.user_id !== req.user.id) {
      res.status(403).json({ error: "User does not have permission to delete this playlist." });
      return;
    }

    const updatedPlaylist = await playlistsService.deletePlaylist(req.params.id);
    res.status(200).json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
};

const restorePlaylistBodySchema = z.object({
  name: config.playlistNameValidation.optional(),
});

export const restorePlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = restorePlaylistBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }
    const { name } = result.data;

    const playlist = await playlistsService.getPlaylistById(req.params.id);
    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    if (playlist.deleted_at === null) {
      res.status(400).json({ error: "Playlist is not deleted, so it cannot be restored." });
      return;
    }

    const playlistsWithSameName = await playlistsService.getPlaylists({ name: name ?? playlist.name });
    if (playlistsWithSameName.length !== 0) {
      res.status(400).json({ error: "Playlist name is already taken." });
      return;
    }

    if (!req.user?.id) {
      res.status(500).json({ error: "Unexpected issue" });
      return;
    }

    if (playlist.user_id !== req.user.id) {
      res.status(403).json({ error: "User does not have permission to restore this playlist." });
      return;
    }

    if (name) {
      await playlistsService.patchPlaylist(playlist.id, name);
    }

    const updatedPlaylist = await playlistsService.restorePlaylist(playlist.id);
    res.status(200).json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
};

export const getPlaylistTracks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tracks = await playlistsService.getPlaylistTracks(req.params.id);
    if (!tracks) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }
    res.status(200).json(tracks);
    return;
  } catch (error) {
    next(error);
  }
};

const postPlaylistTracksBodySchema = z.object({
  track_ids: z.array(z.number().int()).min(1),
});

export const postPlaylistTracks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playlist = await playlistsService.getPlaylistById(req.params.id);
    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    const result = postPlaylistTracksBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }
    const { track_ids } = result.data;

    const tracksNotFound: number[] = [];
    for (const track_id of track_ids) {
      const track = await tracksService.getTrackById(track_id);
      if (!track) {
        tracksNotFound.push(track_id);
      }
    }

    if (tracksNotFound.length !== 0) {
      res.status(400).json({ error: "Invalid track IDs provided.", invalid_track_ids: tracksNotFound });
      return;
    }

    if (!req.user?.id) {
      res.status(500).json({ error: "Unexpected issue" });
      return;
    }

    const response = await playlistsService.postPlaylistTracks(playlist.id, track_ids, req.user.id);
    res.status(201).json(response);
    return;
  } catch (error) {
    next(error);
  }
};

const deletePlaylistTracksBodySchema = z.object({
  track_ids: z.array(z.number().int()).min(1),
});

export const deletePlaylistTracks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playlist = await playlistsService.getPlaylistById(req.params.id);
    if (!playlist) {
      res.status(404).json({ error: "Playlist not found" });
      return;
    }

    const result = deletePlaylistTracksBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }
    const { track_ids } = result.data;

    if (!req.user?.id) {
      res.status(500).json({ error: "Unexpected issue" });
      return;
    }

    if (playlist.user_id !== req.user.id) {
      res.status(403).json({ error: "User does not have permission to delete tracks from this playlist." });
      return;
    }

    const response = await playlistsService.deletePlaylistTracks(playlist.id, track_ids, req.user.id);
    res.status(200).json(response);
    return;
  } catch (error) {
    next(error);
  }
};

export default {
  getPlaylists,
  getPlaylistById,
  patchPlaylist,
  postPlaylist,
  deletePlaylist,
  restorePlaylist,
  getPlaylistTracks,
  postPlaylistTracks,
  deletePlaylistTracks,
};
