"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TrackList } from "@/components/track-list";
import { TrackSearchBar } from "@/components/track-search-bar";
import { ApiTrack, PaginatedResponse } from "@/lib/types";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { fetchTracks } from "@/lib/api";

interface InfiniteTrackListProps {
  initialTracks: ApiTrack[];
  initialPagination: PaginatedResponse<ApiTrack>["pagination"];
  initialQuery?: string;
}

const DEFAULT_LIMIT = 20;

export function InfiniteTrackList({ initialTracks, initialPagination, initialQuery = "" }: InfiniteTrackListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tracks, setTracks] = useState<ApiTrack[]>(initialTracks);
  const [hasMore, setHasMore] = useState(initialPagination.hasNext);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);

  const pageSize = initialPagination.limit ?? DEFAULT_LIMIT;

  const updateRoute = useCallback(
    (nextQuery: string) => {
      const currentParams = new URLSearchParams(searchParams?.toString() ?? "");
      if (nextQuery) {
        currentParams.set("q", nextQuery);
      } else {
        currentParams.delete("q");
      }

      const queryString = currentParams.toString();
      const nextPath = queryString ? `/tracks?${queryString}` : "/tracks";
      router.replace(nextPath, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(
    async (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      setIsSearching(true);
      setError(null);
      try {
        const response = await fetchTracks({
          q: trimmed || undefined,
          offset: 0,
          limit: pageSize,
          sort: trimmed ? "relevance" : "created_at",
          search_mode: trimmed ? "hybrid" : undefined,
        });
        setTracks(response.data);
        setHasMore(response.pagination.hasNext);
        setQuery(trimmed);
        updateRoute(trimmed);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch tracks");
      } finally {
        setIsSearching(false);
      }
    },
    [pageSize, updateRoute]
  );

  const loadMoreTracks = useCallback(async () => {
    if (!hasMore || isSearching) return;
    try {
      const response = await fetchTracks({
        q: query || undefined,
        offset: tracks.length,
        limit: pageSize,
        sort: query ? "relevance" : "created_at",
        search_mode: query ? "hybrid" : undefined,
      });
      setTracks((prev) => [...prev, ...response.data]);
      setHasMore(response.pagination.hasNext);
    } catch (err) {
      console.error(err);
      setError("Failed to load more tracks");
    }
  }, [hasMore, isSearching, pageSize, query, tracks.length]);

  const { targetRef, isLoadingRef } = useInfiniteScroll(loadMoreTracks, {
    threshold: 0.1,
    rootMargin: "200px",
    disabled: isSearching || !hasMore,
  });

  return (
    <div className="space-y-4">
      <TrackSearchBar initialQuery={query} onSearch={handleSearch} isSearching={isSearching} />
      {error && <div className="text-red-500">{error}</div>}
      {tracks.length === 0 && !isSearching ? (
        <div className="py-10 text-center text-muted-foreground">No tracks found</div>
      ) : (
        <>
          <TrackList tracks={tracks} />
          {isSearching && <div className="py-4 text-center text-muted-foreground">Searching...</div>}
          {isLoadingRef.current && !isSearching && (
            <div className="py-4 text-center text-muted-foreground">Loading more tracks...</div>
          )}
          {!isLoadingRef.current && hasMore && !isSearching && <div ref={targetRef} className="h-10" />}
          {!hasMore && tracks.length > 0 && !isSearching && (
            <div className="py-4 text-center text-muted-foreground">No more tracks to load</div>
          )}
        </>
      )}
    </div>
  );
}
