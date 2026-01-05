import { Config } from "../config/config";
import { TracksService } from "./tracksService";
import { PlaylistsService } from "./playlistsService";
import { UsersService } from "./usersService";
import { SearchFilter, SearchQueryOptions } from "../schemas/searchSchemas";

type TrackSearchPayload = Awaited<ReturnType<TracksService["getTracks"]>>;
type PlaylistSearchPayload = Awaited<ReturnType<PlaylistsService["searchPlaylists"]>>;
type UserSearchPayload = Awaited<ReturnType<UsersService["searchUsers"]>>;

type IncludedFilter = Exclude<SearchFilter, "all">;

type UnifiedSearchResult =
  | {
      type: "track";
      track: TrackSearchPayload["data"][number];
      relevance: number | null;
      is_prefix?: number | null;
      updatedAt: Date | null;
    }
  | {
      type: "playlist";
      playlist: PlaylistSearchPayload["data"][number];
      relevance: number | null;
      is_prefix?: number | null;
      updatedAt: Date | null;
    }
  | {
      type: "user";
      user: UserSearchPayload["data"][number];
      relevance: number | null;
      is_prefix?: number | null;
      is_id_prefix?: number | null;
      updatedAt: Date | null;
    };

export interface UnifiedSearchResponse {
  query: string | null;
  filter: SearchFilter;
  filters: {
    playlist_id: number | null;
    user_id: number | null;
  };
  took_ms: number;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  results: Array<
    | {
        type: "track";
        track: TrackSearchPayload["data"][number];
        relevance: number | null;
      }
    | {
        type: "playlist";
        playlist: PlaylistSearchPayload["data"][number];
        relevance: number | null;
      }
    | {
        type: "user";
        user: UserSearchPayload["data"][number];
        relevance: number | null;
      }
  >;
  totals: {
    tracks: number;
    playlists: number;
    users: number;
  };
}

export function searchServiceFactory(
  config: Config,
  tracksService: TracksService,
  playlistsService: PlaylistsService,
  usersService: UsersService
) {
  const search = async (options: SearchQueryOptions): Promise<UnifiedSearchResponse> => {
    const startedAt = Date.now();
    const query = options.query;
    const filter = options.filter;
    const filters = {
      playlist_id: options.playlist_id ?? null,
      user_id: options.user_id ?? null,
    };

    const include = (kind: IncludedFilter) => filter === "all" || filter === kind;
    const fetchLimit = options.offset + options.limit;
    const queryPresent = query !== null && query.length > 0;

    const trackResults: TrackSearchPayload = include("tracks")
      ? await tracksService.getTracks({
          search: queryPresent ? { kind: "hybrid", q: query } : { kind: "browse", sort: "created_at", order: "desc" },
          include_deleted: false,
          limit: fetchLimit,
          offset: 0,
          playlist_id: options.playlist_id,
          user_id: options.user_id,
        })
      : {
          data: [],
          pagination: {
            total: 0,
            limit: fetchLimit,
            offset: 0,
            hasNext: false,
            hasPrev: false,
          },
        };

    const playlistResults: PlaylistSearchPayload = include("playlists")
      ? await playlistsService.searchPlaylists({
          q: query,
          limit: fetchLimit,
          offset: 0,
          include_deleted: false,
          hybridRatio: config.hybridRelevanceRatio,
        })
      : { data: [], total: 0 };

    const userResults: UserSearchPayload = include("users")
      ? await usersService.searchUsers({
          q: query,
          limit: fetchLimit,
          offset: 0,
          hybridRatio: config.hybridRelevanceRatio,
        })
      : { data: [], total: 0 };

    const combined: UnifiedSearchResult[] = [];

    if (include("tracks")) {
      combined.push(
        ...trackResults.data.map((track) => ({
          type: "track" as const,
          track,
          relevance: track.relevance ?? null,
          is_prefix: (track as unknown as { is_prefix?: number | null }).is_prefix ?? null,
          updatedAt: track.updated_at ? new Date(track.updated_at) : null,
        }))
      );
    }

    if (include("playlists")) {
      combined.push(
        ...playlistResults.data.map((playlist) => ({
          type: "playlist" as const,
          playlist,
          relevance: (playlist as unknown as { relevance?: number | null }).relevance ?? null,
          is_prefix: (playlist as unknown as { is_prefix?: number | null }).is_prefix ?? null,
          updatedAt: playlist.updated_at ? new Date(playlist.updated_at) : null,
        }))
      );
    }

    if (include("users")) {
      combined.push(
        ...userResults.data.map((user) => {
          const enriched = user as unknown as {
            relevance?: number | null;
            is_prefix?: number | null;
            is_id_prefix?: number | null;
          };
          return {
            type: "user" as const,
            user,
            relevance: enriched.relevance ?? null,
            is_prefix: enriched.is_prefix ?? null,
            is_id_prefix: enriched.is_id_prefix ?? null,
            updatedAt: user.updated_at ? new Date(user.updated_at) : null,
          };
        })
      );
    }

    const scoreFor = (result: UnifiedSearchResult) => {
      if (!queryPresent) {
        return (result.updatedAt ?? new Date()).getTime();
      }

      let score = result.relevance ?? 0;
      switch (result.type) {
        case "track":
          if (result.is_prefix && result.is_prefix > 0) {
            score += 2;
          }
          break;
        case "playlist":
          if (result.is_prefix && result.is_prefix > 0) {
            score += 2;
          }
          break;
        case "user":
          if (result.is_prefix && result.is_prefix > 0) {
            score += 2;
          }
          if (result.is_id_prefix && result.is_id_prefix > 0) {
            score += 1.5;
          }
          break;
      }
      return score;
    };

    const sorted = combined.sort((a, b) => {
      if (queryPresent) {
        const diff = scoreFor(b) - scoreFor(a);
        if (diff !== 0) return diff;
      }
      return (b.updatedAt ?? new Date()).getTime() - (a.updatedAt ?? new Date()).getTime();
    });

    const total =
      (include("tracks") ? trackResults.pagination.total : 0) +
      (include("playlists") ? playlistResults.total : 0) +
      (include("users") ? userResults.total : 0);

    const sliced = sorted.slice(options.offset, options.offset + options.limit);

    return {
      query,
      filter,
      filters,
      took_ms: Date.now() - startedAt,
      pagination: {
        total,
        limit: options.limit,
        offset: options.offset,
        hasNext: options.offset + options.limit < total,
        hasPrev: options.offset > 0,
      },
      results: sliced.map((item) => {
        switch (item.type) {
          case "track":
            return {
              type: "track" as const,
              track: item.track,
              relevance: item.relevance,
            };
          case "playlist":
            return {
              type: "playlist" as const,
              playlist: item.playlist,
              relevance: item.relevance,
            };
          case "user":
            return {
              type: "user" as const,
              user: item.user,
              relevance: item.relevance,
            };
        }
      }),
      totals: {
        tracks: trackResults.pagination.total,
        playlists: playlistResults.total,
        users: userResults.total,
      },
    };
  };

  return {
    search,
  };
}

export type SearchService = ReturnType<typeof searchServiceFactory>;
