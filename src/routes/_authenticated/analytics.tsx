import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: Analytics,
});

function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Analytics</h1>
      <Card className="p-12 text-center bg-card/60 border-dashed">
        <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 font-semibold">No analytics yet</h3>
        <p className="text-sm text-muted-foreground">Streams and revenue charts appear here after your releases go live.</p>
      </Card>
    </div>
  );
}
