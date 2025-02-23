// components/Layout.tsx
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
      <body className="h-screen flex flex-col bg-primary">
        <NavBar />
        <div className="flex flex-1 gap-3 p-3">
          <SideBar />
          <main className="flex-1 bg-secondary text-white p-4 overflow-y-auto rounded-lg">{children}</main>
        </div>
      </body>
    </html>
  );
}
