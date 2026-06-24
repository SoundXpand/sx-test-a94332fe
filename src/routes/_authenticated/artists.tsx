import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { UserCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/artists")({
  component: Artists,
  head: () => ({ meta: [{ title: "Artists — SoundXpand" }] }),
});

function Artists() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("profiles").select("user_id,full_name,artist_name,username,country,status").order("created_at", { ascending: false }).then(r => setRows(r.data ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Artists</h1>
      <Card className="p-4 bg-card/60 border-border">
        {rows.length === 0 ? (
          <EmptyState icon={UserCircle2} title="No artists yet" description="Approved artists appear here." />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map(p => (
              <li key={p.user_id} className="flex items-center gap-4 py-3">
                <div className="h-9 w-9 rounded-full bg-primary/15 text-primary grid place-items-center text-xs font-semibold">
                  {(p.full_name || p.artist_name || "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.full_name || p.artist_name}</div>
                  <div className="text-xs text-muted-foreground">{p.username} · {p.country || "—"}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">{p.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
