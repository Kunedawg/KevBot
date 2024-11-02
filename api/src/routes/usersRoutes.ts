import express from "express";
import * as usersController from "../controllers/usersController";
import * as auth from "../middlewares/auth";
import setIdFromUser from "../middlewares/setIdFromUser";

const router = express.Router();

router.get("/", usersController.getUsers);
router.get("/@me", auth.requireAuth, setIdFromUser, usersController.getUserById);
router.get("/@me/greeting", auth.requireAuth, setIdFromUser, usersController.getGreeting);
router.get("/@me/farewell", auth.requireAuth, setIdFromUser, usersController.getFarewell);
router.get("/:id", usersController.getUserById);
router.get("/:id/greeting", usersController.getGreeting);
router.get("/:id/farewell", usersController.getFarewell);
router.patch("/@me", auth.requireAuth, setIdFromUser, usersController.patchUser);
router.patch("/:id", auth.requireAuth, usersController.patchUser);
router.put("/@me/greeting", auth.requireAuth, setIdFromUser, usersController.putGreeting);
router.put("/@me/farewell", auth.requireAuth, setIdFromUser, usersController.putFarewell);
router.put("/:id/greeting", auth.requireAuth, usersController.putGreeting);
router.put("/:id/farewell", auth.requireAuth, usersController.putFarewell);

export default router;
