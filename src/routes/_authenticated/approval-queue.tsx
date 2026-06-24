import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disc3, ShieldCheck, Check, X, ArrowDownToLine } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/approval-queue")({
  component: ApprovalQueue,
  head: () => ({ meta: [{ title: "Approval queue — SoundXpand" }] }),
});

function ApprovalQueue() {
  const [pending, setPending] = useState<any[]>([]);
  const [takedowns, setTakedowns] = useState<any[]>([]);
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    const [p, t] = await Promise.all([
      supabase.from("releases").select("id,title,release_type,release_date,status,created_at").eq("status", "pending").order("created_at"),
      supabase.from("releases").select("id,title,release_type,release_date,status,created_at,slug").eq("status", "takedown_requested").order("created_at"),
    ]);
    setPending(p.data ?? []);
    setTakedowns(t.data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    const { error } = await supabase.from("releases").update({ status: "live", rejection_reason: null }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Release approved — smartlink generated");
    load();
  };

  const submitReject = async () => {
    if (!rejectFor) return;
    const { error } = await supabase.from("releases").update({ status: "rejected", rejection_reason: reason }).eq("id", rejectFor);
    if (error) return toast.error(error.message);
    toast.success("Release rejected");
    setRejectFor(null); setReason(""); load();
  };

  const approveTakedown = async (id: string) => {
    const { error } = await supabase.from("releases").update({ status: "taken_down", taken_down_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Release taken down");
    load();
  };

  const denyTakedown = async (id: string) => {
    const { error } = await supabase.from("releases").update({ status: "live" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Takedown denied, release stays live");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Approval queue</h1>
        <p className="text-sm text-muted-foreground">Review submissions and takedown requests.</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">New submissions <span className="ml-1.5 text-[10px] px-1.5 rounded-full bg-primary/15 text-primary">{pending.length}</span></TabsTrigger>
          <TabsTrigger value="takedown">Takedown requests <span className="ml-1.5 text-[10px] px-1.5 rounded-full bg-orange-500/15 text-orange-500">{takedowns.length}</span></TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="p-4 bg-card/60 border-border">
            {pending.length === 0 ? (
              <EmptyState icon={ShieldCheck} title="Queue is clear" description="No releases are waiting for review right now." />
            ) : (
              <ul className="divide-y divide-border">
                {pending.map(r => (
                  <li key={r.id} className="flex items-center gap-4 py-3">
                    <Disc3 className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{r.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">{r.release_type} · {r.release_date || "Unscheduled"}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setRejectFor(r.id); setReason(""); }}><X className="h-4 w-4 mr-1" />Reject</Button>
                    <Button size="sm" onClick={() => approve(r.id)}><Check className="h-4 w-4 mr-1" />Approve</Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="takedown">
          <Card className="p-4 bg-card/60 border-border">
            {takedowns.length === 0 ? (
              <EmptyState icon={ArrowDownToLine} title="No takedown requests" description="When artists request takedowns they'll appear here." />
            ) : (
              <ul className="divide-y divide-border">
                {takedowns.map(r => (
                  <li key={r.id} className="flex items-center gap-4 py-3">
                    <ArrowDownToLine className="h-5 w-5 text-orange-500" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{r.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">{r.release_type} · slug: {r.slug || "—"}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => denyTakedown(r.id)}><X className="h-4 w-4 mr-1" />Deny</Button>
                    <Button size="sm" variant="destructive" onClick={() => approveTakedown(r.id)}><Check className="h-4 w-4 mr-1" />Take down</Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject release</DialogTitle>
            <DialogDescription>Provide a clear reason — the artist will see this and can resubmit after fixing.</DialogDescription>
          </DialogHeader>
          <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={5} placeholder="e.g. Artwork resolution below 3000×3000; please re-upload." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={submitReject} disabled={!reason.trim()}>Confirm rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
