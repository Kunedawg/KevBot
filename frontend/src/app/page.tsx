"use client";

// pages/tracks.tsx
import React from "react";
import TrackList from "../components/TrackList";
import tracks from "../../public/tracks";

const TracksPage: React.FC = () => {
  return (
    <div>
      <h1>Spotify Clone</h1>
      <TrackList tracks={tracks} />
      <style jsx>{`
        div {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        h1 {
          text-align: center;
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  );
};

export default TracksPage;
