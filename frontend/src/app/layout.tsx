import { ReactNode } from "react";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import "./globals.css";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-screen flex flex-col bg-background text-white">
        <NavBar />
        <div className="flex flex-1 gap-3 p-3">
          <SideBar />
          <main className="flex-1 p-4 overflow-y-auto rounded-lg bg-foreground">{children}</main>
        </div>
      </body>
    </html>
  );
}
