import { Suspense } from "react";
import { ApiTrack, PaginatedResponse } from "@/lib/types";
import { InfiniteTrackList } from "@/components/infinite-track-list";

type InitialTrackParams = {
  q?: string;
  name?: string;
  search_mode?: string;
  sort?: string;
  order?: string;
  include_deleted?: string;
};

// Server-side fetch for initial data
async function getInitialTracks(params: InitialTrackParams): Promise<PaginatedResponse<ApiTrack>> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const url = new URL(`${API_BASE_URL}/v1/tracks`);
  url.searchParams.set("offset", "0");
  url.searchParams.set("limit", "20");

  if (params.name) {
    url.searchParams.set("name", params.name);
  }

  if (params.q) {
    url.searchParams.set("q", params.q);
    url.searchParams.set("sort", params.sort ?? "relevance");
    url.searchParams.set("search_mode", params.search_mode ?? "fulltext");
  } else {
    if (params.sort) {
      url.searchParams.set("sort", params.sort);
    }
    if (params.search_mode) {
      url.searchParams.set("search_mode", params.search_mode);
    }
  }

  if (params.order) {
    url.searchParams.set("order", params.order);
  }

  if (params.include_deleted) {
    url.searchParams.set("include_deleted", params.include_deleted);
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
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const queryParam = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const sortParam = typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const orderParam = typeof searchParams.order === "string" ? searchParams.order : undefined;
  const searchModeParam = typeof searchParams.search_mode === "string" ? searchParams.search_mode : undefined;
  const includeDeletedParam = typeof searchParams.include_deleted === "string" ? searchParams.include_deleted : undefined;
  const nameParam = typeof searchParams.name === "string" ? searchParams.name : undefined;

  const { data: initialTracks, pagination } = await getInitialTracks({
    q: queryParam,
    sort: sortParam,
    order: orderParam,
    search_mode: searchModeParam,
    include_deleted: includeDeletedParam,
    name: nameParam,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tracks</h1>
        <p className="text-muted-foreground">All your tracks in one place. Click on a track to play it.</p>
      </div>
      <Suspense fallback={<div>Loading tracks...</div>}>
        <InfiniteTrackList
          initialTracks={initialTracks}
          initialPagination={pagination}
          initialQuery={queryParam}
        />
      </Suspense>
    </div>
  );
}
