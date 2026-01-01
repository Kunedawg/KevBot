"use client";
// TODO: delete this component

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TrackList } from "@/components/track-list";
import { TrackSearchBar } from "@/components/track-search-bar";
import { ApiTrack } from "@/lib/types";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { api } from "@/lib/api-browser-client";

const DEFAULT_LIMIT = 20;

export function InfiniteTrackList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = useMemo(() => (searchParams?.get("q") ?? "").trim(), [searchParams]);

  const [tracks, setTracks] = useState<ApiTrack[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(queryFromUrl);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const lastHandledQueryRef = useRef<string | null>(null);

  const updateRoute = useCallback(
    (nextQuery: string) => {
      const currentParams = new URLSearchParams(searchParams?.toString() ?? "");
      const trimmed = nextQuery.trim();
      if (trimmed) {
        currentParams.set("q", trimmed);
      } else {
        currentParams.delete("q");
      }
      const queryString = currentParams.toString();
      const nextPath = queryString ? `/tracks?${queryString}` : "/tracks";
      router.replace(nextPath, { scroll: false });
    },
    [router, searchParams]
  );

  const fetchTracksPage = useCallback(async (offset: number, search: string) => {
    const trimmed = search.trim();
    const response = await api.tracks.fetch({
      q: trimmed || undefined,
      offset,
      limit: DEFAULT_LIMIT,
      sort: trimmed ? undefined : "name",
      search_mode: trimmed ? "hybrid" : undefined,
      order: trimmed ? undefined : "asc",
    });
    return response;
  }, []);

  useEffect(() => {
    const normalized = queryFromUrl;

    if (lastHandledQueryRef.current === normalized) {
      lastHandledQueryRef.current = null;
      return;
    }

    let cancelled = false;
    setIsInitialLoading(true);
    setError(null);

    (async () => {
      try {
        const response = await fetchTracksPage(0, normalized);
        if (cancelled) return;
        setTracks(response.data);
        setHasMore(response.pagination.hasNext);
        setQuery(normalized);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError("Failed to fetch tracks");
        setTracks([]);
        setHasMore(false);
      } finally {
        if (!cancelled) {
          setIsInitialLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchTracksPage, queryFromUrl]);

  const handleSearch = useCallback(
    async (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      setIsSearching(true);
      setError(null);

      try {
        const response = await fetchTracksPage(0, trimmed);
        setTracks(response.data);
        setHasMore(response.pagination.hasNext);
        setQuery(trimmed);
        lastHandledQueryRef.current = trimmed;
        updateRoute(trimmed);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch tracks");
        setHasMore(false);
      } finally {
        setIsSearching(false);
        setIsInitialLoading(false);
      }
    },
    [fetchTracksPage, updateRoute]
  );

  const loadMoreTracks = useCallback(async () => {
    if (!hasMore || isInitialLoading || isSearching) return;
    try {
      const response = await fetchTracksPage(tracks.length, query);
      setTracks((prev) => [...prev, ...response.data]);
      setHasMore(response.pagination.hasNext);
    } catch (err) {
      console.error(err);
      setError("Failed to load more tracks");
    }
  }, [fetchTracksPage, hasMore, isInitialLoading, isSearching, query, tracks.length]);

  const { targetRef, isLoadingRef } = useInfiniteScroll(loadMoreTracks, {
    threshold: 0.1,
    rootMargin: "200px",
    disabled: isInitialLoading || isSearching || !hasMore,
  });

  const isLoading = (isInitialLoading && tracks.length === 0) || isSearching;

  return (
    <div className="space-y-4">
      <TrackSearchBar initialQuery={query} onSearch={handleSearch} isSearching={isSearching} />
      {error && <div className="text-red-500">{error}</div>}
      {tracks.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          {isLoading ? "Loading tracks..." : "No tracks found"}
        </div>
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
