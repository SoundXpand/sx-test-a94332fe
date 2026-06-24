import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Disc3, Download, Truck, Check, X, ShieldCheck, ArrowDownToLine, Trash2, RotateCcw } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ReleaseRowActions, statusBadgeClass } from "@/components/catalog/release-row-actions";
import { useCurrentUser, isStaff } from "@/hooks/use-current-user";
import { useServerFn } from "@tanstack/react-start";
import { markDeliveredFn } from "@/lib/admin-actions.functions";
import { downloadReleaseMetadataXlsx } from "@/lib/metadata-export";
import { downloadReleaseBundle, downloadBulkBundles } from "@/lib/release-bundle";
import { archiveReleaseFn, purgeArchivedFn } from "@/lib/admin-actions.functions";
import { Checkbox } from "@/components/ui/checkbox";
import { Package } from "lucide-react";
import { DSPS } from "@/lib/dsp-list";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/releases/")({
  component: ReleasesAdmin,
  head: () => ({ meta: [{ title: "Releases — SoundXpand" }] }),
});

function ReleasesAdmin() {
  const { data: me, isLoading } = useCurrentUser();
  const staff = isStaff(me?.primaryRole);
  const [rows, setRows] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [deliverFor, setDeliverFor] = useState<any | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [r, d] = await Promise.all([
      supabase.from("releases").select("id,title,release_type,status,release_date,owner_id,slug,rejection_reason,upc,catalog_number,primary_genre,artwork_path,p_year,p_name,c_year,c_name,created_at,delivered_at,delivery_note,archived_at,admin_remarks").order("created_at", { ascending: false }),
      supabase.from("release_deliveries" as any).select("*").order("delivered_at", { ascending: false }).limit(100),
    ]);
    setRows(r.data ?? []);
    setDeliveries((d.data as any[]) ?? []);
  }, []);
  useEffect(() => { if (staff) load(); }, [load, staff]);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!staff) return <Navigate to="/catalog" />;

  const active = rows.filter(r => !r.archived_at);
  const pending = active.filter(r => r.status === "pending");
  const approved = active.filter(r => r.status === "live");
  const delivered = active.filter(r => r.status === "delivered");
  const takedowns = active.filter(r => r.status === "takedown_requested" || r.status === "taken_down");
  const archived = rows.filter(r => r.archived_at);

  const toggleSel = (id: string) => setSelected(s => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const bulkDownload = async () => {
    const picked = approved.filter(r => selected.has(r.id));
    if (picked.length === 0) return toast.error("Select at least one approved release");
    setBusy(true);
    try { await downloadBulkBundles(picked); toast.success(`Bundled ${picked.length} releases`); }
    catch (e: any) { toast.error(e.message ?? "Bundle failed"); }
    finally { setBusy(false); }
  };
  const purgeFn = useServerFn(purgeArchivedFn);
  const purge = async () => {
    if (!confirm("Permanently delete releases archived >7 days?")) return;
    try {
      const res = await purgeFn();
      toast.success(`Purged ${(res as any).purged ?? 0} releases`);
      load();
    } catch (e: any) { toast.error(e.message ?? "Purge failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Releases</h1>
          <p className="text-sm text-muted-foreground">Approve, deliver, and audit catalog status.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={purge} title="Permanently remove releases archived more than 7 days ago">
            <Trash2 className="h-4 w-4 mr-1" />Purge expired
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All <Badge className="ml-2" variant="secondary">{active.length}</Badge></TabsTrigger>
          <TabsTrigger value="approval">Approval queue <Badge className="ml-2" variant="secondary">{pending.length}</Badge></TabsTrigger>
          <TabsTrigger value="delivery">Delivery <Badge className="ml-2" variant="secondary">{approved.length}</Badge></TabsTrigger>
          <TabsTrigger value="delivered">Delivered <Badge className="ml-2" variant="secondary">{delivered.length}</Badge></TabsTrigger>
          <TabsTrigger value="takedowns">Takedowns <Badge className="ml-2" variant="secondary">{takedowns.length}</Badge></TabsTrigger>
          <TabsTrigger value="archived">Archived <Badge className="ml-2" variant="secondary">{archived.length}</Badge></TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ReleaseTable rows={active} onChanged={load} emptyIcon={Disc3} emptyTitle="No releases" emptyDesc="" />
        </TabsContent>
        <TabsContent value="approval">
          <ReleaseTable rows={pending} onChanged={load} emptyIcon={ShieldCheck} emptyTitle="No releases waiting" emptyDesc="Submitted releases will appear here for approval." />
        </TabsContent>
        <TabsContent value="delivery">
          <Card className="p-4 bg-card/60 border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{selected.size} selected for bulk delivery</div>
              <Button size="sm" onClick={bulkDownload} disabled={busy || selected.size === 0}>
                <Package className="h-3.5 w-3.5 mr-1" />{busy ? "Bundling…" : "Download bulk ZIP"}
              </Button>
            </div>
            {approved.length === 0 ? (
              <EmptyState icon={Truck} title="No approved releases to deliver" description="Approved releases will queue here for distribution." />
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 px-2 w-8"></th><th>Title</th><th>Catalog</th><th>UPC</th><th>Release date</th><th className="text-right pr-2">Action</th>
                </tr></thead>
                <tbody>
                  {approved.map(r => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-2"><Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleSel(r.id)} /></td>
                      <td className="py-3 px-2 font-medium">
                        <Link to="/releases/$id" params={{ id: r.id }} className="hover:text-primary">{r.title}</Link>
                      </td>
                      <td className="text-muted-foreground font-mono text-xs">{r.catalog_number || "—"}</td>
                      <td className="text-muted-foreground font-mono text-xs">{r.upc || "—"}</td>
                      <td className="text-muted-foreground">{r.release_date || "—"}</td>
                      <td className="text-right pr-2 space-x-2">
                        <Button size="sm" variant="outline" onClick={async () => {
                          const { data: tracks } = await supabase.from("release_tracks").select("*").eq("release_id", r.id).order("track_number");
                          downloadReleaseMetadataXlsx(r, tracks ?? []);
                        }}>
                          <Download className="h-3.5 w-3.5 mr-1" />Excel
                        </Button>
                        <Button size="sm" onClick={() => setDeliverFor(r)}>
                          <Truck className="h-3.5 w-3.5 mr-1" />Mark delivered
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="delivered">
          <Card className="p-4 bg-card/60 border-border">
            {delivered.length === 0 ? (
              <EmptyState icon={Truck} title="Nothing delivered yet" description="Once released, deliveries will be tracked here." />
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 px-2">Title</th><th>Catalog</th><th>Delivered</th><th>Note</th>
                </tr></thead>
                <tbody>
                  {delivered.map(r => {
                    const d = deliveries.find(x => x.release_id === r.id);
                    return (
                      <tr key={r.id} className="border-b border-border/40">
                        <td className="py-2 px-2 font-medium"><Link to="/releases/$id" params={{ id: r.id }} className="hover:text-primary">{r.title}</Link></td>
                        <td className="text-muted-foreground font-mono text-xs">{r.catalog_number || "—"}</td>
                        <td className="text-xs text-muted-foreground">{r.delivered_at ? new Date(r.delivered_at).toLocaleString() : "—"}</td>
                        <td className="text-xs text-muted-foreground truncate max-w-[20rem]">{d?.notes || r.delivery_note || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="takedowns">
          <ReleaseTable rows={takedowns} onChanged={load} emptyIcon={ArrowDownToLine} emptyTitle="No takedowns" emptyDesc="Artist takedown requests will appear here." />
        </TabsContent>
        <TabsContent value="all">
          <ReleaseTable rows={rows} onChanged={load} emptyIcon={Disc3} emptyTitle="No releases" emptyDesc="" />
        </TabsContent>
      </Tabs>

      <DeliveryDialog release={deliverFor} onClose={() => setDeliverFor(null)} onDelivered={() => { setDeliverFor(null); load(); }} />
    </div>
  );
}

function ReleaseTable({ rows, onChanged, emptyIcon, emptyTitle, emptyDesc }: any) {
  if (rows.length === 0) return (
    <Card className="p-4 bg-card/60 border-border"><EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDesc} /></Card>
  );
  return (
    <Card className="p-4 bg-card/60 border-border">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
          <th className="py-2 px-2">Title</th><th>Type</th><th>UPC</th><th>Release date</th><th>Status</th><th className="text-right pr-2">Actions</th>
        </tr></thead>
        <tbody>
          {rows.map((r: any) => (
            <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
              <td className="py-3 px-2 font-medium">
                <Link to="/releases/$id" params={{ id: r.id }} className="hover:text-primary">{r.title}</Link>
              </td>
              <td className="capitalize text-muted-foreground">{r.release_type}</td>
              <td className="text-muted-foreground font-mono text-xs">{r.upc || "—"}</td>
              <td className="text-muted-foreground">{r.release_date || "—"}</td>
              <td><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadgeClass(r.status)}`}>{r.status.replace(/_/g, " ")}</span></td>
              <td className="text-right pr-2"><ReleaseRowActions row={r} onChanged={onChanged} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function DeliveryDialog({ release, onClose, onDelivered }: { release: any | null; onClose: () => void; onDelivered: () => void }) {
  const [dspStatus, setDspStatus] = useState<Record<string, { status: string; note?: string }>>({});
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const markDelivered = useServerFn(markDeliveredFn);

  useEffect(() => {
    if (release) {
      const init: Record<string, { status: string; note?: string }> = {};
      for (const dsp of DSPS) init[dsp] = { status: "sent" };
      setDspStatus(init);
      setNotes("");
    }
  }, [release?.id]);

  if (!release) return null;
  const setOne = (dsp: string, patch: Partial<{ status: string; note?: string }>) =>
    setDspStatus(s => ({ ...s, [dsp]: { ...(s[dsp] ?? { status: "sent" }), ...patch } }));

  const submit = async () => {
    setBusy(true);
    try {
      await markDelivered({ data: { releaseId: release.id, dspStatus, notes } });
      toast.success("Release marked delivered");
      onDelivered();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to mark delivered");
    } finally { setBusy(false); }
  };

  return (
    <Dialog open={!!release} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mark delivered — {release.title}</DialogTitle>
          <DialogDescription>Record per-DSP status. Some DSPs may reject even after a successful send — capture that in the note.</DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
          {DSPS.map(dsp => (
            <div key={dsp} className="flex items-center gap-2 border-b border-border/40 py-2">
              <div className="w-32 font-medium text-sm">{dsp}</div>
              <select className="bg-background border border-input rounded-md text-sm px-2 py-1"
                value={dspStatus[dsp]?.status ?? "sent"} onChange={e => setOne(dsp, { status: e.target.value })}>
                <option value="sent">Sent</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>
              <input className="flex-1 bg-background border border-input rounded-md text-sm px-2 py-1"
                placeholder="Note (optional)" value={dspStatus[dsp]?.note ?? ""}
                onChange={e => setOne(dsp, { note: e.target.value })} />
            </div>
          ))}
        </div>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="General delivery notes…" rows={3} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}><X className="h-4 w-4 mr-1" />Cancel</Button>
          <Button onClick={submit} disabled={busy}><Check className="h-4 w-4 mr-1" />{busy ? "Saving…" : "Confirm delivery"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
