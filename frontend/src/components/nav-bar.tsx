"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginButton } from "@/components/login-button";

export function NavBar() {
  return (
    <nav className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 justify-between items-center gap-4 px-4">
        <Link href="/" className="font-bold">
          KevBot
        </Link>
        <div className="flex items-center gap-2">
          <LoginButton />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
