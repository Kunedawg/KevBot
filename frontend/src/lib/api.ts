import { ApiTrack, PaginatedResponse, TrackSuggestionResponse } from "./types";

type TrackFetchParams = {
  offset?: number;
  limit?: number;
  q?: string;
  name?: string;
  search_mode?: "fulltext" | "contains" | "hybrid";
  sort?: "relevance" | "created_at" | "name";
  order?: "asc" | "desc";
  include_deleted?: boolean;
};

const trackQueryKeys: Array<keyof TrackFetchParams> = [
  "offset",
  "limit",
  "q",
  "name",
  "search_mode",
  "sort",
  "order",
  "include_deleted",
];

export async function fetchTracks(params: TrackFetchParams = {}): Promise<PaginatedResponse<ApiTrack>> {
  const searchParams = new URLSearchParams();

  for (const key of trackQueryKeys) {
    const value = params[key];
    if (value === undefined || value === null) continue;
    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();
  const res = await fetch(`/api/tracks${queryString ? `?${queryString}` : ""}`);

  if (!res.ok) {
    throw new Error("Failed to fetch tracks");
  }

  return res.json();
}

export async function fetchTrackSuggestions(q: string, limit = 10): Promise<TrackSuggestionResponse> {
  const trimmedQuery = q.trim();
  if (!trimmedQuery) {
    return { suggestions: [], took_ms: 0 };
  }

  const searchParams = new URLSearchParams({ q: trimmedQuery, limit: String(limit) });
  const res = await fetch(`/api/tracks/suggest?${searchParams.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch track suggestions");
  }

  return res.json();
}

export type { TrackFetchParams };
