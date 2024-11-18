import { Request } from "express";
import { User } from "../models/User";
import Boom from "@hapi/boom";

export const getAuthenticatedUser = (req: Request): User => {
  if (!req.user || !req.user.id) {
    throw Boom.unauthorized("User not authenticated");
  }
  return req.user;
};
