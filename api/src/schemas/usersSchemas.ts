import { z } from "zod";
import { usernameValidationFactory } from "./sharedSchemas";
import { Config } from "../config/config";

export function usersSchemasFactory(config: Config) {
  const getUsersQuerySchema = z
    .object({
      username: z.string().optional(),
      discordId: z.string().optional(),
      discordUsername: z.string().optional(),
    })
    .strict();

  const patchUserBodySchema = z.object({
    username: usernameValidationFactory(config),
  });

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

  return {
    getUsersQuerySchema,
    patchUserBodySchema,
    putGreetingBodySchema,
    putFarewellBodySchema,
  };
}
