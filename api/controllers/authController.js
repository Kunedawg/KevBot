const { z } = require("zod");
const userService = require("../services/userService");
const authService = require("../services/authService");
const config = require("../config/config");

const usernameValidation = z
  .string({ required_error: "Username is required" })
  .regex(/^[a-z\d_]+$/g, {
    message: "Invalid username. Only lower case letters, numbers, and underscores are allowed.",
  })
  .max(config.maxUsernameLength, { message: `Username must be ${config.maxUsernameLength} characters or fewer.` });

const postRegisterBodySchema = z.object({
  // username: z
  //   .string({ required_error: "Username is required" })
  //   .regex(/^[a-z\d_]+$/g, {
  //     message: "Invalid username. Only lower case letters, numbers, and underscores are allowed.",
  //   })
  //   .max(config.maxUsernameLength, { message: `Username must be ${config.maxUsernameLength} characters or fewer.` }),
  username: usernameValidation,
  password: z
    .string({ required_error: "Password is required" })
    .min(config.minPasswordLength, {
      message: `Password must be at least ${config.minPasswordLength} characters long.`,
    })
    .max(config.maxPasswordLength, { message: `Password must be ${config.maxPasswordLength} characters or fewer.` })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/\d/, { message: "Password must contain at least one number." })
    .regex(/[@$!%*?&]/, { message: "Password must contain at least one special character." })
    .regex(/^\S+$/, { message: "Password must not contain spaces." }),
});

exports.usernameValidation = usernameValidation;

exports.postRegister = async (req, res, next) => {
  try {
    const result = postRegisterBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      } else {
        return res.status(400).json(result.error.issues);
      }
    }
    const { username, password } = result.data;
    const userLookupResult = await userService.getUsers({ username: username });
    console.log(userLookupResult);
    if (userLookupResult.length !== 0) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    const user = await authService.registerUser(username, password);
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

const postLoginBodySchema = z.object({
  username: z.string({ required_error: "Username is required" }),
  password: z.string({ required_error: "Password is required" }),
});

exports.postLogin = async (req, res, next) => {
  try {
    const result = postLoginBodySchema.safeParse(req.body);
    if (!result.success) {
      if (result?.error?.issues[0]?.message) {
        return res.status(400).json({ error: result.error.issues[0].message });
      }
      return res.status(400).json(result.error.issues);
    }
    const { username, password } = result.data;
    const errorMessage = "Invalid username or password";
    const userLookupResult = await userService.getUsers({ username: username });
    if (userLookupResult.length !== 1) {
      return res.status(400).json({ error: errorMessage });
    }
    const validPassword = await authService.verifyPassword(username, password);
    if (!validPassword) {
      return res.status(400).json({ error: errorMessage });
    }
    const user = userLookupResult[0];
    const token = await authService.signUser(user);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};
