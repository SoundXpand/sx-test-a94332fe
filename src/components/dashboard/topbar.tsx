import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Menu, Search, Bell, Plus, LogOut, User, Settings as SettingsIcon, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser, roleLabel } from "@/hooks/use-current-user";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard", catalog: "Catalog", releases: "Releases", new: "New release",
  analytics: "Analytics", royalties: "Royalties", users: "Users", reports: "Reports",
  tools: "Tools", settings: "Settings", support: "Support", artists: "Artists",
  "approval-queue": "Approval queue", "platform-settings": "Platform settings",
  profile: "Profile", help: "Help center",
};

function useBreadcrumbs() {
  const path = useRouterState({ select: s => s.location.pathname });
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
  const [results, setResults] = useState<{ releases: any[]; tracks: any[]; profiles: any[] }>({ releases: [], tracks: [], profiles: [] });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(o => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!q.trim()) { setResults({ releases: [], tracks: [], profiles: [] }); return; }
    const t = setTimeout(async () => {
      const [r, t2, p] = await Promise.all([
        supabase.from("releases").select("id,title,release_type").ilike("title", `%${q}%`).limit(5),
        supabase.from("release_tracks").select("id,title,release_id").ilike("title", `%${q}%`).limit(5),
        supabase.from("profiles").select("user_id,full_name,artist_name,username").or(`full_name.ilike.%${q}%,artist_name.ilike.%${q}%,username.ilike.%${q}%`).limit(5),
      ]);
      setResults({ releases: r.data ?? [], tracks: t2.data ?? [], profiles: p.data ?? [] });
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const initials = (data?.profile?.full_name || data?.user?.email || "?").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

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
                <Link to={c.to} className="hover:text-foreground truncate">{c.label}</Link>
              )}
            </span>
          ))}
        </nav>

        <button
          onClick={() => setSearchOpen(true)}
          className="ml-auto flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 transition-colors min-w-[180px] lg:min-w-[320px]"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search releases, artists, tracks…</span>
          <kbd className="ml-auto hidden lg:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">⌘K</kbd>
        </button>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" title="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="Quick actions"><Plus className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate({ to: "/releases/new" })}>New release</DropdownMenuItem>
              {data?.primaryRole === "administrator" && (
                <DropdownMenuItem onClick={() => navigate({ to: "/users" })}>Manage users</DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate({ to: "/analytics" })}>Upload analytics</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex items-center gap-2 rounded-lg border border-border bg-card/60 px-2 py-1 hover:bg-muted/60 transition-colors">
                <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold">{data?.profile?.full_name || data?.user?.email}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {data && roleLabel(data.primaryRole)} · {data?.profile?.username}
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
                    {data && roleLabel(data.primaryRole)} · {data?.profile?.username}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}><User className="h-4 w-4 mr-2" />Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}><SettingsIcon className="h-4 w-4 mr-2" />Account settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/help" })}><HelpCircle className="h-4 w-4 mr-2" />Help center</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive"><LogOut className="h-4 w-4 mr-2" />Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search releases, artists, tracks…" value={q} onValueChange={setQ} />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          {results.releases.length > 0 && (
            <CommandGroup heading="Releases">
              {results.releases.map(r => (
                <CommandItem key={r.id} onSelect={() => { setSearchOpen(false); navigate({ to: "/catalog" }); }}>
                  <Disc3Icon /> {r.title} <span className="ml-auto text-xs text-muted-foreground">{r.release_type}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {results.tracks.length > 0 && (
            <CommandGroup heading="Tracks">
              {results.tracks.map(t => (
                <CommandItem key={t.id} onSelect={() => { setSearchOpen(false); navigate({ to: "/catalog" }); }}>
                  {t.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {results.profiles.length > 0 && (
            <CommandGroup heading="Artists & users">
              {results.profiles.map(p => (
                <CommandItem key={p.user_id} onSelect={() => { setSearchOpen(false); navigate({ to: "/users" }); }}>
                  {p.full_name || p.artist_name} <span className="ml-auto text-xs text-muted-foreground">{p.username}</span>
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
