import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Disc3, Plus, Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/catalog")({
  component: Catalog,
  head: () => ({ meta: [{ title: "Catalog — SoundXpand" }] }),
});

function Catalog() {
  const [rows, setRows] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    (async () => {
      const [r, d] = await Promise.all([
        supabase.from("releases").select("id,title,release_type,status,release_date,artwork_path").order("created_at", { ascending: false }),
        supabase.from("release_drafts").select("id,title,current_step,updated_at").order("updated_at", { ascending: false }),
      ]);
      setRows(r.data ?? []);
      setDrafts(d.data ?? []);
    })();
  }, []);

  const filtered = rows.filter(r =>
    (tab === "all" || r.status === tab) &&
    (!q || r.title.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Catalog</h1>
          <p className="text-sm text-muted-foreground">All your releases in one place.</p>
        </div>
        <Button asChild><Link to="/releases/new"><Plus className="h-4 w-4 mr-1.5" />New release</Link></Button>
      </div>

      {drafts.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="text-xs font-semibold text-primary mb-2">Continue where you left off</div>
          <ul className="space-y-1.5">
            {drafts.map(d => (
              <li key={d.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{d.title} <span className="text-muted-foreground">· Step {d.current_step + 1}/6</span></span>
                <Link to="/releases/new" search={{ draft: d.id } as any} className="text-primary hover:underline">Resume →</Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-4 bg-card/60 border-border">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="live">Live</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search releases…" value={q} onChange={e => setQ(e.target.value)} className="pl-8 w-64" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Disc3} title="No releases found" description="When you upload a release it appears here. Use the catalog to track status across all your distributions." actionLabel="Create release" actionTo="/releases/new" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="py-2 px-2">Title</th><th>Type</th><th>Release date</th><th>Status</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2 font-medium">{r.title}</td>
                    <td className="capitalize text-muted-foreground">{r.release_type}</td>
                    <td className="text-muted-foreground">{r.release_date || "—"}</td>
                    <td><span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
