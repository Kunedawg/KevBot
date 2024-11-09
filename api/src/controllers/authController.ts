import * as userService from "../services/usersService";
import * as authService from "../services/authService";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { PostLoginInput, PostRegisterInput } from "../schemas/authSchemas";

export const postRegister = async (req: Request<{}, {}, PostRegisterInput>, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
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

export const postLogin = async (req: Request<{}, {}, PostLoginInput>, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
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
    const token = await authService.signUser(user as User);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};
