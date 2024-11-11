import { Request } from "express";
import { User } from "../models/User";

export class AuthenticationError extends Error {
  statusCode: number;
  constructor(message: string = "User not authenticated") {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = 401;
  }
}

export const getAuthenticatedUser = (req: Request): User => {
  if (!req.user || !req.user.id) {
    throw new AuthenticationError();
  }
  return req.user;
};
