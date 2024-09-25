const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { API_JWT_SECRET } = require("../config/secrets");
const knex = require("../db/connection");

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

    // need to check if user is unique

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [id] = await knex("users").insert({ username: username, password_hash: hashedPassword });
    const user = await knex("users")
      .select(["id", "discord_id", "discord_username", "username", "created_at", "updated_at"])
      .where("id", id)
      .first();

    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};
