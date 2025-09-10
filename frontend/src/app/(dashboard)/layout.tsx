import { ReactNode } from "react";
import { NavBar } from "@/components/ui/nav-bar";
import { SideBar } from "@/components/ui/side-bar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <NavBar />
      <div className="flex-1 flex pt-14">
        <SideBar />
        <main className="flex-1 overflow-auto px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
