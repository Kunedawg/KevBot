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
