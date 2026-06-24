import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Disc3, Plus } from "lucide-react";
import { ReleaseRowActions, statusBadgeClass } from "@/components/catalog/release-row-actions";

export const Route = createFileRoute("/_authenticated/releases/")({
  component: ReleasesAdmin,
  head: () => ({ meta: [{ title: "Releases — SoundXpand" }] }),
});

function ReleasesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const load = useCallback(async () => {
    const r = await supabase.from("releases")
      .select("id,title,release_type,status,release_date,owner_id,slug,rejection_reason,upc,created_at")
      .order("created_at", { ascending: false });
    setRows(r.data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-semibold">Releases</h1>
          <nav className="ml-4 flex gap-1">
            <Link to="/releases" activeOptions={{ exact: true }} className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground">All releases</Link>
            <Link to="/releases/new" className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground">New release</Link>
          </nav>
        </div>
        <Button asChild size="sm"><Link to="/releases/new"><Plus className="h-4 w-4 mr-1.5" />New release</Link></Button>
      </div>
      <Card className="p-4 bg-card/60 border-border">
        {rows.length === 0 ? (
          <EmptyState icon={Disc3} title="No releases on the platform yet" description="When artists submit releases they'll appear here." />
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="py-2 px-2">Title</th><th>Type</th><th>UPC</th><th>Release date</th><th>Status</th><th className="text-right pr-2">Actions</th>
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-2 font-medium">
                    <Link to="/releases/$id" params={{ id: r.id }} className="hover:text-primary">{r.title}</Link>
                  </td>
                  <td className="capitalize text-muted-foreground">{r.release_type}</td>
                  <td className="text-muted-foreground font-mono text-xs">{r.upc || "—"}</td>
                  <td className="text-muted-foreground">{r.release_date || "—"}</td>
                  <td><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadgeClass(r.status)}`}>{r.status.replace(/_/g, " ")}</span></td>
                  <td className="text-right pr-2"><ReleaseRowActions row={r} onChanged={load} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
