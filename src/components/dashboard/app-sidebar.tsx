import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Disc3, Plus, BarChart3, DollarSign, Users, FileText,
  Wrench, Settings, LifeBuoy, Music, ChevronsLeft, ChevronsRight,
  ShieldCheck, ListChecks, UserCircle2, X, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/hooks/use-current-user";
import { useCurrentUser } from "@/hooks/use-current-user";

type Item = { to: string; label: string; icon: typeof Music; badge?: number };

const ROLE_NAV: Record<AppRole, Item[]> = {
  artist: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/catalog", label: "My releases", icon: Disc3 },
    { to: "/releases/new", label: "Create release", icon: Plus },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/royalties", label: "Royalties", icon: DollarSign },
    { to: "/tools", label: "Tools", icon: Wrench },
    { to: "/tools/dsp-lookup", label: "DSP lookup", icon: Search },
    { to: "/support", label: "Support", icon: LifeBuoy },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  manager: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/artists", label: "Artists", icon: UserCircle2 },
    { to: "/catalog", label: "Catalog", icon: Disc3 },
    { to: "/releases/new", label: "Create release", icon: Plus },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/royalties", label: "Royalties", icon: DollarSign },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/tools", label: "Tools", icon: Wrench },
    { to: "/tools/dsp-lookup", label: "DSP lookup", icon: Search },
    { to: "/support", label: "Support", icon: LifeBuoy },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  viewer: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/catalog", label: "Catalog", icon: Disc3 },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/tools", label: "Tools", icon: Wrench },
    { to: "/support", label: "Support", icon: LifeBuoy },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  administrator: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/releases", label: "Releases", icon: Disc3 },
    { to: "/releases/new", label: "New release", icon: Plus },
    { to: "/catalog", label: "Catalog", icon: ListChecks },
    { to: "/users", label: "Users", icon: Users },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/royalties", label: "Royalties", icon: DollarSign },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/approval-queue", label: "Approval queue", icon: ShieldCheck },
    { to: "/admin/tickets", label: "Tickets (admin)", icon: LifeBuoy },
    { to: "/tools", label: "Tools", icon: Wrench },
    { to: "/tools/dsp-lookup", label: "DSP lookup", icon: Search },
    { to: "/platform-settings", label: "Platform settings", icon: Settings },
    { to: "/support", label: "Support", icon: LifeBuoy },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
};

export function AppSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const path = useRouterState({ select: s => s.location.pathname });
  const { data } = useCurrentUser();
  const role = data?.primaryRole ?? "artist";
  const items = ROLE_NAV[role];

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onMobileClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card/60 backdrop-blur-xl transition-[width,transform] duration-200 lg:static lg:translate-x-0",
          collapsed ? "w-[68px]" : "w-64",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-3 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2 px-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Music className="h-4 w-4" />
            </div>
            {!collapsed && <span className="font-display font-semibold truncate">SoundXpand</span>}
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={onMobileClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto">
          {items.map(item => {
            const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge ? (
                  <span className="ml-auto rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3 space-y-2">
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
          {!collapsed && (
            <div className="text-[10px] text-muted-foreground leading-relaxed space-y-0.5">
              <div>© 2026 SoundXpand</div>
              <div className="flex items-center gap-1.5">
                <span>v2.0.0</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success px-1.5 py-0.5">
                  <span className="h-1 w-1 rounded-full bg-success" /> Production
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
