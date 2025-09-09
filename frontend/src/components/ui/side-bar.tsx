"use client";

import Link from "next/link";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";
import { Library, Home, LayoutGrid } from "lucide-react";

export function SideBar() {
  return (
    <div className="hidden border-r bg-background md:block w-[300px]">
      <ScrollArea className="h-full py-6">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                href="/library"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent"
              >
                <Library className="h-4 w-4" />
                Library
              </Link>
              <Link
                href="/components"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent"
              >
                <LayoutGrid className="h-4 w-4" />
                Components
              </Link>
            </div>
          </div>
          <Separator className="my-4" />
          {/* Add more sections here */}
        </div>
      </ScrollArea>
    </div>
  );
}
