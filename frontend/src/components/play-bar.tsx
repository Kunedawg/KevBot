"use client";

import { Slider } from "@/components/ui/slider";
import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusicPlayer } from "@/lib/contexts/music-player-context";

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function PlayBar() {
  const { currentTrack, isPlaying, currentTime, duration, volume, isLoading, togglePlayPause, seekTo, setVolume } =
    useMusicPlayer();

  const handleProgressChange = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    seekTo(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-background border-t">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left section - Current track info */}
        <div className="w-1/3">
          {currentTrack && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                <span className="text-xs font-medium">♪</span>
              </div>
              <div>
                <p className="font-medium text-sm truncate max-w-48">{currentTrack.name}</p>
                <p className="text-xs text-muted-foreground">Track</p>
              </div>
            </div>
          )}
        </div>

        {/* Center section - Play controls */}
        <div className="flex flex-col items-center w-1/3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Shuffle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={togglePlayPause}
              disabled={!currentTrack || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Repeat className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md mt-2">
            <span className="text-xs text-muted-foreground min-w-[35px]">{formatTime(currentTime)}</span>
            <Slider
              value={[progressPercentage]}
              onValueChange={handleProgressChange}
              max={100}
              step={0.1}
              className="w-full"
              disabled={!currentTrack || duration === 0}
            />
            <span className="text-xs text-muted-foreground min-w-[35px]">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right section - Volume */}
        <div className="flex items-center justify-end w-1/3 gap-2">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <Slider value={[volume * 100]} onValueChange={handleVolumeChange} max={100} step={1} className="w-32" />
        </div>
      </div>
    </div>
  );
}
