import express from "express";
import * as playsController from "../controllers/playsController";
import * as auth from "../middlewares/auth";

const router = express.Router();

router.post("/tracks", auth.optionalAuth, playsController.logTracksPlay);
router.post("/playlists/random", auth.optionalAuth, playsController.logRandomPlaylistsPlay);

export default router;
