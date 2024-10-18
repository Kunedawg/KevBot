const express = require("express");
const playlistsController = require("../controllers/playlistsController");
const auth = require("../middlewares/auth");

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

module.exports = router;
