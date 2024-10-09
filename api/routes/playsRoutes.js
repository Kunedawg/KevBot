const express = require("express");
const playsController = require("../controllers/playsController");
const auth = require("../middlewares/auth");

const router = express.Router();
router.post("/tracks", auth.optionalAuth, playsController.logTracksPlay);
router.post("/playlists/random", auth.optionalAuth, playsController.logRandomPlaylistsPlay);

module.exports = router;
