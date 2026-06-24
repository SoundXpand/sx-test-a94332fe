import { useEffect, useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sx-sidebar-collapsed");
    if (stored === "1") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setCollapsed(c => {
      const next = !c;
      localStorage.setItem("sx-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
