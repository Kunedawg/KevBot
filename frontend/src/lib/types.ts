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

export interface UnifiedSearchResponse {
  query: string | null;
  filters: {
    playlist_id: number | null;
    user_id: number | null;
  };
  took_ms: number;
  tracks: {
    items: ApiTrack[];
    pagination: PaginatedResponse<ApiTrack>["pagination"];
  };
  playlists: {
    items: ApiPlaylist[];
    total: number;
  };
  users: {
    items: ApiUser[];
    total: number;
  };
}

export interface UnifiedSearchRequest {
  q?: string;
  types?: SearchEntity[];
  playlistId?: number | null;
  userId?: number | null;
  limits?: Partial<Record<SearchEntity, number>>;
}
