import { z } from "zod";
import config from "../config/config";

function nameValidationFactory(resourceName: string, maxNameLength: number, regex: RegExp) {
  return z
    .string()
    .regex(regex, {
      message: `Invalid ${resourceName.toLowerCase()}. Only lower case letters and numbers are allowed.`,
    })
    .max(maxNameLength, {
      message: `${
        resourceName.charAt(0).toUpperCase() + resourceName.slice(1).toLowerCase()
      } name must be ${maxNameLength} characters or fewer.`,
    });
}

export const trackNameValidation = nameValidationFactory("track name", config.maxTrackNameLength, /^[a-z\d]+$/g);
export const playlistNameValidation = nameValidationFactory(
  "playlist name",
  config.maxPlaylistNameLength,
  /^[a-z\d]+$/g
);
export const usernameValidation = nameValidationFactory("username", config.maxUsernameLength, /^[a-z\d_]+$/g);

export const i32IdSchema = z.object({
  id: z.coerce.number().int().min(0).max(2_147_483_647),
});
