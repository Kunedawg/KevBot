import { z } from "zod";
import { trackNameValidationFactory } from "./sharedSchemas";
import { Config } from "../config/config";

export function tracksSchemasFactory(config: Config) {
  const trackNameValidation = trackNameValidationFactory(config);

  const getTracksQuerySchema = z
    .object({
      name: z.string().optional(),
      include_deleted: z.coerce.boolean().optional().default(false),
    })
    .strict();

  const patchTrackBodySchema = z
    .object({
      name: trackNameValidation,
    })
    .strict();

  const postTrackBodySchema = z
    .object({
      name: trackNameValidation,
    })
    .strict();

  const restoreTrackBodySchema = z.object({
    name: trackNameValidation.optional(),
  });

  return {
    getTracksQuerySchema,
    patchTrackBodySchema,
    postTrackBodySchema,
    restoreTrackBodySchema,
  };
}
