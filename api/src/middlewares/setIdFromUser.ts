import { Request, Response, NextFunction } from "express";

function setIdFromUser(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.id) {
    res.status(500).json({ error: "Unexpected issue: User ID not found" });
    return;
  }
  req.params.id = String(req.user.id);
  next();
}

export default setIdFromUser;
