import { Suspense } from "react";
import { ApiTrack, PaginatedResponse } from "@/lib/types";
import { InfiniteTrackList } from "@/components/infinite-track-list";

// Server-side fetch for initial data
async function getInitialTracks(): Promise<PaginatedResponse<ApiTrack>> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const res = await fetch(`${API_BASE_URL}/v1/tracks?offset=0&limit=20`, {
    // This runs on the server, so we can add auth headers here if needed
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch tracks");
  }

  return res.json();
}

export default async function TracksPage() {
  // Initial server-side data fetch
  const { data: initialTracks, pagination } = await getInitialTracks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tracks</h1>
        <p className="text-muted-foreground">All your tracks in one place. Click on a track to play it.</p>
      </div>
      <Suspense fallback={<div>Loading tracks...</div>}>
        <InfiniteTrackList initialTracks={initialTracks} initialPagination={pagination} />
      </Suspense>
    </div>
  );
}
