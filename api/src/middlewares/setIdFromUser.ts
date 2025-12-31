import { Request, Response, NextFunction } from "express";

function setIdFromUser(req: Request, res: Response, next: NextFunction) {
  if (!req.auth?.userId) {
    res.status(500).json({ error: "Unexpected issue: User ID not found" });
    return;
  }
  req.params.id = String(req.auth.userId);
  next();
}

export default setIdFromUser;
