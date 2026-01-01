"use client";

import { LibrarySearchPanel } from "@/components/library-search-panel";

export default function TracksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground">
          Browse and search tracks, playlists, and users. Select filters on the left to narrow results or jump to your
          uploads.
        </p>
      </div>
      <LibrarySearchPanel />
    </div>
  );
}
