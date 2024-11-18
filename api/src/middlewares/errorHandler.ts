import { Request, Response, NextFunction } from "express";
import multer from "multer";
import config from "../config/config";
import { ZodError } from "zod";
import * as Boom from "@hapi/boom";
import { fromError } from "zod-validation-error";
import { StatusCodes } from "http-status-codes";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // TODO: improve this lazy and overly verbose error logging
  console.error(err);

  if (err instanceof multer.MulterError) {
    let message = "An error occurred during file upload.";
    let statusCode = StatusCodes.BAD_REQUEST;

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = `File size is too large. Maximum allowed size is ${(config.maxFileSize / 1000000).toFixed(1)}MB.`;
        statusCode = StatusCodes.REQUEST_TOO_LONG;
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files uploaded. Maximum allowed is 5 files.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected field in form data.";
        break;
    }
    res.status(StatusCodes.BAD_REQUEST).json({
      statusCode: statusCode,
      error: "Bad Request",
      message: message,
    });
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

  if (Boom.isBoom(err)) {
    if (err.data) {
      res.status(err.output.statusCode).json({ ...err.output.payload, ...err.data });
      return;
    }
    res.status(err.output.statusCode).json(err.output.payload);
    return;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    error: "Internal Server Error",
    message: "An internal server error occurred",
  });
  return;
};

export default errorHandler;
