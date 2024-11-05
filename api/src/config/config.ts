import { z } from "zod";

const config = {
  PORT: Number(process.env.PORT) || 3000,
  ADDRESS: process.env.ADDRESS || "0.0.0.0",
  GCP_API_ENDPOINT: process.env.GCP_API_ENDPOINT || "",
  maxFileSize: 3000000, // bytes
  maxTrackNameLength: 15, // characters
  maxTrackDuration: 15.0, // seconds
  maxPlaylistNameLength: 15, // characters
  maxUsernameLength: 32, // characters
  minPasswordLength: 8, // characters
  maxPasswordLength: 64, // characters
  supportedTrackExtensions: [".mp3"],
  jwtTokenExpirationTime: "1h",
};

function nameValidationFactory(resourceName: string, maxNameLength: number) {
  return z
    .string()
    .regex(/^[a-z\d]+$/g, {
      message: `Invalid ${resourceName.toLowerCase()} name. Only lower case letters and numbers are allowed.`,
    })
    .max(maxNameLength, {
      message: `${
        resourceName.charAt(0).toUpperCase() + resourceName.slice(1).toLowerCase()
      } name must be ${maxNameLength} characters or fewer.`,
    });
}

const validationConfig = {
  trackNameValidation: nameValidationFactory("track", config.maxTrackNameLength),
  playlistNameValidation: nameValidationFactory("playlist", config.maxPlaylistNameLength),
};

export default {
  ...config,
  ...validationConfig,
};
