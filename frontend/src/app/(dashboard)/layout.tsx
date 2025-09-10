import { ReactNode } from "react";
import { NavBar } from "@/components/ui/nav-bar";
import { SideBar } from "@/components/ui/side-bar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50">
      <NavBar />
      <div className="flex-1 pt-14">
        <div className="h-[calc(100vh-56px)] flex gap-3 p-3">
          <div className="w-80 rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="h-full overflow-auto">
              <SideBar />
            </div>
          </div>
          <main className="flex-1 rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="h-full overflow-auto p-3">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
