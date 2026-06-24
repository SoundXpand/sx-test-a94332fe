import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShieldCheck, Disc3, Truck, LifeBuoy, Receipt, Activity } from "lucide-react";

export function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const [users, pendingProfiles, pendingRel, delivered30, openTickets, uploads, recentRel] = await Promise.all([
        supabase.from("profiles").select("user_id", { count: "exact", head: true }),
        supabase.from("profiles").select("user_id", { count: "exact", head: true }).eq("status", "pending_approval"),
        supabase.from("releases").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("releases").select("id", { count: "exact", head: true }).gte("delivered_at", since30),
        supabase.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "waiting_admin"]),
        supabase.from("analytics_uploads" as any).select("id", { count: "exact", head: true }),
        supabase.from("releases").select("id,title,status,release_type,created_at").order("created_at", { ascending: false }).limit(6),
      ]);
      setStats({
        users: users.count ?? 0,
        pendingUsers: pendingProfiles.count ?? 0,
        pendingReleases: pendingRel.count ?? 0,
        delivered30: delivered30.count ?? 0,
        openTickets: openTickets.count ?? 0,
        uploads: uploads.count ?? 0,
      });
      setRecent(recentRel.data ?? []);
    })();
  }, []);

  const cards = [
    { label: "Total users", value: stats?.users ?? "—", icon: Users, to: "/users" },
    { label: "Users pending approval", value: stats?.pendingUsers ?? "—", icon: ShieldCheck, to: "/users" },
    { label: "Releases pending review", value: stats?.pendingReleases ?? "—", icon: Disc3, to: "/releases" },
    { label: "Delivered (last 30 days)", value: stats?.delivered30 ?? "—", icon: Truck, to: "/releases" },
    { label: "Open tickets", value: stats?.openTickets ?? "—", icon: LifeBuoy, to: "/admin/tickets" },
    { label: "Accounting uploads", value: stats?.uploads ?? "—", icon: Receipt, to: "/accounting" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Operations overview</h1>
          <p className="text-sm text-muted-foreground">Approve users and releases, monitor deliveries, manage tickets.</p>
        </div>
        <Button asChild><Link to="/releases"><ShieldCheck className="h-4 w-4 mr-1.5" />Review queue</Link></Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(w => (
          <Link key={w.label} to={w.to as any}>
            <Card className="p-5 bg-card/60 border-border hover:border-primary/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{w.label}</span>
                <w.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-3 font-display text-3xl font-semibold">{w.value}</div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-6 bg-card/60 border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2"><Activity className="h-4 w-4" />Recent releases</h2>
          <Link to="/releases" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">Nothing yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map(r => (
              <li key={r.id} className="flex items-center gap-4 py-3">
                <Disc3 className="h-4 w-4 text-muted-foreground" />
                <Link to="/releases/$id" params={{ id: r.id }} className="flex-1 min-w-0 font-medium truncate hover:text-primary">{r.title}</Link>
                <span className="text-xs text-muted-foreground capitalize">{r.release_type}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{r.status.replace(/_/g," ")}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
