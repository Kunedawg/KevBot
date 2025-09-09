"use client";

import React from "react";
import { TrackList } from "@/components/ui/track-list";
import tracks from "../../public/tracks";

export default function HomePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tracks</h2>
      </div>
      <div className="h-full">
        <TrackList tracks={tracks} />
      </div>
    </div>
  );
}
