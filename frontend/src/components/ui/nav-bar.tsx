"use client";

import { Button } from "./button";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function NavBar() {
  return (
    <nav className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">KevBot</span>
          </a>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] sm:w-[385px]">
            <div className="flex flex-col space-y-4">
              <a href="/library" className="font-medium transition-colors hover:text-primary">
                Library
              </a>
              <a href="/components" className="font-medium transition-colors hover:text-primary">
                Components
              </a>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none flex items-center justify-end">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
