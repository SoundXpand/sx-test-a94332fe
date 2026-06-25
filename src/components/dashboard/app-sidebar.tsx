import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Disc3, Plus, BarChart3, DollarSign, Users, FileText,
  Wrench, Settings, LifeBuoy, Music, ChevronsLeft, ChevronsRight,
  ShieldCheck, UserCircle2, X, Receipt, LogOut, FileEdit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/hooks/use-current-user";
import { useCurrentUser, displayRoleLabel } from "@/hooks/use-current-user";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { BrandLogo } from "@/components/branding/brand-logo";

type Item = { to: string; label: string; icon: typeof Music; badge?: number };

const STAFF_NAV: Item[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/releases", label: "Releases", icon: Disc3 },
  { to: "/users", label: "Users", icon: Users },
  { to: "/accounting", label: "Accounting", icon: Receipt },
  { to: "/royalties", label: "Royalties", icon: DollarSign },
  { to: "/admin/broadcast", label: "Broadcast", icon: ShieldCheck },
  { to: "/admin/pages", label: "Pages", icon: FileEdit },
  { to: "/admin/tickets", label: "Tickets", icon: LifeBuoy },
];

const ROLE_NAV: Record<AppRole, Item[]> = {
  artist: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/catalog", label: "My releases", icon: Disc3 },
    { to: "/releases/new", label: "Create release", icon: Plus },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/royalties", label: "Royalties", icon: DollarSign },
    { to: "/tools", label: "Tools", icon: Wrench },
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
    { to: "/support", label: "Support", icon: LifeBuoy },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  viewer: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/catalog", label: "Catalog", icon: Disc3 },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/support", label: "Support", icon: LifeBuoy },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  administrator: [
    ...STAFF_NAV,
    { to: "/platform-settings", label: "Platform settings", icon: Settings },
    { to: "/settings", label: "Settings", icon: Settings },
  ],
  sx_manager: [
    ...STAFF_NAV,
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
  const navigate = useNavigate();
  const qc = useQueryClient();
  const profile: any = data?.profile;
  const displayName = profile?.display_name || profile?.artist_name || profile?.full_name || profile?.username || "Account";
  const initials = displayName.split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();

  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onMobileClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card/60 backdrop-blur-xl transition-[width,transform] duration-200",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shrink-0",
          collapsed ? "w-[68px]" : "w-64",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-3 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2 px-2 min-w-0">
            <BrandLogo height={26} className={collapsed ? "" : ""} />
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

        <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur p-2 space-y-1.5">
          {/* User chip */}
          <Link
            to="/profile"
            onClick={onMobileClose}
            title={collapsed ? displayName : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/60 transition",
              collapsed && "justify-center"
            )}
          >
            <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-primary/40 to-fuchsia-500/40 text-white grid place-items-center text-[11px] font-semibold overflow-hidden">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{displayName}</div>
                <div className="text-[10px] text-muted-foreground truncate">{roleLabel(role)}</div>
              </div>
            )}
          </Link>

          <div className={cn("flex gap-1", collapsed && "flex-col")}>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition flex-1"
              )}
            >
              <LogOut className="h-3.5 w-3.5" />
              {!collapsed && <span>Sign out</span>}
            </button>
            <button
              onClick={onToggleCollapse}
              title={collapsed ? "Expand" : "Collapse"}
              className="hidden lg:flex items-center justify-center rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition"
            >
              {collapsed ? <ChevronsRight className="h-3.5 w-3.5" /> : <ChevronsLeft className="h-3.5 w-3.5" />}
            </button>
          </div>

          {!collapsed && (
            <div className="text-[10px] text-muted-foreground leading-relaxed px-2 pt-1.5 border-t border-border/60 space-y-1">
              <div className="flex gap-3">
                <Link to="/legal/terms" className="hover:text-foreground">Terms</Link>
                <Link to="/legal/privacy" className="hover:text-foreground">Privacy</Link>
                <Link to="/support" className="hover:text-foreground">Help</Link>
              </div>
              <div className="flex items-center justify-between">
                <span>© 2026 SoundXpand</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
