const { z } = require("zod");
const userService = require("../services/userService");
const { usernameValidation } = require("./authController");

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
    const users = await userService.getUsers({ username: username });
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.getUserByMe = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(500).json({ error: "Unexpected issue" });
    }
    const user = await userService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const patchUserBodySchema = z.object({
  username: usernameValidation,
});

exports.patchUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
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
    const userLookupResult = await userService.getUsers({ username: username });
    if (userLookupResult.length !== 0) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    const updatedUser = await userService.patchUser(req.params.id, username);
    return res.status(201).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// TODO: Basically same logic as patchUser. Should refactor to reuse code
exports.patchUserByMe = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(500).json({ error: "Unexpected issue" });
    }

    const user = await userService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
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
    const userLookupResult = await userService.getUsers({ username: username });
    if (userLookupResult.length !== 0) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    const updatedUser = await userService.patchUser(req.user.id, username);
    return res.status(201).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
