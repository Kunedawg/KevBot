import express from "express";
import tracksController from "../controllers/tracksController";
// import upload from "../middlewares/multer";
const upload = require("../middlewares/multer");
import { requireAuth } from "../middlewares/auth";

const router = express.Router();

router.get("/", tracksController.getTracks);
router.get("/:id", tracksController.getTrackById);
router.get("/:id/download", tracksController.getTrackDownloadById);
router.get("/:id/stream", tracksController.getTrackStreamById);
router.patch("/:id", requireAuth, tracksController.patchTrack);
router.post("/", requireAuth, upload.single("file"), tracksController.postTrack);
router.delete("/:id", requireAuth, tracksController.deleteTrack);
router.patch("/:id/restore", requireAuth, tracksController.restoreTrack);

export default router;
