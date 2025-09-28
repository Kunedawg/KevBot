import { TrackList } from "@/components/track-list";
import { ApiTrack, PaginatedResponse } from "@/lib/types";

async function getTracks(): Promise<PaginatedResponse<ApiTrack>> {
  const res = await fetch("http://localhost:3001/v1/tracks", {
    cache: "no-store", // Disable caching for now
  });

  if (!res.ok) {
    throw new Error("Failed to fetch tracks");
  }

  return res.json();
}

export default async function TracksPage() {
  const { data: tracks } = await getTracks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tracks</h1>
        <p className="text-muted-foreground">All your tracks in one place. Click on a track to play it.</p>
      </div>
      <TrackList tracks={tracks} />
    </div>
  );
}
