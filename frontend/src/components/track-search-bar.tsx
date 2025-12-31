"use client";

import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-browser-client";
import { TrackSuggestion } from "@/lib/types";

interface TrackSearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => Promise<void> | void;
  isSearching?: boolean;
}

const SUGGESTION_DEBOUNCE_MS = 200;

export function TrackSearchBar({ initialQuery = "", onSearch, isSearching = false }: TrackSearchBarProps) {
  const [value, setValue] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<TrackSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!showSuggestions) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    debounceTimer.current = setTimeout(async () => {
      const query = value.trim();
      if (!query) {
        setSuggestions([]);
        return;
      }
      setIsSuggesting(true);
      try {
        const { suggestions: hits } = await api.tracks.suggest(query);
        setSuggestions(hits);
      } catch (error) {
        console.error(error);
        setSuggestions([]);
      } finally {
        setIsSuggesting(false);
      }
    }, SUGGESTION_DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [value, showSuggestions]);

  const triggerSearch = useCallback(
    async (query: string) => {
      await onSearch(query);
      setShowSuggestions(false);
    },
    [onSearch]
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setShowSuggestions(true);
  };

  const handleSubmit = async () => {
    await triggerSearch(value);
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleSubmit();
    }
    if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionMouseDown = async (suggestion: TrackSuggestion) => {
    setValue(suggestion.name);
    await triggerSearch(suggestion.name);
  };

  const handleBlur = () => {
    // Delay hiding suggestions so onMouseDown handlers can fire first.
    setTimeout(() => setShowSuggestions(false), 100);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="search"
            value={value}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Search tracks..."
            disabled={isSearching}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-75"
            aria-label="Search tracks"
          />
          {(isSuggesting || isSearching) && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
          )}
        </div>
        <Button type="button" onClick={handleSubmit} disabled={isSearching} className="px-4">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-md border bg-popover shadow-md">
          <ul className="divide-y divide-border">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted"
                  onMouseDown={async () => {
                    await handleSuggestionMouseDown(suggestion);
                  }}
                >
                  {suggestion.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
