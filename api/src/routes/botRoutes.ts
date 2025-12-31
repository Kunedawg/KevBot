import express from "express";
import { Config } from "../config/config";
import { AuthService } from "../services/authService";
import { authControllerFactory } from "../controllers/authController";
import { UsersService } from "../services/usersService";

export function botRoutesFactory(config: Config, authService: AuthService, usersService: UsersService) {
  const router = express.Router();
  // REVIEW: not sure if I like the authControllerFactory, another controller is constructed in the authRoutesFactory
  const authController = authControllerFactory(config, authService, usersService);
  router.post("/auth", authController.postBotAuth);
  return router;
}
