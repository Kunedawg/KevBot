const express = require("express");
// const cors = require("cors");
// const morgan = require("morgan");
const docRoutes = require("./routes/docRoutes");
const trackRoutes = require("./routes/trackRoutes");
// const userRoutes = require("./routes/userRoutes");
// const errorHandler = require("./middlewares/errorHandler");
// const authMiddleware = require("./middlewares/authMiddleware");

const app = express();

// app.use(cors());
app.use(express.json());
// app.use(morgan("dev")); // Logging middleware

// Routes
app.use("/v1/tracks", trackRoutes);
app.use("/v1/docs", docRoutes);
// app.use("/api/users", userRoutes);

// Global Error Handler
// app.use(errorHandler);

module.exports = app;
