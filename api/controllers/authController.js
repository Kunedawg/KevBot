const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { API_JWT_SECRET } = require("../config/secrets");
// const knex = require("../db/connection");
const userService = require("../services/userService");
const authService = require("../services/authService");

const postLoginBodySchema = z.object({
  username: z.string({ required_error: "Username is required" }),
  password: z.string({ required_error: "Password is required" }),
});

const users = [
  {
    id: 1,
    username: "kidkev",
    password: "pablo",
  },
];

exports.postLogin = async (req, res, next) => {
  try {
    const result = postLoginBodySchema.safeParse(req.body);
    if (!result.success) {
      console.log(result.error.issues);
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }
    const { username, password } = result.data;

    const errorMessage = "Invalid username or password";
    const user = users.find((u) => u.username === username);
    if (!user) return res.status(400).json({ error: errorMessage });
    const validPassword = password === user.password;
    if (!validPassword) return res.status(400).json({ error: errorMessage });

    const token = jwt.sign({ id: user.id, username: user.username }, API_JWT_SECRET, {
      expiresIn: "5m",
    });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

const postRegisterBodySchema = postLoginBodySchema;

exports.postRegister = async (req, res, next) => {
  try {
    const result = postRegisterBodySchema.safeParse(req.body);
    if (!result.success) {
      console.log(result.error.issues);
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }
    const { username, password } = result.data;

    const userLookupResult = await userService.getUsers({ username: username });
    if (userLookupResult.length !== 0) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const user = await authService.registerUser(username, password);
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};
