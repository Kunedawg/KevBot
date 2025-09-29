"use client";

import { useState } from "react";
import { TrackList } from "@/components/track-list";
import { ApiTrack, PaginatedResponse } from "@/lib/types";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { fetchMoreTracks } from "@/lib/api";

interface InfiniteTrackListProps {
  initialTracks: ApiTrack[];
  initialPagination: PaginatedResponse<ApiTrack>["pagination"];
}

export function InfiniteTrackList({ initialTracks, initialPagination }: InfiniteTrackListProps) {
  const [tracks, setTracks] = useState<ApiTrack[]>(initialTracks);
  const [hasMore, setHasMore] = useState(initialPagination.hasNext);
  const [error, setError] = useState<string | null>(null);

  const loadMoreTracks = async () => {
    try {
      const response = await fetchMoreTracks(tracks.length);
      setTracks((prev) => [...prev, ...response.data]);
      setHasMore(response.pagination.hasNext);
    } catch (err) {
      setError("Failed to load more tracks");
      console.error(err);
    }
  };

  const { targetRef, isLoadingRef } = useInfiniteScroll(loadMoreTracks, {
    threshold: 0.1,
    rootMargin: "200px",
  });

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <>
      <TrackList tracks={tracks} />
      {isLoadingRef.current && <div className="py-4 text-center text-muted-foreground">Loading more tracks...</div>}
      {!isLoadingRef.current && hasMore && <div ref={targetRef} className="h-10" />}
      {!hasMore && tracks.length > 0 && (
        <div className="py-4 text-center text-muted-foreground">No more tracks to load</div>
      )}
    </>
  );
}
