import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as usersService from "../services/usersService";
import { usernameValidation } from "./authController";
import * as tracksService from "../services/tracksService";
import * as playlistsService from "../services/playlistsService";

const getUsersQuerySchema = z.object({
  username: z.string().optional(),
});

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = getUsersQuerySchema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }
    const { username } = result.data;
    const users = await usersService.getUsers({ username });
    res.status(200).json(users);
    return;
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json(user);
    return;
  } catch (error) {
    next(error);
  }
};

export const getGreeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const greeting = await usersService.getGreetingByUserId(req.params.id);
    if (!greeting) {
      res.status(404).json({ error: "Greeting not found" });
      return;
    }
    res.status(200).json(greeting);
    return;
  } catch (error) {
    next(error);
  }
};

export const getFarewell = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const farewell = await usersService.getFarewellByUserId(req.params.id);
    if (!farewell) {
      res.status(404).json({ error: "Farewell not found" });
      return;
    }
    res.status(200).json(farewell);
    return;
  } catch (error) {
    next(error);
  }
};

const patchUserBodySchema = z.object({
  username: usernameValidation,
});

export const patchUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!req.user?.id) {
      res.status(500).json({ error: "Unexpected issue" });
      return;
    }

    if (user.id !== req.user.id) {
      res.status(403).json({ error: "User does not have permission to change this user." });
      return;
    }

    const result = patchUserBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }
    const { username } = result.data;
    const userLookupResult = await usersService.getUsers({ username });
    if (userLookupResult.length !== 0) {
      res.status(400).json({ error: "Username is already taken" });
      return;
    }
    const updatedUser = await usersService.patchUser(req.params.id, username);
    res.status(201).json(updatedUser);
    return;
  } catch (error) {
    next(error);
  }
};

const putGreetingBodySchema = z
  .object({
    greeting_track_id: z.number().int().nullable(),
    greeting_playlist_id: z.number().int().nullable(),
  })
  .refine(
    (data) => {
      const bothAreNumbers =
        typeof data.greeting_track_id === "number" && typeof data.greeting_playlist_id === "number";
      return !bothAreNumbers;
    },
    {
      message: "Only one greeting id entity can be provided, the other(s) must be null.",
    }
  );

export const putGreeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!req.user?.id) {
      res.status(500).json({ error: "Unexpected issue" });
      return;
    }

    if (user.id !== req.user.id) {
      res.status(403).json({ error: "User does not have permission to change this user." });
      return;
    }

    const result = putGreetingBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }
    const { greeting_track_id, greeting_playlist_id } = result.data;

    if (greeting_track_id) {
      const track = await tracksService.getTrackById(greeting_track_id);
      if (!track) {
        res.status(404).json({ error: "Track not found" });
        return;
      }
    }

    if (greeting_playlist_id) {
      const playlist = await playlistsService.getPlaylistById(greeting_playlist_id);
      if (!playlist) {
        res.status(404).json({ error: "Playlist not found" });
        return;
      }
    }

    const updatedGreeting = await usersService.putGreeting(req.params.id, greeting_track_id, greeting_playlist_id);
    res.status(201).json(updatedGreeting);
    return;
  } catch (error) {
    next(error);
  }
};

const putFarewellBodySchema = z
  .object({
    farewell_track_id: z.number().int().nullable(),
    farewell_playlist_id: z.number().int().nullable(),
  })
  .refine(
    (data) => {
      const bothAreNumbers =
        typeof data.farewell_track_id === "number" && typeof data.farewell_playlist_id === "number";
      return !bothAreNumbers;
    },
    {
      message: "Only one farewell id entity can be provided, the other(s) must be null.",
    }
  );

export const putFarewell = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!req.user?.id) {
      res.status(500).json({ error: "Unexpected issue" });
      return;
    }

    if (user.id !== req.user.id) {
      res.status(403).json({ error: "User does not have permission to change this user." });
      return;
    }

    const result = putFarewellBodySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.issues[0]?.message || result.error.issues });
      return;
    }
    const { farewell_track_id, farewell_playlist_id } = result.data;

    if (farewell_track_id) {
      const track = await tracksService.getTrackById(farewell_track_id);
      if (!track) {
        res.status(404).json({ error: "Track not found" });
        return;
      }
    }

    if (farewell_playlist_id) {
      const playlist = await playlistsService.getPlaylistById(farewell_playlist_id);
      if (!playlist) {
        res.status(404).json({ error: "Playlist not found" });
        return;
      }
    }

    const updatedFarewell = await usersService.putFarewell(req.params.id, farewell_track_id, farewell_playlist_id);
    res.status(201).json(updatedFarewell);
    return;
  } catch (error) {
    next(error);
  }
};

export default {
  getUsers,
  getUserById,
  getGreeting,
  getFarewell,
  patchUser,
  putGreeting,
  putFarewell,
};
