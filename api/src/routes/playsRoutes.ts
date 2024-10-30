import express from "express";
import playsController from "../controllers/playsController";
import auth from "../middlewares/auth";
// const playsController = require("../controllers/playsController");

const router = express.Router();

router.post("/tracks", auth.optionalAuth, playsController.logTracksPlay);
router.post("/playlists/random", auth.optionalAuth, playsController.logRandomPlaylistsPlay);

export default router;
