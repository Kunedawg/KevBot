import express, { Request, Response } from "express";
import docRoutes from "./routes/docRoutes";
import authRoutes from "./routes/authRoutes";
import usersRoutes from "./routes/usersRoutes";
const tracksRoutes = require("./routes/tracksRoutes");
const playlistsRoutes = require("./routes/playlistsRoutes");
const playsRoutes = require("./routes/playsRoutes");
const errorHandler = require("./middlewares/errorHandler");
import { requireAuth } from "./middlewares/auth";
const initTaskSchedules = require("./schedulers/taskScheduler");

const app = express();

app.use(express.json());

app.use("/v1/docs", docRoutes);
app.use("/v1/auth", authRoutes);
app.use("/v1/users", usersRoutes);
app.use("/v1/tracks", tracksRoutes);
app.use("/v1/playlists", playlistsRoutes);
app.use("/v1/plays", playsRoutes);
// testing - remove
app.get("/v1/protected", requireAuth, (req: Request, res: Response) => {
  res.send(`Hello ${req.user?.username}`);
});

app.use(errorHandler);

initTaskSchedules();

export default app;
