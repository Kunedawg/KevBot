import { Request, Response, NextFunction } from "express";
import Boom from "@hapi/boom";
import { AuthService } from "../services/authService";

export function authMiddlewareFactory(authService: AuthService) {
  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      throw Boom.unauthorized("Access token is missing");
    }
    const context = await authService.verifyToken(token);
    req.auth = context;
    next();
  };

  const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      try {
        const context = await authService.verifyToken(token);
        req.auth = context;
      } catch {
        // No error handling needed; requests can proceed as anonymous user.
      }
    }
    next();
  };

  return {
    requireAuth,
    optionalAuth,
  };
}

export type AuthMiddleware = ReturnType<typeof authMiddlewareFactory>;
