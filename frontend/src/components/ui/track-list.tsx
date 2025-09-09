"use client";

import React, { useState } from "react";
import { Track } from "../../../public/tracks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

interface TrackListProps {
  tracks: Track[];
}

export function TrackList({ tracks }: TrackListProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);

  const handleRowClick = (trackId: number) => {
    setSelectedTrackId((prev) => (prev === trackId ? null : trackId));
  };

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Play Count</TableHead>
              <TableHead className="text-right">Duration (s)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tracks.map((track, index) => {
              const isSelected = selectedTrackId === track.id;
              return (
                <TableRow
                  key={track.id}
                  onClick={() => handleRowClick(track.id)}
                  className={`cursor-pointer ${isSelected ? "bg-muted hover:bg-muted" : "hover:bg-muted/50"}`}
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{track.title}</TableCell>
                  <TableCell>{track.playCount}</TableCell>
                  <TableCell className="text-right">{track.duration}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
