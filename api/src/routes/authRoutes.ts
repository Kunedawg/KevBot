import express from "express";
import * as authController from "../controllers/authController";
import validate from "../middlewares/validate";
import { postLoginSchema, postRegisterSchema } from "../schemas/authSchemas";

const router = express.Router();
router.post("/login", validate(postLoginSchema), authController.postLogin);
router.post("/register", validate(postRegisterSchema), authController.postRegister);

export default router;
