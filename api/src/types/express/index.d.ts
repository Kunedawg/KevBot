import * as express from "express";
import { AuthContext } from "../../services/authService";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}
