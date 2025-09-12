"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for playlists - in real app this would come from your API
const MOCK_PLAYLISTS = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Playlist ${i + 1}`,
  trackCount: ((i % 10) + 1) * 3, // Deterministic track count between 3 and 30
}));

export function SideBar() {
  return (
    <div className="hidden bg-transparent md:block md:w-60 lg:w-72">
      <div className="flex h-full flex-col">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Playlists</h2>
        </div>
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 p-2">
            {MOCK_PLAYLISTS.map((playlist) => (
              <button
                key={playlist.id}
                className="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{playlist.name}</span>
                  <span className="text-xs text-muted-foreground">{playlist.trackCount} tracks</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
