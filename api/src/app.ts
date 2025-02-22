import express from "express";
import { serviceFactory } from "./services";
import { docsRoutesFactory } from "./routes/docsRoutes";
import { authRoutesFactory } from "./routes/authRoutes";
import { usersRoutesFactory } from "./routes/usersRoutes";
import { tracksRoutesFactory } from "./routes/tracksRoutes";
import { playlistsRoutesFactory } from "./routes/playlistsRoutes";
import { playsRoutesFactory } from "./routes/playsRoutes";
import { errorHandlerFactory } from "./middlewares/errorHandler";
import { Config, Secrets } from "./config/config";
import { Kysely } from "kysely";
import { Database } from "./db/schema";
import { Bucket } from "@google-cloud/storage";
import path from "path";
import { authMiddlewareFactory } from "./middlewares/auth";

export function appFactory(config: Config, secrets: Secrets, db: Kysely<Database>, tracksBucket: Bucket) {
  const app = express();
  app.use(express.json());
  const services = serviceFactory(config, secrets, db, tracksBucket);
  const auth = authMiddlewareFactory(services.authService);
  app.use("/v1/docs", docsRoutesFactory(path.join(__dirname, "docs", "kevbot-api.yml")));
  app.use("/v1/auth", authRoutesFactory(config, services.authService));
  app.use("/v1/users", usersRoutesFactory(config, auth, services.usersService));
  app.use("/v1/tracks", tracksRoutesFactory(config, auth, services.tracksService));
  app.use("/v1/playlists", playlistsRoutesFactory(config, auth, services.playlistsService));
  app.use("/v1/plays", playsRoutesFactory(auth, services.playsService));
  app.use(errorHandlerFactory(config.maxFileSizeInBytes));
  return app;
}
