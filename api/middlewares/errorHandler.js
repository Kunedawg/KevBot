const multer = require("multer");
const config = require("../config/config");

const errorHandler = (err, req, res, next) => {
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
    return res.status(statusCode).json({ error: message });
  }

  const statusCode = err.statusCode || 500;
  const errorResponse = {
    error: err.message || "Internal Server Error",
  };

  //   if (req.app.get("env") === "development") {
  //     errorResponse.stack = err.stack;
  //   }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;