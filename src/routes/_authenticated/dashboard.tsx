import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Disc3, Clock, CheckCircle2, BarChart3, Users, DollarSign } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — SoundXpand" }] }),
});

const widgets = [
  { label: "Total releases", value: "—", icon: Disc3 },
  { label: "Pending review", value: "—", icon: Clock },
  { label: "Live releases", value: "—", icon: CheckCircle2 },
  { label: "Total streams", value: "—", icon: BarChart3 },
  { label: "Revenue", value: "—", icon: DollarSign },
  { label: "Artists", value: "—", icon: Users },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Real-time overview of your catalog and earnings.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map(w => (
          <Card key={w.label} className="p-5 bg-card/60 border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{w.label}</span>
              <w.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 font-display text-3xl font-semibold">{w.value}</div>
          </Card>
        ))}
      </div>
      <Card className="p-8 bg-card/60 border-border text-center">
        <h2 className="font-display text-lg font-semibold">No data yet</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your first release to start tracking streams and revenue.
        </p>
      </Card>
    </div>
  );
}
