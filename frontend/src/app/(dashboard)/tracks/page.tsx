import { TrackList } from "@/components/track-list";
import tracks from "../../../../public/tracks";

export default function TracksPage() {
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
