import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Disc3, Clock, CheckCircle2, BarChart3, Users, DollarSign, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — SoundXpand" }] }),
});

function Dashboard() {
  const [stats, setStats] = useState<{ total: number; pending: number; live: number; streams: number; revenue: number; artists: number } | null>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [rel, an, pr] = await Promise.all([
        supabase.from("releases").select("id,title,release_type,status,release_date,artwork_path,created_at").order("created_at", { ascending: false }),
        supabase.from("analytics_rows").select("streams,revenue"),
        supabase.from("profiles").select("user_id", { count: "exact", head: true }),
      ]);
      const releases = rel.data ?? [];
      const streams = (an.data ?? []).reduce((s, r) => s + (r.streams || 0), 0);
      const revenue = (an.data ?? []).reduce((s, r) => s + Number(r.revenue || 0), 0);
      setStats({
        total: releases.length,
        pending: releases.filter(r => r.status === "pending").length,
        live: releases.filter(r => r.status === "live").length,
        streams, revenue,
        artists: pr.count ?? 0,
      });
      setRecent(releases.slice(0, 5));
    })();
  }, []);

  const cards = [
    { label: "Total releases", value: stats?.total ?? "—", icon: Disc3 },
    { label: "Pending review", value: stats?.pending ?? "—", icon: Clock },
    { label: "Live releases", value: stats?.live ?? "—", icon: CheckCircle2 },
    { label: "Total streams", value: stats ? stats.streams.toLocaleString() : "—", icon: BarChart3 },
    { label: "Revenue", value: stats ? `₹${stats.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—", icon: DollarSign },
    { label: "Artists", value: stats?.artists ?? "—", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time overview of your catalog and earnings.</p>
        </div>
        <Button asChild><Link to="/releases/new"><Plus className="h-4 w-4 mr-1.5" />New release</Link></Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(w => (
          <Card key={w.label} className="p-5 bg-card/60 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{w.label}</span>
              <w.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 font-display text-3xl font-semibold">{w.value}</div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-card/60 border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Recent releases</h2>
          <Link to="/catalog" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState icon={Disc3} title="No releases yet" description="Upload your first release to start tracking streams and revenue." actionLabel="Create release" actionTo="/releases/new" />
        ) : (
          <ul className="divide-y divide-border">
            {recent.map(r => (
              <li key={r.id} className="flex items-center gap-4 py-3">
                <div className="h-10 w-10 rounded-md bg-muted grid place-items-center text-muted-foreground">
                  <Disc3 className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.release_type} · {r.release_date || "Unscheduled"}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
