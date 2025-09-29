import { ApiTrack, PaginatedResponse } from "./types";

export async function fetchMoreTracks(offset: number = 0, limit: number = 20): Promise<PaginatedResponse<ApiTrack>> {
  const res = await fetch(`/api/tracks?offset=${offset}&limit=${limit}`);

  if (!res.ok) {
    throw new Error("Failed to fetch more tracks");
  }

  return res.json();
}
