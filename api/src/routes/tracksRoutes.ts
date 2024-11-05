import express from "express";
import * as tracksController from "../controllers/tracksController";
import upload from "../middlewares/multer";
import * as auth from "../middlewares/auth";

const router = express.Router();

router.get("/", tracksController.getTracks);
router.get("/:id", tracksController.getTrackById);
router.get("/:id/download", tracksController.getTrackDownloadById);
router.get("/:id/stream", tracksController.getTrackStreamById);
router.patch("/:id", auth.requireAuth, tracksController.patchTrack);
router.post("/", auth.requireAuth, upload.single("file"), tracksController.postTrack);
router.delete("/:id", auth.requireAuth, tracksController.deleteTrack);
router.patch("/:id/restore", auth.requireAuth, tracksController.restoreTrack);

export default router;
