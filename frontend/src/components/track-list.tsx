"use client";

import React, { useState } from "react";
import { ApiTrack } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Play, Pause, Loader2 } from "lucide-react";
import { useMusicPlayer } from "@/lib/contexts/music-player-context";

interface TrackListProps {
  tracks: ApiTrack[];
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function TrackList({ tracks }: TrackListProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const { currentTrack, isPlaying, isLoading, playTrack, togglePlayPause } = useMusicPlayer();

  const handleRowClick = (trackId: number) => {
    setSelectedTrackId((prev) => (prev === trackId ? null : trackId));
  };

  const handlePlayClick = (track: ApiTrack, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row selection

    if (currentTrack?.id === track.id) {
      // Same track - toggle play/pause
      togglePlayPause();
    } else {
      // Different track - play new track
      playTrack(track);
    }
  };

  const getPlayButtonIcon = (track: ApiTrack) => {
    const isCurrentTrack = currentTrack?.id === track.id;

    if (isCurrentTrack && isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }

    if (isCurrentTrack && isPlaying) {
      return <Pause className="h-4 w-4" />;
    }

    return <Play className="h-4 w-4" />;
  };

  return (
    <div className="rounded-md border dark:border-zinc-800 bg-card dark:bg-zinc-900">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[64px] font-medium">#</TableHead>
            <TableHead className="w-[48px] font-medium"></TableHead>
            <TableHead className="font-medium">Title</TableHead>
            <TableHead className="font-medium">Play Count</TableHead>
            <TableHead className="text-right font-medium">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.map((track, index) => {
            const isSelected = selectedTrackId === track.id;
            const isCurrentTrack = currentTrack?.id === track.id;

            return (
              <TableRow
                key={track.id}
                onClick={() => handleRowClick(track.id)}
                className={`cursor-pointer transition-colors ${
                  isSelected || isCurrentTrack ? "bg-muted hover:bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => handlePlayClick(track, e)}
                  >
                    {getPlayButtonIcon(track)}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">
                  {/* TODO: Does this ternary actually do anything? */}
                  <span className={isCurrentTrack ? "text-primary" : ""}>{track.name}</span>
                </TableCell>
                <TableCell>{track.total_play_count}</TableCell>
                <TableCell className="text-right">{formatDuration(track.duration)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
