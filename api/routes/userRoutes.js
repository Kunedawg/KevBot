const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

const router = express.Router();
router.get("/", userController.getUsers);
router.get("/@me", auth.requireAuth, userController.getUserByMe);
router.get("/:id", userController.getUserById);
router.patch("/@me", auth.requireAuth, userController.patchUserByMe);
router.patch("/:id", auth.requireAuth, userController.patchUser);

module.exports = router;
