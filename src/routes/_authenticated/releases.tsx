import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Disc3 } from "lucide-react";
import { ReleaseRowActions, statusBadgeClass } from "@/components/catalog/release-row-actions";

export const Route = createFileRoute("/_authenticated/releases")({
  component: ReleasesAdmin,
  head: () => ({ meta: [{ title: "Releases — SoundXpand" }] }),
});

function ReleasesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const load = useCallback(async () => {
    const r = await supabase.from("releases")
      .select("id,title,release_type,status,release_date,owner_id,slug,rejection_reason,created_at")
      .order("created_at", { ascending: false });
    setRows(r.data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">All releases</h1>
      <Card className="p-4 bg-card/60 border-border">
        {rows.length === 0 ? (
          <EmptyState icon={Disc3} title="No releases on the platform yet" description="When artists submit releases they'll appear here." />
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="py-2 px-2">Title</th><th>Type</th><th>Release date</th><th>Status</th><th className="text-right pr-2">Actions</th>
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-2 font-medium">{r.title}</td>
                  <td className="capitalize text-muted-foreground">{r.release_type}</td>
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
