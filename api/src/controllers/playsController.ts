import { Request, Response } from "express";
import * as playsSchemas from "../schemas/playsSchemas";
import { StatusCodes } from "http-status-codes";
import { PlaysService } from "../services/playsService";

export function playsControllerFactory(playsService: PlaysService) {
  const logTracksPlay = async (req: Request, res: Response) => {
    const { track_id, play_type } = playsSchemas.logTracksPlayBodySchema.parse(req.body);
    await playsService.logTracksPlay(track_id, play_type, { user_id: req.user?.id });
    res.status(StatusCodes.CREATED).end();
  };

  const logRandomPlaylistsPlay = async (req: Request, res: Response) => {
    const { playlist_id } = playsSchemas.logRandomPlaylistsPlayBodySchema.parse(req.body);
    await playsService.logRandomPlaylistPlay(playlist_id, { user_id: req.user?.id });
    res.status(StatusCodes.CREATED).end();
  };

  return {
    logTracksPlay,
    logRandomPlaylistsPlay,
  };
}
