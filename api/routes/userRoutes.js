const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");
const setIdFromUser = require("../middlewares/setIdFromUser");

const router = express.Router();
router.get("/", userController.getUsers);
router.get("/@me", auth.requireAuth, setIdFromUser, userController.getUserById);
router.get("/@me/greeting", auth.requireAuth, setIdFromUser, userController.getGreeting);
router.get("/@me/farewell", auth.requireAuth, setIdFromUser, userController.getFarewell);
router.get("/:id", userController.getUserById);
router.get("/:id/greeting", userController.getGreeting);
router.get("/:id/farewell", userController.getFarewell);
router.patch("/@me", auth.requireAuth, setIdFromUser, userController.patchUser);
router.patch("/:id", auth.requireAuth, userController.patchUser);
router.put("/@me/greeting", auth.requireAuth, setIdFromUser, userController.putGreeting);
router.put("/@me/farewell", auth.requireAuth, setIdFromUser, userController.putFarewell);
router.put("/:id/greeting", auth.requireAuth, userController.putGreeting);
router.put("/:id/farewell", auth.requireAuth, userController.putFarewell);

module.exports = router;
