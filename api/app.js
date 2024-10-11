const express = require("express");
// const cors = require("cors");
// const morgan = require("morgan");
const docRoutes = require("./routes/docRoutes");
const trackRoutes = require("./routes/trackRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const playsRoutes = require("./routes/playsRoutes");
const errorHandler = require("./middlewares/errorHandler");
const auth = require("./middlewares/auth");
const initTaskSchedules = require("./schedulers/taskScheduler");

const app = express();

// app.use(cors());
app.use(express.json());
// app.use(morgan("dev")); // Logging middleware

// Routes
app.use("/v1/tracks", trackRoutes);
app.use("/v1/docs", docRoutes);
app.use("/v1/auth", authRoutes);
app.use("/v1/users", userRoutes);
app.use("/v1/playlists", playlistRoutes);
app.use("/v1/plays", playsRoutes);

// testing
app.get("/v1/protected", auth.requireAuth, (req, res) => {
  res.send(`Hello ${req.user.username}`);
});

// Global Error Handler
app.use(errorHandler);

initTaskSchedules();

module.exports = app;
