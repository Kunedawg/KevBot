import { Config } from "../config/config";
import { TracksService } from "./tracksService";
import { PlaylistsService } from "./playlistsService";
import { UsersService } from "./usersService";
import { SearchQueryOptions } from "../schemas/searchSchemas";

type TrackSearchPayload = Awaited<ReturnType<TracksService["getTracks"]>>;
type PlaylistSearchPayload = Awaited<ReturnType<PlaylistsService["searchPlaylists"]>>;
type UserSearchPayload = Awaited<ReturnType<UsersService["searchUsers"]>>;

export interface UnifiedSearchResponse {
  query: string | null;
  filters: {
    playlist_id: number | null;
    user_id: number | null;
  };
  took_ms: number;
  tracks: {
    items: TrackSearchPayload["data"];
    pagination: TrackSearchPayload["pagination"];
  };
  playlists: {
    items: PlaylistSearchPayload["data"];
    total: number;
  };
  users: {
    items: UserSearchPayload["data"];
    total: number;
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
    const filters = {
      playlist_id: options.playlist_id ?? null,
      user_id: options.user_id ?? null,
    };

    let trackResults: TrackSearchPayload = {
      data: [],
      pagination: {
        total: 0,
        limit: options.limits.tracks,
        offset: 0,
        hasNext: false,
        hasPrev: false,
      },
    };

    if (options.types.includes("tracks")) {
      trackResults = await tracksService.getTracks({
        search: query ? { kind: "hybrid", q: query } : { kind: "browse", sort: "name", order: "asc" },
        include_deleted: false,
        limit: options.limits.tracks,
        offset: 0,
        playlist_id: options.playlist_id,
        user_id: options.user_id,
      });
    }

    let playlistResults: PlaylistSearchPayload = { data: [], total: 0 };
    if (options.types.includes("playlists")) {
      playlistResults = await playlistsService.searchPlaylists({
        q: query,
        limit: options.limits.playlists,
        include_deleted: false,
        hybridRatio: config.hybridRelevanceRatio,
      });
    }

    let userResults: UserSearchPayload = { data: [], total: 0 };
    if (options.types.includes("users")) {
      userResults = await usersService.searchUsers({
        q: query,
        limit: options.limits.users,
        hybridRatio: config.hybridRelevanceRatio,
      });
    }

    return {
      query,
      filters,
      took_ms: Date.now() - startedAt,
      tracks: {
        items: trackResults.data,
        pagination: trackResults.pagination,
      },
      playlists: {
        items: playlistResults.data,
        total: playlistResults.total,
      },
      users: {
        items: userResults.data,
        total: userResults.total,
      },
    };
  };

  return {
    search,
  };
}

export type SearchService = ReturnType<typeof searchServiceFactory>;
