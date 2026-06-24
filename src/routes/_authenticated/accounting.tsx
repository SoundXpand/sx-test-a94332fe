import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileSpreadsheet, Loader2, Receipt, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser, isStaff } from "@/hooks/use-current-user";
import { ACCOUNTING_HEADERS, downloadAccountingTemplate, parseAccountingFile } from "@/lib/metadata-export";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/accounting")({
  component: Accounting,
  head: () => ({ meta: [{ title: "Accounting — SoundXpand" }] }),
});

function Accounting() {
  const { data: me, isLoading } = useCurrentUser();
  const staff = isStaff(me?.primaryRole);
  const [uploads, setUploads] = useState<any[]>([]);
  const [period, setPeriod] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadUploads = async () => {
    const { data } = await supabase.from("analytics_uploads" as any).select("*").order("created_at", { ascending: false }).limit(50);
    setUploads((data as any[]) ?? []);
  };

  useEffect(() => {
    if (!staff) return;
    loadUploads();
    const ch = supabase.channel("analytics_uploads")
      .on("postgres_changes", { event: "*", schema: "public", table: "analytics_uploads" }, () => loadUploads())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [staff]);

  const handleUpload = async (file: File) => {
    setBusy(true);
    try {
      const rows = await parseAccountingFile(file);
      if (rows.length === 0) { toast.error("File is empty"); setBusy(false); return; }
      const headers = Object.keys(rows[0] ?? {});
      const missing = ACCOUNTING_HEADERS.filter(h => !headers.includes(h));
      if (missing.length > 5) toast.warning(`Missing columns: ${missing.slice(0, 5).join(", ")}…`);

      const usernames = Array.from(new Set(rows.map(r => String(r.username || "").trim()).filter(Boolean)));
      const usernamesLower = usernames.map(u => u.toLowerCase());
      const { data: profs } = await supabase.from("profiles").select("user_id,username").in("username", usernames);
      // Also try case-insensitive match for unmatched
      const usernameToId = new Map<string, string>();
      (profs ?? []).forEach((p: any) => usernameToId.set(p.username.toLowerCase(), p.user_id));
      const unmatched = usernamesLower.filter(u => !usernameToId.has(u));
      if (unmatched.length) toast.warning(`${unmatched.length} username(s) had no matching user — rows ingested with no owner.`);

      const { data: u } = await supabase.auth.getUser();
      const { data: upload, error: upErr } = await (supabase.from("analytics_uploads" as any).insert({
        uploaded_by: u.user?.id, filename: file.name, period_label: period || null, row_count: rows.length, status: "processing",
      }).select().single() as any);
      if (upErr) throw upErr;

      const toInsert = rows.map(r => {
        const uname = String(r.username || "").trim().toLowerCase();
        const pb = r.period_begins || null;
        const pe = r.period_ends || null;
        return {
          upload_id: (upload as any).id,
          owner_id: usernameToId.get(uname) ?? null,
          username: r.username ?? null,
          sale_type: r.sale_type ?? null,
          censor_catalogue_number: r.censor_catalogue_number ?? null,
          recording_title: r.recording_title ?? null,
          artists: r.artists ?? null,
          isrc: r.isrc ?? null,
          licensee_catalogue_number: r.licensee_catalogue_number ?? null,
          source: r.source ?? null,
          period_begins: pb,
          period_ends: pe,
          date: pb || pe || new Date().toISOString().slice(0, 10),
          country: r.country ?? null,
          platform: r.outlet ?? r.source ?? "unknown",
          right_type_group: r.right_type_group ?? null,
          use_type: r.use_type ?? null,
          outlet: r.outlet ?? null,
          collection_share: numOrNull(r.collection_share),
          quantity: numOrNull(r.quantity),
          licensor_revenue: numOrNull(r.licensor_revenue),
          source_currency: r.source_currency ?? null,
          licensor_currency: r.licensor_currency ?? null,
          conversion_rate: numOrNull(r.conversion_rate),
          release_title: r.release_title ?? null,
          release_ean: r.release_ean ?? null,
          commercial_model: r.commercial_model ?? null,
          product: r.product ?? null,
          streams: Number(r.quantity) || 0,
          revenue: Number(r.licensor_revenue) || 0,
        };
      });

      const chunkSize = 500;
      for (let i = 0; i < toInsert.length; i += chunkSize) {
        const { error } = await supabase.from("analytics_rows" as any).insert(toInsert.slice(i, i + chunkSize));
        if (error) throw error;
      }
      await supabase.from("analytics_uploads" as any).update({ status: "completed" } as any).eq("id", (upload as any).id);
      toast.success(`Imported ${rows.length} rows`);
      setPeriod("");
      if (fileRef.current) fileRef.current.value = "";
      loadUploads();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!staff) return <div className="p-8 text-sm text-muted-foreground">Staff only.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><Receipt className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Accounting</h1>
          <p className="text-sm text-muted-foreground">Upload monthly royalty/sales reports. Artists see their rows in Analytics.</p>
        </div>
      </div>

      <Card className="p-6 bg-card/60 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-semibold flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" />Upload report</h2>
          <Button variant="outline" size="sm" onClick={downloadAccountingTemplate}>
            <Download className="h-4 w-4 mr-1.5" />Download template
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>Period label (optional)</Label>
            <Input value={period} onChange={e => setPeriod(e.target.value)} placeholder="e.g. 2026-05 May" />
          </div>
          <div>
            <Label>Excel/CSV file</Label>
            <Input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" disabled={busy}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Required columns (in order): {ACCOUNTING_HEADERS.join(", ")}
        </div>
        {busy && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Processing…</div>}
      </Card>

      <Card className="p-6 bg-card/60 space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><Upload className="h-4 w-4" />Upload history (live)</h2>
        {uploads.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg">No uploads yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="py-2">When</th><th>File</th><th>Period</th><th>Rows</th><th>Status</th><th className="text-right">Actions</th>
              </tr></thead>
              <tbody>
                {uploads.map(u => (
                  <tr key={u.id} className="border-b border-border/40">
                    <td className="py-2 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</td>
                    <td className="font-mono text-xs">{u.filename}</td>
                    <td>{u.period_label || "—"}</td>
                    <td>{u.row_count}</td>
                    <td><Badge variant={u.status === "completed" ? "default" : "secondary"} className="capitalize text-[10px]">{u.status}</Badge></td>
                    <td className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete upload?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently deletes <span className="font-mono">{u.filename}</span> and all {u.row_count} analytics rows imported with it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={async () => {
                              const { error } = await supabase.from("analytics_uploads" as any).delete().eq("id", u.id);
                              if (error) toast.error(error.message); else { toast.success("Upload deleted"); loadUploads(); }
                            }}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="text-xs text-muted-foreground">
        Need to view uploaded data? Open <Link to="/analytics" className="text-primary hover:underline">Analytics</Link>.
      </div>
    </div>
  );
}

function numOrNull(v: any) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}
