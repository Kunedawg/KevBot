"use client";

import { ThemeToggle } from "./theme-toggle";

export function NavBar() {
  return (
    <nav className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 justify-between items-center gap-4 px-4">
        <a href="/" className="font-bold">
          KevBot
        </a>
        <ThemeToggle />
      </div>
    </nav>
  );
}
