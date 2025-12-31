import { AuthService, authServiceFactory } from "./authService";
import { PlaylistsService, playlistsServiceFactory } from "./playlistsService";
import { PlaysService, playsServiceFactory } from "./playsService";
import { TracksService, tracksServiceFactory } from "./tracksService";
import { UsersService, usersServiceFactory } from "./usersService";
import { Config, Secrets } from "../config/config";
import { KevbotDb } from "../db/connection";
import { Bucket } from "@google-cloud/storage";

export interface AllServices {
  authService: AuthService;
  playlistsService: PlaylistsService;
  playsService: PlaysService;
  tracksService: TracksService;
  usersService: UsersService;
}

export function serviceFactory(config: Config, secrets: Secrets, db: KevbotDb, tracksBucket: Bucket): AllServices {
  const tracksService = tracksServiceFactory(db, tracksBucket, config);
  const playlistsService = playlistsServiceFactory(db);
  const usersService = usersServiceFactory(db, tracksService, playlistsService);
  const playsService = playsServiceFactory(db, tracksService, playlistsService);
  const authService = authServiceFactory(config, secrets, db, usersService);

  return {
    authService,
    playlistsService,
    playsService,
    tracksService,
    usersService,
  };
}
