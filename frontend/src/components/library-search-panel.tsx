"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api-browser-client";
import { LibrarySearchBar } from "@/components/track-search-bar";
import { TrackList } from "@/components/track-list";
import { ApiUser, SearchEntity, UnifiedSearchResponse } from "@/lib/types";
import { useLibraryFilters } from "@/lib/contexts/library-filters-context";
import { useAuth } from "@/lib/contexts/auth-context";
import { Badge } from "@/components/ui/badge";

const DEFAULT_LIMITS = {
  tracks: 20,
  playlists: 10,
  users: 10,
} as const;

export function LibrarySearchPanel() {
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<SearchEntity[]>(["tracks", "playlists", "users"]);
  const [results, setResults] = useState<UnifiedSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryRef = useRef(query);
  const typesRef = useRef<SearchEntity[]>(selectedTypes);

  const {
    selectedPlaylist,
    setSelectedPlaylist,
    clearSelectedPlaylist,
    selectedUser,
    setSelectedUser,
    clearSelectedUser,
  } = useLibraryFilters();
  const { user } = useAuth();

  const selectedTypesSet = useMemo(() => new Set<SearchEntity>(selectedTypes), [selectedTypes]);

  const runSearch = useCallback(
    async (effectiveQuery: string, effectiveTypes: SearchEntity[]) => {
      setIsSearching(true);
      setError(null);
      try {
        const response = await api.search.unified({
          q: effectiveQuery,
          types: effectiveTypes,
          playlistId: selectedPlaylist?.id ?? undefined,
          userId: selectedUser?.id ?? undefined,
          limits: {
            tracks: DEFAULT_LIMITS.tracks,
            playlists: DEFAULT_LIMITS.playlists,
            users: DEFAULT_LIMITS.users,
          },
        });
        setResults(response);
      } catch (err) {
        console.error("Search failed", err);
        setError("Unable to perform search. Please try again.");
        setResults(null);
      } finally {
        setIsSearching(false);
      }
    },
    [selectedPlaylist?.id, selectedUser?.id]
  );

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    typesRef.current = selectedTypes;
  }, [selectedTypes]);

  useEffect(() => {
    void runSearch(queryRef.current, typesRef.current);
  }, [runSearch]);

  const handleSearch = useCallback(async () => {
    await runSearch(query, selectedTypes);
  }, [query, runSearch, selectedTypes]);

  const handleToggleType = useCallback(
    async (type: SearchEntity) => {
      setSelectedTypes((prev) => {
        const hasType = prev.includes(type);
        if (hasType) {
          if (prev.length === 1) return prev; // ensure at least one type remains active
          const next = prev.filter((entry) => entry !== type);
          void runSearch(query, next);
          return next;
        }
        const next = [...prev, type];
        void runSearch(query, next);
        return next;
      });
    },
    [query, runSearch]
  );

  const handleSelectUser = (userResult: ApiUser) => {
    if (selectedUser?.id === userResult.id) {
      clearSelectedUser();
    } else {
      setSelectedUser({
        id: userResult.id,
        discordId: userResult.discord_id,
        displayName: userResult.discord_username ?? userResult.discord_id,
      });
    }
  };

  const playlistLabel = selectedPlaylist?.name ?? null;
  const userLabel = selectedUser
    ? selectedUser.id === user?.id
      ? "My uploads"
      : selectedUser.displayName ?? selectedUser.discordId
    : null;

  const trackItems = results?.tracks.items ?? [];
  const playlistItems = results?.playlists.items ?? [];
  const userItems = results?.users.items ?? [];

  const totalTracks = results?.tracks.pagination.total ?? 0;
  const totalPlaylists = results?.playlists.total ?? 0;
  const totalUsers = results?.users.total ?? 0;

  return (
    <div className="space-y-6">
      <LibrarySearchBar
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleSearch}
        selectedTypes={selectedTypesSet}
        onToggleType={handleToggleType}
        isSearching={isSearching}
        activePlaylistLabel={playlistLabel}
        onClearPlaylist={playlistLabel ? clearSelectedPlaylist : undefined}
        activeUserLabel={userLabel}
        onClearUser={userLabel ? clearSelectedUser : undefined}
      />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {!error && (
        <div className="space-y-8">
          {selectedTypesSet.has("tracks") && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Tracks</h2>
                <span className="text-sm text-muted-foreground">
                  {totalTracks} result{totalTracks === 1 ? "" : "s"}
                </span>
              </div>
              {isSearching && trackItems.length === 0 ? (
                <div className="rounded-md border px-4 py-8 text-center text-muted-foreground">Searching tracks...</div>
              ) : trackItems.length === 0 ? (
                <div className="rounded-md border px-4 py-8 text-center text-muted-foreground">
                  {query ? "No tracks match your search." : "No tracks available yet."}
                </div>
              ) : (
                <TrackList tracks={trackItems} />
              )}
            </section>
          )}

          {selectedTypesSet.has("playlists") && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Playlists</h2>
                <span className="text-sm text-muted-foreground">
                  {totalPlaylists} result{totalPlaylists === 1 ? "" : "s"}
                </span>
              </div>
              {isSearching && playlistItems.length === 0 ? (
                <div className="rounded-md border px-4 py-8 text-center text-muted-foreground">
                  Searching playlists...
                </div>
              ) : playlistItems.length === 0 ? (
                <div className="rounded-md border px-4 py-8 text-center text-muted-foreground">
                  {query ? "No playlists match your search." : "No playlists available yet."}
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {playlistItems.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="rounded-lg border p-3 shadow-sm transition-colors hover:border-primary cursor-pointer"
                      onClick={() => {
                        if (selectedPlaylist?.id === playlist.id) {
                          clearSelectedPlaylist();
                        } else {
                          setSelectedPlaylist({ id: playlist.id, name: playlist.name });
                        }
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-medium">{playlist.name}</h3>
                        {selectedPlaylist?.id === playlist.id && <Badge variant="secondary">Selected</Badge>}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Created by user #{playlist.user_id} · Updated{" "}
                        {new Date(playlist.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {selectedTypesSet.has("users") && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Users</h2>
                <span className="text-sm text-muted-foreground">
                  {totalUsers} result{totalUsers === 1 ? "" : "s"}
                </span>
              </div>
              {isSearching && userItems.length === 0 ? (
                <div className="rounded-md border px-4 py-8 text-center text-muted-foreground">Searching users...</div>
              ) : userItems.length === 0 ? (
                <div className="rounded-md border px-4 py-8 text-center text-muted-foreground">
                  {query ? "No users match your search." : "No users available yet."}
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {userItems.map((userResult) => {
                    const isSelected = selectedUser?.id === userResult.id;
                    return (
                      <button
                        key={userResult.id}
                        type="button"
                        onClick={() => handleSelectUser(userResult)}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          isSelected ? "border-primary bg-primary/10" : "hover:border-primary"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h3 className="font-medium">
                              {userResult.discord_username ?? (
                                <span className="text-muted-foreground">Unknown user</span>
                              )}
                            </h3>
                            <p className="text-xs text-muted-foreground">Discord ID: {userResult.discord_id}</p>
                          </div>
                          {isSelected && <Badge variant="secondary">Selected</Badge>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
