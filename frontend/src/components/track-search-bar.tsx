"use client";

import { ChangeEvent, KeyboardEvent } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchEntity } from "@/lib/types";

interface LibrarySearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  selectedTypes: Set<SearchEntity>;
  onToggleType: (type: SearchEntity) => void;
  isSearching?: boolean;
  activePlaylistLabel?: string | null;
  onClearPlaylist?: () => void;
  activeUserLabel?: string | null;
  onClearUser?: () => void;
}

const SEARCH_TYPE_LABELS: Record<SearchEntity, string> = {
  tracks: "Tracks",
  playlists: "Playlists",
  users: "Users",
};

export function LibrarySearchBar({
  query,
  onQueryChange,
  onSubmit,
  selectedTypes,
  onToggleType,
  isSearching = false,
  activePlaylistLabel,
  onClearPlaylist,
  activeUserLabel,
  onClearUser,
}: LibrarySearchBarProps) {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <div className="relative flex-1">
          <input
            type="search"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search tracks, playlists, or users..."
            disabled={isSearching}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-75"
            aria-label="Search library"
          />
          {isSearching && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["tracks", "playlists", "users"] as SearchEntity[]).map((type) => {
            const isActive = selectedTypes.has(type);
            return (
              <Button
                key={type}
                type="button"
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleType(type)}
                disabled={isSearching}
              >
                {SEARCH_TYPE_LABELS[type]}
              </Button>
            );
          })}
          <Button type="button" onClick={onSubmit} disabled={isSearching} className="md:ml-2">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
      {(activePlaylistLabel || activeUserLabel) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {activePlaylistLabel && (
            <Badge variant="secondary" className="flex items-center gap-2">
              Playlist: {activePlaylistLabel}
              {onClearPlaylist && (
                <button type="button" onClick={onClearPlaylist} className="text-muted-foreground hover:text-foreground">
                  ×
                </button>
              )}
            </Badge>
          )}
          {activeUserLabel && (
            <Badge variant="secondary" className="flex items-center gap-2">
              User: {activeUserLabel}
              {onClearUser && (
                <button type="button" onClick={onClearUser} className="text-muted-foreground hover:text-foreground">
                  ×
                </button>
              )}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
