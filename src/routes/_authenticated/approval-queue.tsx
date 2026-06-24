import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disc3, ShieldCheck, Check, X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/approval-queue")({
  component: ApprovalQueue,
  head: () => ({ meta: [{ title: "Approval queue — SoundXpand" }] }),
});

function ApprovalQueue() {
  const [rows, setRows] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("releases").select("id,title,release_type,release_date,status,owner_id,created_at").eq("status", "pending").order("created_at");
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const decide = async (id: string, status: "live" | "rejected") => {
    const { error } = await supabase.from("releases").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "live" ? "Release approved" : "Release rejected");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Approval queue</h1>
        <p className="text-sm text-muted-foreground">Releases awaiting admin review.</p>
      </div>
      <Card className="p-4 bg-card/60 border-border">
        {rows.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Queue is clear" description="No releases are waiting for review right now." />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map(r => (
              <li key={r.id} className="flex items-center gap-4 py-3">
                <Disc3 className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{r.release_type} · {r.release_date || "Unscheduled"}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => decide(r.id, "rejected")}><X className="h-4 w-4 mr-1" />Reject</Button>
                <Button size="sm" onClick={() => decide(r.id, "live")}><Check className="h-4 w-4 mr-1" />Approve</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
