import { z } from "zod";
import { trackNameValidationFactory } from "./sharedSchemas";
import { Config } from "../config/config";

const MAX_SEARCH_QUERY_LENGTH = 200;
const MIN_CONTAINS_QUERY_LENGTH = 2;
const MAX_SUGGEST_LIMIT = 10;

export function tracksSchemasFactory(config: Config) {
  const trackNameValidation = trackNameValidationFactory(config);

  const getTracksQuerySchema = z
    .object({
      name: trackNameValidation.optional(),
      q: z.string().trim().min(1).max(MAX_SEARCH_QUERY_LENGTH).optional(),
      search_mode: z.enum(["fulltext", "contains"]).optional().default("fulltext"),
      sort: z.enum(["relevance", "created_at", "name"]).optional().default("created_at"),
      order: z.enum(["asc", "desc"]).optional().default("desc"),
      include_deleted: z.coerce.boolean().optional().default(false),
      limit: z.coerce.number().int().min(1).max(config.maxTracksPerPage).optional().default(20),
      offset: z.coerce.number().int().min(0).optional().default(0),
    })
    .strict()
    .superRefine((params, ctx) => {
      if (params.name && params.q) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Provide either 'name' or 'q', not both.",
          path: ["name"],
        });
      }
      if (params.search_mode === "contains") {
        const queryLength = params.q?.length ?? 0;
        if (queryLength < MIN_CONTAINS_QUERY_LENGTH) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Query must be at least ${MIN_CONTAINS_QUERY_LENGTH} characters when using contains search.`,
            path: ["q"],
          });
        }
      }
    });

  const suggestTracksQuerySchema = z
    .object({
      q: z.string().trim().min(1).max(MAX_SEARCH_QUERY_LENGTH),
      limit: z.coerce.number().int().min(1).max(MAX_SUGGEST_LIMIT).optional().default(10),
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
    suggestTracksQuerySchema,
    patchTrackBodySchema,
    postTrackBodySchema,
    restoreTrackBodySchema,
  };
}
