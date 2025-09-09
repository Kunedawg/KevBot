import { ReactNode } from "react";
import { NavBar } from "@/components/ui/nav-bar";
import { SideBar } from "@/components/ui/side-bar";
import "./globals.css";

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background">
        <div className="relative flex min-h-screen flex-col">
          <NavBar />
          <div className="flex-1 flex">
            <SideBar />
            <main className="flex-1 flex-col">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
