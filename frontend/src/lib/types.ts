// TODO: Move this to a shared library?

export interface ApiTrack {
  id: number;
  name: string;
  duration: number;
  user_id: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  total_play_count: number;
  raw_total_play_count: number;
  relevance?: number;
  user_display_name?: string | null;
  user_discord_id?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TrackSuggestion {
  id: number;
  name: string;
}

export interface TrackSuggestionResponse {
  suggestions: TrackSuggestion[];
  took_ms: number;
}

export interface ApiPlaylist {
  id: number;
  name: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ApiUser {
  id: number;
  discord_id: string;
  discord_username: string | null;
  discord_avatar_hash: string | null;
  created_at: string;
  updated_at: string;
}

export type SearchEntity = "tracks" | "playlists" | "users";

export type SearchFilter = "all" | SearchEntity;

export interface UnifiedSearchResultTrack {
  type: "track";
  track: ApiTrack;
  relevance: number | null;
}

export interface UnifiedSearchResultPlaylist {
  type: "playlist";
  playlist: ApiPlaylist;
  relevance: number | null;
}

export interface UnifiedSearchResultUser {
  type: "user";
  user: ApiUser;
  relevance: number | null;
}

export type UnifiedSearchResult = UnifiedSearchResultTrack | UnifiedSearchResultPlaylist | UnifiedSearchResultUser;

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
  results: UnifiedSearchResult[];
  totals: {
    tracks: number;
    playlists: number;
    users: number;
  };
}

export interface UnifiedSearchRequest {
  q?: string;
  filter?: SearchFilter;
  playlistId?: number | null;
  userId?: number | null;
  limit?: number;
  offset?: number;
}
