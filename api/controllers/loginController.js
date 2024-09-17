const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { API_JWT_SECRET } = require("../config/secrets");

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

exports.login = async (req, res, next) => {
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
