import { z } from "zod";
import config from "../config/config";

export const usernameValidation = z
  .string({ required_error: "Username is required" })
  .regex(/^[a-z\d_]+$/g, {
    message: "Invalid username. Only lower case letters, numbers, and underscores are allowed.",
  })
  .max(config.maxUsernameLength, { message: `Username must be ${config.maxUsernameLength} characters or fewer.` });

export const postRegisterSchema = z.object({
  body: z.object({
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
  }),
});
export type PostRegisterInput = z.infer<typeof postRegisterSchema>["body"];

export const postLoginSchema = z.object({
  body: z.object({
    username: z.string({ required_error: "Username is required" }),
    password: z.string({ required_error: "Password is required" }),
  }),
});
export type PostLoginInput = z.infer<typeof postLoginSchema>["body"];
