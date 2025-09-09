"use client";

// pages/tracks.tsx
import React from "react";
import TrackList from "../components/TrackList";
import tracks from "../../public/tracks";

const TracksPage: React.FC = () => {
  return (
    <div>
      <TrackList tracks={tracks} />
    </div>
  );
};

export default TracksPage;
