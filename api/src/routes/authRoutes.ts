import express from "express";
import { Config } from "../config/config";
import { authControllerFactory } from "../controllers/authController";
import { AuthService } from "../services/authService";

export function authRoutesFactory(config: Config, authService: AuthService) {
  const authController = authControllerFactory(config, authService);
  const router = express.Router();
  router.post("/login", authController.postLogin);
  router.post("/register", authController.postRegister);
  return router;
}
