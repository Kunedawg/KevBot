import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";
import Boom from "@hapi/boom";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    throw Boom.unauthorized("Access token is missing");
  }
  const user = await authService.verifyToken(token);
  req.user = user;
  next();
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    try {
      const user = await authService.verifyToken(token);
      req.user = user;
    } catch {
      // No error handling needed; requests can proceed as anonymous user.
    }
  }
  next();
};
