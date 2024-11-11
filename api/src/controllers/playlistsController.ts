import { Request, Response } from "express";
import * as playlistsService from "../services/playlistsService";
import * as playlistsSchemas from "../schemas/playlistsSchemas";
import { getAuthenticatedUser } from "../utils/getAuthenticatedUser";
import { i32IdSchema } from "../schemas/sharedSchemas";
import { StatusCodes } from "http-status-codes";

export const getPlaylists = async (req: Request, res: Response) => {
  const { name, include_deleted } = playlistsSchemas.getPlaylistsQuerySchema.parse(req.query);
  const playlists = await playlistsService.getPlaylists({ name, include_deleted });
  res.status(StatusCodes.OK).json(playlists);
};

export const getPlaylistById = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const playlist = await playlistsService.getPlaylistById(id);
  res.status(StatusCodes.OK).json(playlist);
};

export const patchPlaylist = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const { name } = playlistsSchemas.patchPlaylistBodySchema.parse(req.body);
  const user = getAuthenticatedUser(req);
  const updatedPlaylist = await playlistsService.patchPlaylist(id, name, user.id);
  res.status(StatusCodes.OK).json(updatedPlaylist);
};

export const postPlaylist = async (req: Request, res: Response) => {
  const { name } = playlistsSchemas.postPlaylistBodySchema.parse(req.body);
  const user = getAuthenticatedUser(req);
  const playlist = await playlistsService.postPlaylist(name, user.id);
  res.status(StatusCodes.CREATED).json(playlist);
};

export const deletePlaylist = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const user = getAuthenticatedUser(req);
  const updatedPlaylist = await playlistsService.deletePlaylist(id, user.id);
  res.status(StatusCodes.OK).json(updatedPlaylist);
};

export const restorePlaylist = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const { name } = playlistsSchemas.restorePlaylistBodySchema.parse(req.body);
  const user = getAuthenticatedUser(req);
  const updatedPlaylist = await playlistsService.restorePlaylist(id, user.id, name);
  res.status(StatusCodes.OK).json(updatedPlaylist);
};

export const getPlaylistTracks = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const tracks = await playlistsService.getPlaylistTracks(id);
  res.status(StatusCodes.OK).json(tracks);
};

export const postPlaylistTracks = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const { track_ids } = playlistsSchemas.postPlaylistTracksBodySchema.parse(req.body);
  const user = getAuthenticatedUser(req);
  const response = await playlistsService.postPlaylistTracks(id, track_ids, user.id);
  res.status(StatusCodes.CREATED).json(response);
};

export const deletePlaylistTracks = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const { track_ids } = playlistsSchemas.deletePlaylistTracksBodySchema.parse(req.body);
  const user = getAuthenticatedUser(req);
  const response = await playlistsService.deletePlaylistTracks(id, track_ids, user.id);
  res.status(StatusCodes.OK).json(response);
};
