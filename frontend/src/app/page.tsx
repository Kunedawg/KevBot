"use client";

import React from "react";
import { TrackList } from "@/components/ui/track-list";
import tracks from "../../public/tracks";

export default function HomePage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tracks</h2>
      </div>
      <TrackList tracks={tracks} />
    </div>
  );
}
