import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Disc3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/catalog")({
  component: Catalog,
  head: () => ({ meta: [{ title: "Catalog — SoundXpand" }] }),
});

type Release = {
  id: string; title: string; release_type: string; status: string;
  primary_genre: string | null; release_date: string | null; created_at: string;
};

const statusColor: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/15 text-warning",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
  live: "bg-primary/15 text-primary",
  archived: "bg-muted text-muted-foreground",
};

function Catalog() {
  const [items, setItems] = useState<Release[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("releases").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setItems((data as Release[]) ?? []); setLoading(false); });
  }, []);

  const filtered = items.filter(r =>
    (filter === "all" || r.status === filter) &&
    (q === "" || r.title.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Catalog</h1>
          <p className="text-sm text-muted-foreground">Manage all your releases.</p>
        </div>
        <Button asChild>
          <Link to="/releases/new"><Plus className="h-4 w-4 mr-2" /> New release</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search releases…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {["all", "draft", "pending", "approved", "live", "rejected", "archived"].map(s => (
            <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="capitalize">
              {s}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card className="p-12 text-center text-muted-foreground bg-card/60">Loading…</Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center bg-card/60 border-dashed">
          <Disc3 className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No releases yet</h3>
          <p className="text-sm text-muted-foreground">Click "New release" to start your first submission.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden bg-card/60">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/20">
              <tr className="text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Genre</th>
                <th className="px-4 py-3 font-medium">Release date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/10">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{r.release_type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.primary_genre ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.release_date ?? "—"}</td>
                  <td className="px-4 py-3"><Badge className={statusColor[r.status] ?? ""}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
