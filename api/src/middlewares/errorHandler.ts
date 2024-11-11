import { Request, Response, NextFunction } from "express";
import multer from "multer";
import config from "../config/config";
import { ZodError } from "zod";
import { AuthenticationError } from "../utils/getAuthenticatedUser";
import * as Boom from "@hapi/boom";
import { fromError } from "zod-validation-error";
import { StatusCodes } from "http-status-codes";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    let message = "An error occurred during file upload.";
    let statusCode = 400;

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = `File size is too large. Maximum allowed size is ${(config.maxFileSize / 1000000).toFixed(1)}MB.`;
        statusCode = 413;
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files uploaded. Maximum allowed is 5 files.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected field in form data.";
        break;
    }
    res.status(statusCode).json({ error: message });
    return;
  }

  if (err instanceof ZodError) {
    const validationError = fromError(err);
    res.status(StatusCodes.BAD_REQUEST).json({
      statusCode: StatusCodes.BAD_REQUEST,
      error: "Bad Request",
      message: validationError.toString().replaceAll(`"`, `'`),
    });
    return;
  }

  if (err instanceof AuthenticationError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (Boom.isBoom(err)) {
    if (err.data) {
      res.status(err.output.statusCode).json({ ...err.output.payload, ...err.data });
    }
    res.status(err.output.statusCode).json(err.output.payload);
  }

  const statusCode = err.statusCode || 500;
  const errorResponse = {
    error: err.message || "Internal Server Error",
  };

  // if (req.app.get("env") === "development") {
  //   errorResponse.stack = err.stack;
  // }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
