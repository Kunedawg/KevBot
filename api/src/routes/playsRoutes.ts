import express from "express";
import { playsControllerFactory } from "../controllers/playsController";
import { AuthMiddleware } from "../middlewares/auth";
import { PlaysService } from "../services/playsService";

export function playsRoutesFactory(auth: AuthMiddleware, playsService: PlaysService) {
  const router = express.Router();
  const playsController = playsControllerFactory(playsService);
  router.post("/tracks", auth.optionalAuth, playsController.logTracksPlay);
  router.post("/playlists/random", auth.optionalAuth, playsController.logRandomPlaylistsPlay);
  return router;
}
