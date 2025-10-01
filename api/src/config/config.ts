import { z } from "zod";

const secretsSchema = z.object({
  DB_CONNECTION_STRING: z
    .string()
    .min(1)
    .refine(
      (val) => {
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "DB_CONNECTION_STRING must be a valid URL.",
      }
    ),
  GCP_API_ENDPOINT: z.string().min(1),
  GCP_TRACKS_BUCKET_NAME: z.string().min(1),
  KEVBOT_API_ADDRESS: z.string().min(1),
  KEVBOT_API_JWT_SECRET: z.string().min(1),
  KEVBOT_API_PORT: z.coerce.number().int().positive(),
});

const configSchema = z.object({
  maxFileSizeInBytes: z.number().int().positive(),
  maxTrackDurationInSeconds: z.number().positive(),
  maxTrackNameLength: z.number().int().positive(),
  maxPlaylistNameLength: z.number().int().positive(),
  maxUsernameLength: z.number().int().positive(),
  minPasswordLength: z.number().int().positive(),
  maxPasswordLength: z.number().int().positive(),
  supportedTrackExtensions: z.array(z.string()).nonempty(),
  acceptableIntegratedLoudnessBand: z.number(),
  acceptableDurationChangeInSeconds: z.number(),
  jwtTokenExpirationTime: z
    .string()
    .regex(/^\d+[smhd]$/, "jwtTokenExpirationTime must be a valid time string like '1h', '30m', '60s', etc."),
  expectedDbVersion: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/,
      "expectedDbVersion must be a valid semantic version (e.g., 2.10.0, 1.0.0-beta, etc.)"
    ),
  maxTracksPerPage: z.number().int().positive(),
});

export type Secrets = z.infer<typeof secretsSchema>;
export type Config = z.infer<typeof configSchema>;
export type AppConfig = { config: Config; secrets: Secrets };

export function configFactory(): AppConfig {
  try {
    const secrets = {
      DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
      GCP_API_ENDPOINT: process.env.GCP_API_ENDPOINT,
      GCP_TRACKS_BUCKET_NAME: process.env.GCP_TRACKS_BUCKET_NAME,
      KEVBOT_API_ADDRESS: process.env.KEVBOT_API_ADDRESS,
      KEVBOT_API_PORT: process.env.KEVBOT_API_PORT,
      KEVBOT_API_JWT_SECRET: process.env.KEVBOT_API_JWT_SECRET,
    };
    const config = {
      maxFileSizeInBytes: 3000000,
      maxTrackDurationInSeconds: 15.0,
      maxTrackNameLength: 15,
      maxPlaylistNameLength: 15,
      maxUsernameLength: 32,
      minPasswordLength: 8,
      maxPasswordLength: 64,
      supportedTrackExtensions: [".mp3"],
      jwtTokenExpirationTime: "1h",
      expectedDbVersion: "2.11.0",
      acceptableIntegratedLoudnessBand: 2.5,
      acceptableDurationChangeInSeconds: 0.01,
      maxTracksPerPage: 100,
    };
    const validatedSecrets = secretsSchema.parse(secrets);
    const validatedConfig = configSchema.parse(config);
    return { config: validatedConfig, secrets: validatedSecrets };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Configuration validation error:", error.errors);
    } else {
      console.error("Unknown error during configuration initialization:", error);
    }
    process.exit(1);
  }
}
