import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Disc3 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend, PieChart, Pie, Cell,
} from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: Analytics,
  head: () => ({ meta: [{ title: "Analytics — SoundXpand" }] }),
});

const COLORS = ["#1DB954", "#FA243C", "#FF0000", "#2BC5B4", "#FF6B6B", "#A78BFA", "#F59E0B"];

function Analytics() {
  const [rows, setRows] = useState<any[]>([]);
  const [releases, setReleases] = useState<{ id: string; title: string }[]>([]);
  const [range, setRange] = useState<"30d" | "90d" | "12m" | "all">("12m");
  const [releaseId, setReleaseId] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const [a, r] = await Promise.all([
        supabase.from("analytics_rows").select("platform,streams,revenue,date,release_id").order("date"),
        supabase.from("releases").select("id,title").order("created_at", { ascending: false }),
      ]);
      setRows(a.data ?? []);
      setReleases(r.data ?? []);
    })();
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    if (range === "30d") cutoff.setDate(now.getDate() - 30);
    else if (range === "90d") cutoff.setDate(now.getDate() - 90);
    else if (range === "12m") cutoff.setMonth(now.getMonth() - 12);
    else cutoff.setFullYear(2000);
    return rows.filter(r => new Date(r.date) >= cutoff && (releaseId === "all" || r.release_id === releaseId));
  }, [rows, range, releaseId]);

  const totalStreams = filtered.reduce((s, r) => s + Number(r.streams || 0), 0);
  const totalRevenue = filtered.reduce((s, r) => s + Number(r.revenue || 0), 0);
  const byPlatform = useMemo(() => {
    const m: Record<string, { streams: number; revenue: number }> = {};
    filtered.forEach(r => {
      const k = r.platform || "Other";
      m[k] = m[k] || { streams: 0, revenue: 0 };
      m[k].streams += Number(r.streams || 0);
      m[k].revenue += Number(r.revenue || 0);
    });
    return Object.entries(m).map(([platform, v]) => ({ platform, ...v }))
      .sort((a, b) => b.streams - a.streams);
  }, [filtered]);

  const byMonth = useMemo(() => {
    const m: Record<string, Record<string, number> & { month: string }> = {};
    filtered.forEach(r => {
      const month = String(r.date).slice(0, 7);
      m[month] = m[month] || ({ month } as any);
      m[month][r.platform] = (Number(m[month][r.platform] || 0) + Number(r.streams || 0)) as any;
    });
    return Object.values(m).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  const totalsByMonth = byMonth.map(m => ({
    month: m.month,
    streams: Object.entries(m).filter(([k]) => k !== "month").reduce((s, [, v]) => s + Number(v), 0),
  }));

  const platforms = byPlatform.map(p => p.platform);
  const topPlatform = byPlatform[0]?.platform ?? "—";

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <EmptyState icon={BarChart3} title="No analytics data yet" description="Upload a DSP analytics CSV or wait for streams to roll in." actionLabel="Upload CSV" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Streams, revenue and platform breakdown.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={releaseId} onValueChange={setReleaseId}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All releases</SelectItem>
              {releases.map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={v => setRange(v as any)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon={TrendingUp} label="Total streams" value={totalStreams.toLocaleString()} />
        <Kpi icon={DollarSign} label="Revenue" value={`₹${totalRevenue.toFixed(2)}`} />
        <Kpi icon={Disc3} label="Active releases" value={String(new Set(filtered.map(r => r.release_id)).size)} />
        <Kpi icon={BarChart3} label="Top platform" value={topPlatform} />
      </div>

      <Card className="p-5 bg-card/60 border-border">
        <h2 className="font-display text-lg font-semibold mb-4">Streams over time</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={totalsByMonth}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="streams" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 bg-card/60 border-border lg:col-span-2">
          <h2 className="font-display text-lg font-semibold mb-4">Streams by platform per month</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {platforms.map((p, i) => (
                  <Bar key={p} dataKey={p} stackId="a" fill={COLORS[i % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 bg-card/60 border-border">
          <h2 className="font-display text-lg font-semibold mb-4">Revenue share</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byPlatform} dataKey="revenue" nameKey="platform" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {byPlatform.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: any) => `₹${Number(v).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1 text-xs">
            {byPlatform.map((p, i) => (
              <li key={p.platform} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="flex-1">{p.platform}</span>
                <span className="text-muted-foreground">₹{p.revenue.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="p-4 bg-card/60 border-border">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span><Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 font-display text-2xl font-semibold">{value}</div>
    </Card>
  );
}
