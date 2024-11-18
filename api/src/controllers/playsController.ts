import { Request, Response } from "express";
import * as playsService from "../services/playsService";
import * as playsSchemas from "../schemas/playsSchemas";
import { StatusCodes } from "http-status-codes";

export const logTracksPlay = async (req: Request, res: Response) => {
  const { track_id, play_type } = playsSchemas.logTracksPlayBodySchema.parse(req.body);
  const response = await playsService.logTracksPlay(track_id, play_type, { user_id: req.user?.id });
  res.status(StatusCodes.CREATED).json(response);
};

export const logRandomPlaylistsPlay = async (req: Request, res: Response) => {
  const { playlist_id } = playsSchemas.logRandomPlaylistsPlayBodySchema.parse(req.body);
  const response = await playsService.logRandomPlaylistPlay(playlist_id, { user_id: req.user?.id });
  res.status(StatusCodes.CREATED).json(response);
};
