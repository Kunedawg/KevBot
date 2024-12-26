import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "../services/authService";
import { authSchemaFactory } from "../schemas/authSchemas";
import { Config } from "../config/config";

export function authControllerFactory(config: Config, authService: AuthService) {
  const authSchemas = authSchemaFactory(config);

  const postRegister = async (req: Request, res: Response) => {
    const { username, password } = authSchemas.postRegisterBodySchema.parse(req.body);
    const user = await authService.registerUser(username, password);
    res.status(StatusCodes.CREATED).json(user);
  };

  const postLogin = async (req: Request, res: Response) => {
    const { username, password } = authSchemas.postLoginBodySchema.parse(req.body);
    const user = await authService.verifyPassword(username, password);
    const token = await authService.signUser(user);
    res.status(StatusCodes.OK).json({ token });
  };

  return {
    postRegister,
    postLogin,
  };
}
