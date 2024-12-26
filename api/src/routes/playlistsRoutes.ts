import express from "express";
import { AuthMiddleware } from "../middlewares/auth";
import { playlistsControllerFactory } from "../controllers/playlistsController";
import { Config } from "../config/config";
import { PlaylistsService } from "../services/playlistsService";

export function playlistsRoutesFactory(config: Config, auth: AuthMiddleware, playlistsService: PlaylistsService) {
  const router = express.Router();
  const playlistsController = playlistsControllerFactory(config, playlistsService);
  router.post("/", auth.requireAuth, playlistsController.postPlaylist);
  router.get("/", playlistsController.getPlaylists);
  router.get("/:id", playlistsController.getPlaylistById);
  router.patch("/:id", auth.requireAuth, playlistsController.patchPlaylist);
  router.delete("/:id", auth.requireAuth, playlistsController.deletePlaylist);
  router.patch("/:id/restore", auth.requireAuth, playlistsController.restorePlaylist);
  router.post("/:id/tracks", auth.requireAuth, playlistsController.postPlaylistTracks);
  router.get("/:id/tracks", playlistsController.getPlaylistTracks);
  router.delete("/:id/tracks", auth.requireAuth, playlistsController.deletePlaylistTracks);
  return router;
}
