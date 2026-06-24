import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export const Route = createFileRoute("/_authenticated/royalties")({
  component: Royalties,
});

function Royalties() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Royalties</h1>
      <Card className="p-12 text-center bg-card/60 border-dashed">
        <DollarSign className="mx-auto h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 font-semibold">No statements yet</h3>
        <p className="text-sm text-muted-foreground">Monthly royalty statements and PDF/Excel downloads appear here.</p>
      </Card>
    </div>
  );
}
