import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  Search,
  Bell,
  Plus,
  LogOut,
  User,
  Settings as SettingsIcon,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser, displayRoleLabel } from "@/hooks/use-current-user";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  catalog: "Catalog",
  releases: "Releases",
  new: "New release",
  analytics: "Analytics",
  royalties: "Royalties",
  users: "Users",
  reports: "Reports",
  tools: "Tools",
  settings: "Settings",
  support: "Support",
  artists: "Artists",
  "approval-queue": "Approval queue",
  "platform-settings": "Platform settings",
  profile: "Profile",
  help: "Help center",
};

type NavItem = { label: string; to: string; group: string; keywords?: string };
const NAV_INDEX: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", group: "Pages" },
  { label: "Catalog", to: "/catalog", group: "Pages" },
  { label: "Releases", to: "/releases", group: "Pages" },
  { label: "New release", to: "/releases/new", group: "Pages" },
  { label: "Analytics", to: "/analytics", group: "Pages" },
  { label: "Accounting", to: "/accounting", group: "Pages" },
  { label: "Royalties", to: "/royalties", group: "Pages" },
  { label: "Users", to: "/users", group: "Pages" },
  { label: "Reports", to: "/reports", group: "Pages" },
  { label: "Tools", to: "/tools", group: "Pages" },
  { label: "Artists", to: "/artists", group: "Pages" },
  { label: "Tickets (admin)", to: "/admin/tickets", group: "Pages" },
  { label: "Broadcast (admin)", to: "/admin/broadcast", group: "Pages" },
  { label: "Profile", to: "/profile", group: "Settings" },
  { label: "Account settings", to: "/settings", group: "Settings", keywords: "preferences theme password payout" },
  { label: "Platform settings", to: "/platform-settings", group: "Settings" },
  { label: "Help center", to: "/help", group: "Support" },
  { label: "Support tickets", to: "/support", group: "Support" },
  { label: "Terms", to: "/legal/terms", group: "Legal" },
  { label: "Privacy", to: "/legal/privacy", group: "Legal" },
];

function useBreadcrumbs() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return useMemo(() => {
    const parts = path.split("/").filter(Boolean);
    return parts.map((p, i) => ({
      label: LABELS[p] ?? p,
      to: "/" + parts.slice(0, i + 1).join("/"),
    }));
  }, [path]);
}

export function Topbar({ onOpenMobileSidebar }: { onOpenMobileSidebar: () => void }) {
  const crumbs = useBreadcrumbs();
  const { data } = useCurrentUser();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ nav: NavItem[]; tickets: any[] }>({ nav: NAV_INDEX, tickets: [] });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const query = q.trim().toLowerCase();
    if (!query) {
      setResults({ nav: NAV_INDEX, tickets: [] });
      return;
    }
    const nav = NAV_INDEX.filter(
      (n) =>
        n.label.toLowerCase().includes(query) ||
        n.to.toLowerCase().includes(query) ||
        (n.keywords ?? "").toLowerCase().includes(query),
    );
    if (query.length < 15) {
      setResults({ nav, tickets: [] });
      return;
    }
    const t = setTimeout(async () => {
      const { data: tk } = await supabase
        .from("support_tickets")
        .select("id,subject,status")
        .ilike("subject", `%${q}%`)
        .limit(5);
      setResults({ nav, tickets: tk ?? [] });
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const initials = (data?.profile?.full_name || data?.user?.email || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-3 lg:px-6">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobileSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

        <nav className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
          {crumbs.map((c, i) => (
            <span key={c.to} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <span className="text-muted-foreground/50">/</span>}
              {i === crumbs.length - 1 ? (
                <span className="text-foreground font-medium truncate">{c.label}</span>
              ) : (
                <Link to={c.to} className="hover:text-foreground truncate">
                  {c.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <button
          onClick={() => setSearchOpen(true)}
          className="ml-auto flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 transition-colors min-w-[180px] lg:min-w-[320px]"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search releases, pages, settings…</span>
          <kbd className="ml-auto hidden lg:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationsBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="Quick actions">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  navigate({
                    to:
                      data?.primaryRole === "administrator" || data?.primaryRole === "sx_manager"
                        ? "/releases"
                        : "/releases/new",
                  })
                }
              >
                {data?.primaryRole === "administrator" || data?.primaryRole === "sx_manager"
                  ? "Manage releases"
                  : "New release"}
              </DropdownMenuItem>
              {data?.primaryRole === "administrator" && (
                <DropdownMenuItem onClick={() => navigate({ to: "/users" })}>Manage users</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate({ to: "/analytics" })}>View analytics</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex items-center gap-2 rounded-lg border border-border bg-card/60 px-2 py-1 hover:bg-muted/60 transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold">{data?.profile?.full_name || data?.user?.email}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {data && displayRoleLabel(data.primaryRole, (data.profile as any)?.role_type)} ·{" "}
                    {data?.profile?.username}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">{data?.profile?.full_name || "—"}</span>
                  <span className="text-xs text-muted-foreground">
                    {data && displayRoleLabel(data.primaryRole, (data.profile as any)?.role_type)} ·{" "}
                    {data?.profile?.username}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                <SettingsIcon className="h-4 w-4 mr-2" />
                Account settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/help" })}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Help center
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search tabs, pages, settings, support…" value={q} onValueChange={setQ} />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>
          {(["Pages", "Settings", "Support", "Legal"] as const).map((group) => {
            const items = results.nav.filter((n) => n.group === group);
            if (items.length === 0) return null;
            return (
              <CommandGroup key={group} heading={group}>
                {items.map((n) => (
                  <CommandItem
                    key={n.to}
                    onSelect={() => {
                      setSearchOpen(false);
                      navigate({ to: n.to as any });
                    }}
                  >
                    <span>{n.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{n.to}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
          {results.tickets.length > 0 && (
            <CommandGroup heading="Support tickets">
              {results.tickets.map((t) => (
                <CommandItem
                  key={t.id}
                  onSelect={() => {
                    setSearchOpen(false);
                    navigate({ to: "/support" });
                  }}
                >
                  {t.subject} <span className="ml-auto text-xs text-muted-foreground">{t.status}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

function Disc3Icon() {
  return <span className="h-4 w-4 mr-2 rounded-full border border-current" />;
}

function NotificationsBell() {
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const load = async () => {
    const { data } = await supabase
      .from("notifications" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);
    const list = (data as any[]) ?? [];
    setItems(list);
    const cur = Number(localStorage.getItem("sx-bcast-last-seen") || "0");
    setUnread(list.filter((n) => (n.user_id ? !n.read_at : new Date(n.created_at).getTime() > cur)).length);
  };
  useEffect(() => {
    load();
    const ch = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);
  const markAllRead = async () => {
    const ids = items.filter((n) => !n.read_at && n.user_id).map((n) => n.id);
    if (ids.length)
      await supabase
        .from("notifications" as any)
        .update({ read_at: new Date().toISOString() } as any)
        .in("id", ids);
    localStorage.setItem("sx-bcast-last-seen", String(Date.now()));
    setUnread(0);
    load();
  };
  return (
    <DropdownMenu
      onOpenChange={(o) => {
        if (o) markAllRead();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Recent activity</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground text-center">Nothing yet.</div>
        ) : (
          items.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2">
              <span className="font-medium text-sm">{n.title}</span>
              {n.body && <span className="text-xs text-muted-foreground line-clamp-2">{n.body}</span>}
              <span className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-xs text-muted-foreground justify-center">
          View all (coming soon)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
