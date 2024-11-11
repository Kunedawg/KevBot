import { Request, Response } from "express";
import * as playlistsService from "../services/playlistsService";
import * as tracksService from "../services/tracksService";
import * as playlistsSchemas from "../schemas/playlistsSchemas";
import { getAuthenticatedUser } from "../utils/getAuthenticatedUser";
import { i32IdSchema } from "../schemas/sharedSchemas";

export const getPlaylists = async (req: Request, res: Response) => {
  const { name, include_deleted } = playlistsSchemas.getPlaylistsQuerySchema.parse(req.query);
  const playlists = await playlistsService.getPlaylists({ name, include_deleted });
  res.status(200).json(playlists);
};

export const getPlaylistById = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const playlist = await playlistsService.getPlaylistById(id);
  if (!playlist) {
    res.status(404).json({ error: "Playlist not found" });
    return;
  }
  res.status(200).json(playlist);
};

export const patchPlaylist = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const { name } = playlistsSchemas.patchPlaylistBodySchema.parse(req.body);

  const playlist = await playlistsService.getPlaylistById(id);
  if (!playlist) {
    res.status(404).json({ error: "Playlist not found" });
    return;
  }

  const user = getAuthenticatedUser(req);
  if (playlist.user_id !== user.id) {
    res.status(403).json({ error: "User does not have permission to change this playlist." });
    return;
  }

  const nameLookupResult = await playlistsService.getPlaylists({ name });
  if (nameLookupResult.length !== 0) {
    res.status(400).json({ error: "Playlist name is already taken" });
    return;
  }

  // TODO: Do name check inside of patchPlaylist service function
  const updatedPlaylist = await playlistsService.patchPlaylist(id, name);
  res.status(200).json(updatedPlaylist);
};

export const postPlaylist = async (req: Request, res: Response) => {
  const { name } = playlistsSchemas.postPlaylistBodySchema.parse(req.body);
  // TODO: do name check inside of service function
  const nameLookupResult = await playlistsService.getPlaylists({ name });
  if (nameLookupResult.length !== 0) {
    res.status(400).json({ error: "Playlist name is already taken" });
    return;
  }
  const user = getAuthenticatedUser(req);
  const playlist = await playlistsService.postPlaylist(name, user.id);
  res.status(201).json(playlist);
};

export const deletePlaylist = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const playlist = await playlistsService.getPlaylistById(id);
  if (!playlist) {
    res.status(404).json({ error: "Playlist not found" });
    return;
  }

  const user = getAuthenticatedUser(req);
  if (playlist.user_id !== user.id) {
    res.status(403).json({ error: "User does not have permission to delete this playlist." });
    return;
  }

  const updatedPlaylist = await playlistsService.deletePlaylist(id);
  res.status(200).json(updatedPlaylist);
};

export const restorePlaylist = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const { name } = playlistsSchemas.restorePlaylistBodySchema.parse(req.body);

  const playlist = await playlistsService.getPlaylistById(id);
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

  const user = getAuthenticatedUser(req);
  if (playlist.user_id !== user.id) {
    res.status(403).json({ error: "User does not have permission to restore this playlist." });
    return;
  }

  if (name) {
    await playlistsService.patchPlaylist(playlist.id, name);
  }

  const updatedPlaylist = await playlistsService.restorePlaylist(playlist.id);
  res.status(200).json(updatedPlaylist);
};

export const getPlaylistTracks = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const tracks = await playlistsService.getPlaylistTracks(id);
  if (!tracks) {
    res.status(404).json({ error: "Playlist not found" });
    return;
  }
  res.status(200).json(tracks);
};

export const postPlaylistTracks = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const { track_ids } = playlistsSchemas.postPlaylistTracksBodySchema.parse(req.body);

  const playlist = await playlistsService.getPlaylistById(id);
  if (!playlist) {
    res.status(404).json({ error: "Playlist not found" });
    return;
  }

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

  const user = getAuthenticatedUser(req);
  const response = await playlistsService.postPlaylistTracks(playlist.id, track_ids, user.id);
  res.status(201).json(response);
};

export const deletePlaylistTracks = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const { track_ids } = playlistsSchemas.deletePlaylistTracksBodySchema.parse(req.body);

  const playlist = await playlistsService.getPlaylistById(id);
  if (!playlist) {
    res.status(404).json({ error: "Playlist not found" });
    return;
  }

  const user = getAuthenticatedUser(req);
  if (playlist.user_id !== user.id) {
    res.status(403).json({ error: "User does not have permission to delete tracks from this playlist." });
    return;
  }

  const response = await playlistsService.deletePlaylistTracks(playlist.id, track_ids, user.id);
  res.status(200).json(response);
};
