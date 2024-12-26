import { Request, Response } from "express";
import { getAuthenticatedUser } from "../utils/getAuthenticatedUser";
import { i32IdSchema } from "../schemas/sharedSchemas";
import { StatusCodes } from "http-status-codes";
import { PlaylistsService } from "../services/playlistsService";
import { playlistsSchemaFactory } from "../schemas/playlistsSchemas";
import { Config } from "../config/config";

export function playlistsControllerFactory(config: Config, playlistsService: PlaylistsService) {
  const playlistsSchemas = playlistsSchemaFactory(config);

  const getPlaylists = async (req: Request, res: Response) => {
    const { name, include_deleted } = playlistsSchemas.getPlaylistsQuerySchema.parse(req.query);
    const playlists = await playlistsService.getPlaylists({ name, include_deleted });
    res.status(StatusCodes.OK).json(playlists);
  };

  const getPlaylistById = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const playlist = await playlistsService.getPlaylistById(id);
    res.status(StatusCodes.OK).json(playlist);
  };

  const patchPlaylist = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const { name } = playlistsSchemas.patchPlaylistBodySchema.parse(req.body);
    const user = getAuthenticatedUser(req);
    const updatedPlaylist = await playlistsService.patchPlaylist(id, name, user.id);
    res.status(StatusCodes.OK).json(updatedPlaylist);
  };

  const postPlaylist = async (req: Request, res: Response) => {
    const { name } = playlistsSchemas.postPlaylistBodySchema.parse(req.body);
    const user = getAuthenticatedUser(req);
    const playlist = await playlistsService.postPlaylist(name, user.id);
    res.status(StatusCodes.CREATED).json(playlist);
  };

  const deletePlaylist = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const user = getAuthenticatedUser(req);
    const updatedPlaylist = await playlistsService.deletePlaylist(id, user.id);
    res.status(StatusCodes.OK).json(updatedPlaylist);
  };

  const restorePlaylist = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const { name } = playlistsSchemas.restorePlaylistBodySchema.parse(req.body);
    const user = getAuthenticatedUser(req);
    const updatedPlaylist = await playlistsService.restorePlaylist(id, user.id, name);
    res.status(StatusCodes.OK).json(updatedPlaylist);
  };

  const getPlaylistTracks = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const tracks = await playlistsService.getPlaylistTracks(id);
    res.status(StatusCodes.OK).json(tracks);
  };

  const postPlaylistTracks = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const { track_ids } = playlistsSchemas.postPlaylistTracksBodySchema.parse(req.body);
    const user = getAuthenticatedUser(req);
    const response = await playlistsService.postPlaylistTracks(id, track_ids, user.id);
    res.status(StatusCodes.CREATED).json(response);
  };

  const deletePlaylistTracks = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const { track_ids } = playlistsSchemas.deletePlaylistTracksBodySchema.parse(req.body);
    const user = getAuthenticatedUser(req);
    const response = await playlistsService.deletePlaylistTracks(id, track_ids, user.id);
    res.status(StatusCodes.OK).json(response);
  };

  return {
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
}
