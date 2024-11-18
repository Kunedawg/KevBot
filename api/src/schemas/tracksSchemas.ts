import { z } from "zod";
import { trackNameValidation } from "./sharedSchemas";

export const getTracksQuerySchema = z.object({
  name: z.string().optional(),
  include_deleted: z.coerce.boolean().optional().default(false),
});

export const patchTrackBodySchema = z.object({
  name: trackNameValidation,
});

export const postTrackBodySchema = z.object({
  name: trackNameValidation,
});

export const restoreTrackBodySchema = z.object({
  name: trackNameValidation.optional(),
});
