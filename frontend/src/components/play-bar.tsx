"use client";

import { Slider } from "@/components/ui/slider";
import { Shuffle, SkipBack, Play, SkipForward, Repeat, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlayBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-background border-t">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left section - empty for now as per requirements */}
        <div className="w-1/3"></div>

        {/* Center section - Play controls */}
        <div className="flex flex-col items-center w-1/3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Shuffle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Play className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <SkipForward className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Repeat className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md mt-2">
            <span className="text-xs text-muted-foreground">3:36</span>
            <Slider defaultValue={[33]} max={100} step={1} className="w-full" />
            <span className="text-xs text-muted-foreground">3:57</span>
          </div>
        </div>

        {/* Right section - Volume */}
        <div className="flex items-center justify-end w-1/3 gap-2">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <Slider defaultValue={[75]} max={100} step={1} className="w-32" />
        </div>
      </div>
    </div>
  );
}
