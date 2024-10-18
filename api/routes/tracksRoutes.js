const express = require("express");
const tracksController = require("../controllers/tracksController");
const upload = require("../middlewares/multer");
const auth = require("../middlewares/auth");

const router = express.Router();
router.get("/", tracksController.getTracks);
router.get("/:id", tracksController.getTrackById);
router.get("/:id/download", tracksController.getTrackDownloadById);
router.get("/:id/stream", tracksController.getTrackStreamById);
router.patch("/:id", auth.requireAuth, tracksController.patchTrack);
router.post("/", auth.requireAuth, upload.single("file"), tracksController.postTrack);
router.delete("/:id", auth.requireAuth, tracksController.deleteTrack);
router.patch("/:id/restore", auth.requireAuth, tracksController.restoreTrack);

module.exports = router;
