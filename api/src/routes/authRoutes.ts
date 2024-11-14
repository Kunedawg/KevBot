import express from "express";
import * as authController from "../controllers/authController";

const router = express.Router();
router.post("/login", authController.postLogin);
router.post("/register", authController.postRegister);

export default router;
