import { z } from "zod";
import { Config } from "../config/config";

export const SEARCH_ENTITIES = ["tracks", "playlists", "users"] as const;
export type SearchEntity = (typeof SEARCH_ENTITIES)[number];

export interface SearchQueryOptions {
  query: string | null;
  types: SearchEntity[];
  limits: {
    tracks: number;
    playlists: number;
    users: number;
  };
  playlist_id?: number;
  user_id?: number;
}

export function searchSchemasFactory(config: Config) {
  const RawSearchQuerySchema = z
    .object({
      q: z.string().trim().min(1).max(config.maxSearchQueryLength).optional(),
      types: z.string().optional(),
      limit_tracks: z.coerce.number().int().min(1).max(config.maxTracksPerPage).optional().default(10),
      limit_playlists: z.coerce.number().int().min(1).max(config.maxTracksPerPage).optional().default(10),
      limit_users: z.coerce.number().int().min(1).max(config.maxTracksPerPage).optional().default(10),
      playlist_id: z.coerce.number().int().min(1).optional(),
      user_id: z.coerce.number().int().min(1).optional(),
    })
    .strict();

  const searchQuerySchema: z.ZodType<
    SearchQueryOptions,
    any,
    z.input<typeof RawSearchQuerySchema>
  > = RawSearchQuerySchema.transform((raw, ctx) => {
    const typesParam = raw.types
      ? raw.types
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean)
      : [];

    const typesSet = new Set<SearchEntity>();

    let hasInvalidType = false;

    if (typesParam.length === 0) {
      SEARCH_ENTITIES.forEach((entity) => typesSet.add(entity));
    } else {
      for (const value of typesParam) {
        if ((SEARCH_ENTITIES as readonly string[]).includes(value)) {
          typesSet.add(value as SearchEntity);
        } else {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["types"],
            message: `Unsupported search type '${value}'. Expected one of: ${SEARCH_ENTITIES.join(", ")}`,
          });
          hasInvalidType = true;
        }
      }
      if (hasInvalidType || typesSet.size === 0) {
        return z.NEVER;
      }
    }

    return {
      query: raw.q?.trim() ?? null,
      types: Array.from(typesSet),
      limits: {
        tracks: raw.limit_tracks,
        playlists: raw.limit_playlists,
        users: raw.limit_users,
      },
      playlist_id: raw.playlist_id,
      user_id: raw.user_id,
    };
  });

  return {
    searchQuerySchema,
  };
}
