import * as authService from "../services/authService";
import { Request, Response } from "express";
import * as authSchemas from "../schemas/authSchemas";
import { StatusCodes } from "http-status-codes";

export const postRegister = async (req: Request, res: Response) => {
  const { username, password } = authSchemas.postRegisterBodySchema.parse(req.body);
  const user = await authService.registerUser(username, password);
  res.status(StatusCodes.CREATED).json(user);
};

export const postLogin = async (req: Request, res: Response) => {
  const { username, password } = authSchemas.postLoginBodySchema.parse(req.body);
  const user = await authService.verifyPassword(username, password);
  const token = await authService.signUser(user);
  res.status(StatusCodes.OK).json({ token });
};
