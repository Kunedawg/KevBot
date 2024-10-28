import express from "express";
// import usersController from "../controllers/usersController";
const usersController = require("../controllers/usersController");
import { requireAuth } from "../middlewares/auth";
import setIdFromUser from "../middlewares/setIdFromUser";

const router = express.Router();

router.get("/", usersController.getUsers);
router.get("/@me", requireAuth, setIdFromUser, usersController.getUserById);
router.get("/@me/greeting", requireAuth, setIdFromUser, usersController.getGreeting);
router.get("/@me/farewell", requireAuth, setIdFromUser, usersController.getFarewell);
router.get("/:id", usersController.getUserById);
router.get("/:id/greeting", usersController.getGreeting);
router.get("/:id/farewell", usersController.getFarewell);
router.patch("/@me", requireAuth, setIdFromUser, usersController.patchUser);
router.patch("/:id", requireAuth, usersController.patchUser);
router.put("/@me/greeting", requireAuth, setIdFromUser, usersController.putGreeting);
router.put("/@me/farewell", requireAuth, setIdFromUser, usersController.putFarewell);
router.put("/:id/greeting", requireAuth, usersController.putGreeting);
router.put("/:id/farewell", requireAuth, usersController.putFarewell);

export default router;
