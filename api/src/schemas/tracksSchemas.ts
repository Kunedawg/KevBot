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
      q: z.string().trim().min(1).max(MAX_SEARCH_QUERY_LENGTH).optional(),
      search_mode: z.enum(["fulltext", "contains", "hybrid", "exact"]).optional(),
      sort: z.enum(["relevance", "created_at", "name"]).optional().default("created_at"),
      order: z.enum(["asc", "desc"]).optional().default("desc"),
      include_deleted: z.coerce.boolean().optional().default(false),
      limit: z.coerce.number().int().min(1).max(config.maxTracksPerPage).optional().default(20),
      offset: z.coerce.number().int().min(0).optional().default(0),
    })
    .strict()
    .superRefine((params, ctx) => {
      const q = params.q;

      if ((params.search_mode && !q) || (!params.search_mode && q)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Query 'q' is required for ${params.search_mode} search.`,
          path: ["q"],
        });
      }

      if (params.search_mode === "contains") {
        const queryLength = q?.length ?? 0;
        if (queryLength < MIN_CONTAINS_QUERY_LENGTH) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Query must be at least ${MIN_CONTAINS_QUERY_LENGTH} characters when using contains search.`,
            path: ["q"],
          });
        }

        if (!["name", "created_at"].includes(params.sort)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `For 'contains', sort must be 'name' or 'created_at'.`,
            path: ["sort"],
          });
        }
      }

      if (params.search_mode === "fulltext") {
        if (!["relevance", "created_at", "name"].includes(params.sort)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `For 'fulltext', sort must be 'relevance', 'created_at', or 'name'.`,
            path: ["sort"],
          });
        }
        if (params.sort === "relevance" && params.order !== "desc") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `When sorting by 'relevance', order must be 'desc'.`,
            path: ["order"],
          });
        }
      }

      // 4) hybrid: sort is implied; reject any explicit sort/order
      if (params.search_mode === "hybrid") {
        if (params.sort !== "relevance") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `For 'hybrid', sorting is implied by the hybrid ranking. Use 'relevance' or omit 'sort'.`,
            path: ["sort"],
          });
        }
        if (params.order !== "desc") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `For 'hybrid', order is implied (descending relevance). Use 'desc' or omit 'order'.`,
            path: ["order"],
          });
        }
      }

      // 5) exact: ignore sort; if you want to be strict, forbid it
      if (params.search_mode === "exact") {
        if (params.sort !== "created_at" || params.order !== "desc") {
          // You could also just accept anything and ignore it in the query layer.
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `For 'exact', results are unique; sorting is not applicable. Use 'created_at' + 'desc' as a tie-breaker only.`,
            path: ["sort"],
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
