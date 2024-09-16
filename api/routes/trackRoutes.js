const express = require("express");
const trackController = require("../controllers/trackController");
const upload = require("../middlewares/multer");
// const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", trackController.getTracks);
router.get("/:id", trackController.getTrackById);
router.get("/:id/download", trackController.getTrackDownloadById);
router.get("/:id/stream", trackController.getTrackStreamById);
router.patch("/:id", trackController.patchTrack);
router.post("/", upload.single("file"), trackController.postTrack);
router.delete("/:id", trackController.deleteTrack);
// router.post("/", authMiddleware, trackController.createTrack); // Protected route
// router.get("/:id", trackController.getTrackById);
// router.patch("/:id", authMiddleware, trackController.updateTrack);
// router.delete("/:id", authMiddleware, trackController.deleteTrack);

module.exports = router;