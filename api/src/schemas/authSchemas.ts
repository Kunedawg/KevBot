import { z } from "zod";
import { Config } from "../config/config";
import { usernameValidationFactory } from "./sharedSchemas";

export function authSchemaFactory(config: Config) {
  const postRegisterBodySchema = z.object({
    username: usernameValidationFactory(config),
    password: z
      .string({ required_error: "Password is required" })
      .min(config.minPasswordLength, {
        message: `Password must be at least ${config.minPasswordLength} characters long.`,
      })
      .max(config.maxPasswordLength, {
        message: `Password must be ${config.maxPasswordLength} characters or fewer.`,
      })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
      .regex(/\d/, { message: "Password must contain at least one number." })
      .regex(/[@$!%*?&]/, { message: "Password must contain at least one special character." })
      .regex(/^\S+$/, { message: "Password must not contain spaces." }),
  });

  const postLoginBodySchema = z.object({
    username: z.string({ required_error: "Username is required" }),
    password: z.string({ required_error: "Password is required" }),
  });

  return {
    postRegisterBodySchema,
    postLoginBodySchema,
  };
}
