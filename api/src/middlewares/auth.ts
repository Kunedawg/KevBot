import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Access token is missing" });
      return;
    }
    const user = await authService.verifyToken(token);
    if (!user) {
      res.status(403).json({ error: "Invalid access token" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch (error) {
    next(error);
  }
};
