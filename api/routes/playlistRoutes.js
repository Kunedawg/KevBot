const express = require("express");
const playlistController = require("../controllers/playlistController");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/", auth.requireAuth, playlistController.postPlaylist);
router.get("/", playlistController.getPlaylists);
router.get("/:id", playlistController.getPlaylistById);
router.patch("/:id", auth.requireAuth, playlistController.patchPlaylist);
router.delete("/:id", auth.requireAuth, playlistController.deletePlaylist);
router.patch("/:id/restore", auth.requireAuth, playlistController.restorePlaylist);
router.post("/:id/tracks", auth.requireAuth, playlistController.postPlaylistTracks);
router.get("/:id/tracks", playlistController.getPlaylistTracks);
router.delete("/:id/tracks", auth.requireAuth, playlistController.deletePlaylistTracks);

module.exports = router;
