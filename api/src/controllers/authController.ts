import { z } from "zod";
const userService = require("../services/usersService");
const authService = require("../services/authService");
import config from "../config/config";
import { Request, Response, NextFunction } from "express";

export const usernameValidation = z
  .string({ required_error: "Username is required" })
  .regex(/^[a-z\d_]+$/g, {
    message: "Invalid username. Only lower case letters, numbers, and underscores are allowed.",
  })
  .max(config.maxUsernameLength, { message: `Username must be ${config.maxUsernameLength} characters or fewer.` });

const postRegisterBodySchema = z.object({
  username: usernameValidation,
  password: z
    .string({ required_error: "Password is required" })
    .min(config.minPasswordLength, {
      message: `Password must be at least ${config.minPasswordLength} characters long.`,
    })
    .max(config.maxPasswordLength, { message: `Password must be ${config.maxPasswordLength} characters or fewer.` })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/\d/, { message: "Password must contain at least one number." })
    .regex(/[@$!%*?&]/, { message: "Password must contain at least one special character." })
    .regex(/^\S+$/, { message: "Password must not contain spaces." }),
});

export const postRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = postRegisterBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }
    const { username, password } = result.data;
    const userLookupResult = await userService.getUsers({ username });
    if (userLookupResult.length !== 0) {
      res.status(400).json({ error: "Username is already taken" });
      return;
    }
    const user = await authService.registerUser(username, password);
    res.status(201).json(user);
    return;
  } catch (error) {
    next(error);
  }
};

const postLoginBodySchema = z.object({
  username: z.string({ required_error: "Username is required" }),
  password: z.string({ required_error: "Password is required" }),
});

export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = postLoginBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }
    const { username, password } = result.data;
    const errorMessage = "Invalid username or password";
    const userLookupResult = await userService.getUsers({ username });
    if (userLookupResult.length !== 1) {
      res.status(400).json({ error: errorMessage });
      return;
    }
    const validPassword = await authService.verifyPassword(username, password);
    if (!validPassword) {
      res.status(400).json({ error: errorMessage });
      return;
    }
    const user = userLookupResult[0];
    const token = await authService.signUser(user);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

export default {
  postRegister,
  postLogin,
};
