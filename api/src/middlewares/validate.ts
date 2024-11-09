import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        errors: err.errors.map((e) => ({
          path: e.path,
          message: e.message,
        })),
      });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export default validate;
