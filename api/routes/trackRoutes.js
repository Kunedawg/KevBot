const express = require("express");
const trackController = require("../controllers/trackController");
const upload = require("../middlewares/multer");
const auth = require("../middlewares/auth");

const router = express.Router();
router.get("/", trackController.getTracks);
router.get("/:id", trackController.getTrackById);
router.get("/:id/download", trackController.getTrackDownloadById);
router.get("/:id/stream", trackController.getTrackStreamById);
router.patch("/:id", auth.requireAuth, trackController.patchTrack);
router.post("/", auth.requireAuth, upload.single("file"), trackController.postTrack);
router.delete("/:id", auth.requireAuth, trackController.deleteTrack);
router.patch("/:id/restore", auth.requireAuth, trackController.restoreTrack);

module.exports = router;
