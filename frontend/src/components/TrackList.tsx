"use client";

// components/TrackList.tsx
import React from "react";
import { Track } from "../../public/tracks";

interface TrackListProps {
  tracks: Track[];
}

const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  return (
    <div className="track-list">
      <h2>Track List</h2>
      <ul>
        {tracks.map((track) => (
          <li key={track.id} className="track-item">
            <div>
              <strong>{track.title}</strong> by {track.artist}
            </div>
            <div>
              <span>{track.album}</span> - <span>{track.duration}</span>
            </div>
          </li>
        ))}
      </ul>
      <style jsx>{`
        .track-list {
          padding: 1rem;
        }
        .track-item {
          margin-bottom: 1rem;
          padding: 0.5rem;
          border-bottom: 1px solid #ccc;
        }
      `}</style>
    </div>
  );
};

export default TrackList;
