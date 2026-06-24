import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: Analytics,
  head: () => ({ meta: [{ title: "Analytics — SoundXpand" }] }),
});

function Analytics() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("analytics_rows").select("platform,streams,revenue").then(r => setRows(r.data ?? []));
  }, []);

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <EmptyState icon={BarChart3} title="No analytics data uploaded" description="Upload your DSP analytics CSV to see streams and revenue across platforms." actionLabel="Upload CSV" />
      </div>
    );
  }

  const byPlatform = rows.reduce<Record<string, { streams: number; revenue: number }>>((acc, r) => {
    const k = r.platform || "Other";
    acc[k] = acc[k] || { streams: 0, revenue: 0 };
    acc[k].streams += r.streams;
    acc[k].revenue += Number(r.revenue);
    return acc;
  }, {});

  const totalStreams = Object.values(byPlatform).reduce((s, v) => s + v.streams, 0);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Analytics</h1>
      <Card className="p-6 bg-card/60 border-border">
        <h2 className="font-display text-lg font-semibold mb-4">Streams by platform</h2>
        <div className="space-y-3">
          {Object.entries(byPlatform).sort(([,a],[,b]) => b.streams - a.streams).map(([p, v]) => {
            const pct = totalStreams ? (v.streams / totalStreams) * 100 : 0;
            return (
              <div key={p}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{p}</span>
                  <span className="text-muted-foreground">{v.streams.toLocaleString()} streams · ₹{v.revenue.toFixed(2)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
