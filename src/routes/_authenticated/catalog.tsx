import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Disc3, Plus, Search, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReleaseRowActions, statusBadgeClass } from "@/components/catalog/release-row-actions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/catalog")({
  component: Catalog,
  head: () => ({ meta: [{ title: "Catalog — SoundXpand" }] }),
});

function Catalog() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [showAllDrafts, setShowAllDrafts] = useState(false);

  const load = useCallback(async () => {
    const [r, d] = await Promise.all([
      supabase.from("releases")
        .select("id,title,release_type,status,release_date,artwork_path,slug,rejection_reason")
        .order("created_at", { ascending: false }),
      supabase.from("release_drafts")
        .select("id,title,current_step,updated_at,source_release_id")
        .order("updated_at", { ascending: false }),
    ]);
    setRows(r.data ?? []);
    setDrafts(d.data ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteDraft = async (id: string) => {
    if (!confirm("Delete this draft? This cannot be undone.")) return;
    const { error } = await supabase.from("release_drafts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Draft deleted");
    load();
  };

  // Merge drafts into all-releases table as synthetic rows
  const draftRows = drafts
    .filter(d => !d.source_release_id) // exclude edit-drafts of existing releases
    .map(d => ({
      id: d.id,
      title: d.title || "Untitled draft",
      release_type: "—",
      status: "draft" as const,
      release_date: null,
      _isDraft: true,
      updated_at: d.updated_at,
    }));

  const combined = [...draftRows, ...rows];

  const filtered = combined.filter(r =>
    (tab === "all" || r.status === tab) &&
    (!q || (r.title ?? "").toLowerCase().includes(q.toLowerCase()))
  );

  const visibleDrafts = showAllDrafts ? drafts : drafts.slice(0, 2);

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
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-primary">Continue where you left off</div>
            {drafts.length > 2 && (
              <button onClick={() => setShowAllDrafts(s => !s)} className="text-xs text-primary hover:underline">
                {showAllDrafts ? "Show less" : `View all (${drafts.length})`}
              </button>
            )}
          </div>
          <ul className="space-y-1.5">
            {visibleDrafts.map(d => (
              <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate min-w-0">
                  {d.title} <span className="text-muted-foreground">· Step {(d.current_step ?? 0) + 1}/6{d.source_release_id ? " · editing existing release" : ""}</span>
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <Link to="/releases/new" search={{ draft: d.id } as any} className="text-primary hover:underline text-xs px-2">Resume →</Link>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteDraft(d.id)} aria-label="Delete draft">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
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
              <TabsTrigger value="takedown_requested">Takedown</TabsTrigger>
              <TabsTrigger value="taken_down">Taken down</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search releases…" value={q} onChange={e => setQ(e.target.value)} className="pl-8 w-64" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Disc3} title="No releases found" description="When you submit a release it appears here." actionLabel="Create release" actionTo="/releases/new" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="py-2 px-2">Title</th><th>Type</th><th>Release date</th><th>Status</th><th className="text-right pr-2">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={(r._isDraft ? "d-" : "r-") + r.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2 font-medium">
                      {r._isDraft ? (
                        <Link to="/releases/new" search={{ draft: r.id } as any} className="hover:text-primary">{r.title}</Link>
                      ) : (
                        <Link to="/releases/$id" params={{ id: r.id }} className="hover:text-primary">{r.title}</Link>
                      )}
                    </td>
                    <td className="capitalize text-muted-foreground">{r.release_type}</td>
                    <td className="text-muted-foreground">{r.release_date || "—"}</td>
                    <td><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadgeClass(r.status)}`}>{r.status.replace(/_/g, " ")}</span></td>
                    <td className="text-right pr-2">
                      {r._isDraft ? (
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteDraft(r.id)} aria-label="Delete draft">
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      ) : (
                        <ReleaseRowActions row={r} onChanged={load} />
                      )}
                    </td>
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
