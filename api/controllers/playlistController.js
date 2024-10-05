const { z } = require("zod");
const fs = require("fs");
const path = require("path");
const playlistService = require("../services/playlistService");
const config = require("../config/config");

const getPlaylistsQuerySchema = z.object({
  name: z.string().optional(),
  include_deleted: z.coerce.boolean().optional().default(false),
});

exports.getPlaylists = async (req, res, next) => {
  try {
    const result = getPlaylistsQuerySchema.safeParse(req.query);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }
    const { name, include_deleted } = result.data;
    const playlists = await playlistService.getPlaylists({ name: name, include_deleted: include_deleted });
    return res.status(200).json(playlists);
  } catch (error) {
    next(error);
  }
};

exports.getPlaylistById = async (req, res, next) => {
  try {
    const playlist = await playlistService.getPlaylistById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    return res.status(200).json(playlist);
  } catch (error) {
    next(error);
  }
};

const patchPlaylistBodySchema = z.object({
  name: config.playlistNameValidation,
});

exports.patchPlaylist = async (req, res, next) => {
  try {
    const playlist = await playlistService.getPlaylistById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    if (!req.user?.id) {
      return res.status(500).json({ error: "Unexpected issue" });
    }

    if (playlist.user_id !== req.user.id) {
      return res.status(403).json({ error: "User does not have permission to change this playlist." });
    }

    const result = patchPlaylistBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }

    const nameLookupResult = await playlistService.getPlaylists({ name: result.data.name });
    if (nameLookupResult.length !== 0) {
      return res.status(400).json({ error: "Playlist name is already taken" });
    }

    const updatedPlaylist = await playlistService.patchPlaylist(req.params.id, result.data.name);
    res.status(200).json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
};

const postPlaylistBodySchema = z.object({
  name: config.playlistNameValidation,
});

exports.postPlaylist = async (req, res, next) => {
  try {
    const result = postPlaylistBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }

    const nameLookupResult = await playlistService.getPlaylists({ name: result.data.name });
    if (nameLookupResult.length !== 0) {
      return res.status(400).json({ error: "Playlist name is already taken" });
    }

    if (!req.user?.id) {
      return res.status(500).json({ error: "Unexpected issue" });
    }

    const playlist = await playlistService.postPlaylist(result.data.name, req.user.id);

    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
};

exports.deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await playlistService.getPlaylistById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    if (!req.user?.id) {
      return res.status(500).json({ error: "Unexpected issue" });
    }

    if (playlist.user_id !== req.user.id) {
      return res.status(403).json({ error: "User does not have permission to delete this track." });
    }

    const updatedPlaylist = await playlistService.deletePlaylist(req.params.id);
    res.status(200).json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
};

const restorePlaylistBodySchema = z.object({
  name: config.playlistNameValidation.optional(),
});

exports.restorePlaylist = async (req, res, next) => {
  try {
    const result = restorePlaylistBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }
    const { name } = result.data;

    const playlist = await playlistService.getPlaylistById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    if (playlist.deleted_at === null) {
      return res.status(400).json({ error: "Playlist is not deleted, so it cannot be restored." });
    }

    const playlistsWithSameName = await playlistService.getPlaylists({ name: name ?? playlist.name });
    if (playlistsWithSameName.length !== 0) {
      return res.status(400).json({ error: "Playlist name is already taken." });
    }

    if (!req.user?.id) {
      return res.status(500).json({ error: "Unexpected issue" });
    }

    if (playlist.user_id !== req.user.id) {
      return res.status(403).json({ error: "User does not have permission to restore this playlist." });
    }

    if (name) {
      await playlistService.patchPlaylist(playlist.id, name);
    }

    const updatedPlaylist = await playlistService.restorePlaylist(playlist.id);
    res.status(200).json(updatedPlaylist);
  } catch (error) {
    next(error);
  }
};
