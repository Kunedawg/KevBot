import { Suspense } from "react";
import { ApiTrack, PaginatedResponse } from "@/lib/types";
import { InfiniteTrackList } from "@/components/infinite-track-list";

type InitialTrackHybridParams = {
  q?: string;
};

// Server-side fetch for initial data
async function getInitialTracks(params: InitialTrackHybridParams): Promise<PaginatedResponse<ApiTrack>> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const url = new URL(`${API_BASE_URL}/v1/tracks`);
  url.searchParams.set("offset", "0");
  url.searchParams.set("limit", "20");

  if (params.q) {
    url.searchParams.set("q", params.q);
    url.searchParams.set("search_mode", "hybrid");
  } else {
    url.searchParams.set("sort", "name");
    url.searchParams.set("order", "asc");
  }

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch tracks");
  }

  return res.json();
}

export default async function TracksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;

  const queryParam = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : undefined;

  const { data: initialTracks, pagination } = await getInitialTracks({
    q: queryParam,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tracks</h1>
        <p className="text-muted-foreground">All your tracks in one place. Click on a track to play it.</p>
      </div>
      <Suspense fallback={<div>Loading tracks...</div>}>
        <InfiniteTrackList initialTracks={initialTracks} initialPagination={pagination} initialQuery={queryParam} />
      </Suspense>
    </div>
  );
}
