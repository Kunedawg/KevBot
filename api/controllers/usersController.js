const { z } = require("zod");
const usersService = require("../services/usersService");
const { usernameValidation } = require("./authController");
const tracksService = require("../services/tracksService");
const playlistsService = require("../services/playlistsService");

const getUsersQuerySchema = z.object({
  username: z.string().optional(),
});

exports.getUsers = async (req, res, next) => {
  try {
    const result = getUsersQuerySchema.safeParse(req.query);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }
    const { username } = result.data;
    const users = await usersService.getUsers({ username: username });
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.getGreeting = async (req, res, next) => {
  try {
    const greeting = await usersService.getGreetingByUserId(req.params.id);
    if (!greeting) {
      return res.status(404).json({ error: "Greeting not found" });
    }
    return res.status(200).json(greeting);
  } catch (error) {
    next(error);
  }
};

exports.getFarewell = async (req, res, next) => {
  try {
    const farewell = await usersService.getFarewellByUserId(req.params.id);
    if (!farewell) {
      return res.status(404).json({ error: "Farewell not found" });
    }
    return res.status(200).json(farewell);
  } catch (error) {
    next(error);
  }
};

const patchUserBodySchema = z.object({
  username: usernameValidation,
});

exports.patchUser = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!req.user?.id) {
      return res.status(500).json({ error: "Unexpected issue" });
    }

    if (user.id !== req.user.id) {
      return res.status(403).json({ error: "User does not have permission to change this user." });
    }

    const result = patchUserBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }
    const { username } = result.data;
    const userLookupResult = await usersService.getUsers({ username: username });
    if (userLookupResult.length !== 0) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    const updatedUser = await usersService.patchUser(req.params.id, username);
    return res.status(201).json(updatedUser);
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
      const nonNullCount = Object.values(data).reduce((count, value) => count + (value !== null ? 1 : 0), 0);
      return nonNullCount < 2;
    },
    {
      message: "Only one greeting id entity can be provided, the others must be null.",
    }
  );

exports.putGreeting = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!req.user?.id) {
      return res.status(500).json({ error: "Unexpected issue" });
    }

    if (user.id !== req.user.id) {
      return res.status(403).json({ error: "User does not have permission to change this user." });
    }

    const result = putGreetingBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }
    const { greeting_track_id, greeting_playlist_id } = result.data;

    if (greeting_track_id) {
      const track = await tracksService.getTrackById(greeting_track_id);
      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }
    }

    if (greeting_playlist_id) {
      const playlist = await playlistsService.getPlaylistById(greeting_playlist_id);
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
    }

    const updatedGreeting = await usersService.putGreeting(req.params.id, greeting_track_id, greeting_playlist_id);
    return res.status(201).json(updatedGreeting);
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
      const nonNullCount = Object.values(data).reduce((count, value) => count + (value !== null ? 1 : 0), 0);
      return nonNullCount < 2;
    },
    {
      message: "Only one farewell id entity can be provided, the others must be null.",
    }
  );

exports.putFarewell = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!req.user?.id) {
      return res.status(500).json({ error: "Unexpected issue" });
    }

    if (user.id !== req.user.id) {
      return res.status(403).json({ error: "User does not have permission to change this user." });
    }

    const result = putFarewellBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }
    const { farewell_track_id, farewell_playlist_id } = result.data;

    if (farewell_track_id) {
      const track = await tracksService.getTrackById(farewell_track_id);
      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }
    }

    if (farewell_playlist_id) {
      const playlist = await playlistsService.getPlaylistById(farewell_playlist_id);
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
    }

    const updatedFarewell = await usersService.putFarewell(req.params.id, farewell_track_id, farewell_playlist_id);
    return res.status(201).json(updatedFarewell);
  } catch (error) {
    next(error);
  }
};
