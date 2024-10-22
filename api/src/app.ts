// const express = require("express");
import express, { Request, Response } from "express";
// const cors = require("cors");
// const morgan = require("morgan");
const docRoutes = require("./routes/docRoutes");
const tracksRoutes = require("./routes/tracksRoutes");
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const playlistsRoutes = require("./routes/playlistsRoutes");
const playsRoutes = require("./routes/playsRoutes");
const errorHandler = require("./middlewares/errorHandler");
// const auth = require("./middlewares/auth");
// import { requireAuth, AuthenticatedRequest } from "./middlewares/auth";
import { requireAuth } from "./middlewares/auth";
const initTaskSchedules = require("./schedulers/taskScheduler");

const app = express();

// app.use(cors());
app.use(express.json());
// app.use(morgan("dev")); // Logging middleware

// Routes
app.use("/v1/tracks", tracksRoutes);
app.use("/v1/docs", docRoutes);
app.use("/v1/auth", authRoutes);
app.use("/v1/users", usersRoutes);
app.use("/v1/playlists", playlistsRoutes);
app.use("/v1/plays", playsRoutes);
// testing
app.get("/v1/protected", requireAuth, (req: Request, res: Response) => {
  res.send(`Hello ${req.user?.username}`);
});

// Global Error Handler
app.use(errorHandler);

initTaskSchedules();

// module.exports = app;

export default app;
