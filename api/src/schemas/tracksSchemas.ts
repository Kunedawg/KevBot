import { z } from "zod";
import { trackNameValidationFactory } from "./sharedSchemas";
import { Config } from "../config/config";

export type SearchQuerySchema =
  | { kind: "fulltext"; q: string }
  | { kind: "contains"; q: string; sort: "name" | "created_at"; order: "asc" | "desc" }
  | { kind: "hybrid"; q: string }
  | { kind: "exact"; q: string }
  | { kind: "browse"; sort: "name" | "created_at"; order: "asc" | "desc" };

export type GetTracksQuerySchema = {
  search: SearchQuerySchema;
  include_deleted: boolean;
  limit: number;
  offset: number;
};

export type GetTracksQuerySchemaForKind<K extends SearchQuerySchema["kind"]> = Omit<GetTracksQuerySchema, "search"> & {
  search: Extract<SearchQuerySchema, { kind: K }>;
};

export function tracksSchemasFactory(config: Config) {
  const trackNameValidation = trackNameValidationFactory(config);

  const RawGetRacksQuerySchema = z
    .object({
      q: z.string().trim().min(1).max(config.maxSearchQueryLength).optional(),
      search_mode: z.enum(["fulltext", "contains", "hybrid", "exact"]).optional(),
      sort: z.enum(["relevance", "created_at", "name"]).optional(),
      order: z.enum(["asc", "desc"]).optional(),
      include_deleted: z.coerce.boolean().default(false),
      limit: z.coerce.number().int().min(1).max(config.maxTracksPerPage).default(20),
      offset: z.coerce.number().int().min(0).default(0),
    })
    .strict();

  const getTracksQuerySchema: z.ZodType<
    GetTracksQuerySchema,
    any,
    z.input<typeof RawGetRacksQuerySchema>
  > = RawGetRacksQuerySchema.transform((raw, ctx) => {
    const base = {
      include_deleted: raw.include_deleted,
      limit: raw.limit,
      offset: raw.offset,
    };

    // No q => browse mode (list view)
    if (!raw.q) {
      if (!raw.sort) {
        raw.sort = "created_at";
      }
      if (raw.sort === "relevance") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sort"],
          message: `Sort must be 'name' or 'created_at' for browse mode.`,
        });
        return z.NEVER;
      }
      if (raw.search_mode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["search_mode"],
          message: `Search mode must be omitted for browse mode.`,
        });
        return z.NEVER;
      }
      return {
        ...base,
        search: { kind: "browse", sort: raw.sort, order: raw.order ?? "desc" },
      };
    }

    if (!raw.search_mode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["search_mode"],
        message: `Search mode is required when q is provided.`,
      });
      return z.NEVER;
    }

    // With q => branch by search_mode
    switch (raw.search_mode) {
      case "contains": {
        if (!raw.sort) {
          raw.sort = "created_at";
        }
        if (raw.q.length < config.minContainsQueryLength) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["q"],
            message: `Query must be at least ${config.minContainsQueryLength} characters for contains search.`,
          });
          return z.NEVER;
        }
        if (raw.sort === "relevance") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sort"],
            message: `Sort must be 'name' or 'created_at' for contains search.`,
          });
          return z.NEVER;
        }
        return { ...base, search: { kind: "contains", q: raw.q, sort: raw.sort, order: raw.order ?? "desc" } };
      }

      case "fulltext": {
        if (raw.sort) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sort"],
            message: `Sort must be omitted for fulltext search.`,
          });
          return z.NEVER;
        }
        if (raw.order) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["order"],
            message: `Order must be omitted for fulltext search. (Always 'desc')`,
          });
          return z.NEVER;
        }
        return { ...base, search: { kind: "fulltext", q: raw.q } };
      }

      case "hybrid":
        if (raw.sort) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sort"],
            message: `Sort must be omitted for hybrid search.`,
          });
          return z.NEVER;
        }
        if (raw.order) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["order"],
            message: `Order must be omitted for hybrid search. (Always 'desc')`,
          });
          return z.NEVER;
        }
        return { ...base, search: { kind: "hybrid", q: raw.q } };

      case "exact":
        if (raw.sort) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sort"],
            message: `Sort must be omitted for exact search.`,
          });
          return z.NEVER;
        }
        if (raw.order) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["order"],
            message: `Order must be omitted for exact search.`,
          });
          return z.NEVER;
        }
        return { ...base, search: { kind: "exact", q: raw.q } };
    }
  });

  const suggestTracksQuerySchema = z
    .object({
      q: z.string().trim().min(1).max(config.maxSearchQueryLength),
      limit: z.coerce.number().int().min(1).max(config.maxSuggestLimit).optional().default(config.maxSuggestLimit),
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

// NOTE: how you could export the schema without having to export the whole factory
// export type SuggestTracksQuerySchema = z.infer<ReturnType<typeof tracksSchemasFactory>["suggestTracksQuerySchema"]>;
