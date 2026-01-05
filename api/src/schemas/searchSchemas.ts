import { z } from "zod";
import { Config } from "../config/config";

export const SEARCH_FILTERS = ["all", "tracks", "playlists", "users"] as const;
export type SearchFilter = (typeof SEARCH_FILTERS)[number];

export interface SearchQueryOptions {
  query: string | null;
  filter: SearchFilter;
  limit: number;
  offset: number;
  playlist_id?: number;
  user_id?: number;
}

export function searchSchemasFactory(config: Config) {
  const RawSearchQuerySchema = z
    .object({
      q: z.string().trim().min(1).max(config.maxSearchQueryLength).optional(),
      filter: z.enum(SEARCH_FILTERS).optional(),
      limit: z.coerce.number().int().min(1).max(config.maxTracksPerPage).optional().default(25),
      offset: z.coerce.number().int().min(0).optional().default(0),
      playlist_id: z.coerce.number().int().min(1).optional(),
      user_id: z.coerce.number().int().min(1).optional(),
    })
    .strict();

  const searchQuerySchema: z.ZodType<
    SearchQueryOptions,
    any,
    z.input<typeof RawSearchQuerySchema>
  > = RawSearchQuerySchema.transform((raw, ctx) => {
    return {
      query: raw.q?.trim() ?? null,
      filter: raw.filter ?? "all",
      limit: raw.limit,
      offset: raw.offset,
      playlist_id: raw.playlist_id,
      user_id: raw.user_id,
    };
  });

  return {
    searchQuerySchema,
  };
}
