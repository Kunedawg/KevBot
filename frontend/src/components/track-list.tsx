"use client";

import React, { useState } from "react";
import { Track } from "../../public/tracks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TrackListProps {
  tracks: Track[];
}

export function TrackList({ tracks }: TrackListProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);

  const handleRowClick = (trackId: number) => {
    setSelectedTrackId((prev) => (prev === trackId ? null : trackId));
  };

  return (
    <div className="rounded-md border dark:border-zinc-800 bg-card dark:bg-zinc-900">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[64px] font-medium">#</TableHead>
            <TableHead className="font-medium">Title</TableHead>
            <TableHead className="font-medium">Play Count</TableHead>
            <TableHead className="text-right font-medium">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.map((track, index) => {
            const isSelected = selectedTrackId === track.id;
            return (
              <TableRow
                key={track.id}
                onClick={() => handleRowClick(track.id)}
                className={`cursor-pointer transition-colors ${
                  isSelected ? "bg-muted hover:bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{track.title}</TableCell>
                <TableCell>{track.playCount}</TableCell>
                <TableCell className="text-right">{track.duration}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
