import express from "express";
import * as playlistsController from "../controllers/playlistsController";
import * as auth from "../middlewares/auth";

const router = express.Router();

router.post("/", auth.requireAuth, playlistsController.postPlaylist);
router.get("/", playlistsController.getPlaylists);
router.get("/:id", playlistsController.getPlaylistById);
router.patch("/:id", auth.requireAuth, playlistsController.patchPlaylist);
router.delete("/:id", auth.requireAuth, playlistsController.deletePlaylist);
router.patch("/:id/restore", auth.requireAuth, playlistsController.restorePlaylist);
router.post("/:id/tracks", auth.requireAuth, playlistsController.postPlaylistTracks);
router.get("/:id/tracks", playlistsController.getPlaylistTracks);
router.delete("/:id/tracks", auth.requireAuth, playlistsController.deletePlaylistTracks);

export default router;
