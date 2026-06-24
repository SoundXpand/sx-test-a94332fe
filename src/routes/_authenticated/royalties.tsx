import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DollarSign, Download, Upload, Trash2 } from "lucide-react";
import { useCurrentUser, isStaff } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/royalties")({
  component: Royalties,
  head: () => ({ meta: [{ title: "Royalties — SoundXpand" }] }),
});

function Royalties() {
  const { data: me } = useCurrentUser();
  const staff = isStaff(me?.primaryRole);
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ username: "", period_label: "", summary: "", amount: "", currency: "USD" });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    let q = supabase.from("royalty_statement_files" as any).select("*").order("created_at", { ascending: false });
    if (!staff && me?.user.id) q = q.eq("owner_id", me.user.id);
    const { data } = await q;
    setRows((data as any[]) ?? []);
  };
  useEffect(() => { if (me) load(); }, [me, staff]);

  const upload = async () => {
    if (!staff) return;
    if (!form.username.trim() || !form.period_label.trim()) return toast.error("Username and period required");
    const file = fileRef.current?.files?.[0];
    setBusy(true);
    try {
      const { data: prof } = await supabase.from("profiles").select("user_id").eq("username", form.username.trim()).maybeSingle();
      let pdf_path: string | null = null;
      if (file) {
        const owner = (prof as any)?.user_id || "unmatched";
        pdf_path = `${owner}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("statements").upload(pdf_path, file, { upsert: true });
        if (upErr) throw upErr;
      }
      const { error } = await supabase.from("royalty_statement_files" as any).insert({
        owner_id: (prof as any)?.user_id ?? null,
        username: form.username.trim(),
        period_label: form.period_label.trim(),
        summary: form.summary || null,
        amount: Number(form.amount) || 0,
        currency: form.currency || "USD",
        pdf_path,
        uploaded_by: me!.user.id,
      });
      if (error) throw error;
      toast.success("Statement uploaded");
      setForm({ username: "", period_label: "", summary: "", amount: "", currency: "USD" });
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const downloadStatement = async (r: any) => {
    if (!r.pdf_path) return toast.error("No file");
    const { data, error } = await supabase.storage.from("statements").createSignedUrl(r.pdf_path, 60);
    if (error || !data) return toast.error(error?.message || "Failed");
    window.open(data.signedUrl, "_blank");
  };

  const remove = async (r: any) => {
    if (!staff) return;
    if (r.pdf_path) await supabase.storage.from("statements").remove([r.pdf_path]);
    const { error } = await supabase.from("royalty_statement_files" as any).delete().eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><DollarSign className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Royalties</h1>
          <p className="text-sm text-muted-foreground">{staff ? "Upload statements for users. They'll see only their own." : "Your monthly statements."}</p>
        </div>
      </div>

      {staff && (
        <Card className="p-6 bg-card/60 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><Upload className="h-4 w-4" />Upload statement</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>Username</Label><Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="SX003" /></div>
            <div><Label>Period</Label><Input value={form.period_label} onChange={e => setForm({ ...form, period_label: e.target.value })} placeholder="2026-05" /></div>
            <div><Label>Amount</Label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            <div><Label>Currency</Label><Input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Summary</Label><Textarea rows={2} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>PDF file</Label><Input ref={fileRef} type="file" accept="application/pdf" /></div>
          </div>
          <Button onClick={upload} disabled={busy}><Upload className="h-4 w-4 mr-1.5" />Upload</Button>
        </Card>
      )}

      <Card className="p-6 bg-card/60 space-y-3">
        <h2 className="font-semibold">Statements ({rows.length})</h2>
        {rows.length === 0 ? <div className="text-sm text-muted-foreground py-6 text-center">No statements yet.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="py-2">Username</th><th>Period</th><th>Summary</th><th className="text-right">Amount</th><th>Uploaded</th><th></th>
              </tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-b border-border/40">
                    <td className="py-2 font-mono text-xs">{staff ? <Link to="/users/$username" params={{ username: r.username }} className="hover:text-primary">{r.username}</Link> : r.username}</td>
                    <td>{r.period_label}</td>
                    <td className="text-muted-foreground truncate max-w-xs">{r.summary || "—"}</td>
                    <td className="text-right font-medium">{Number(r.amount).toLocaleString()} {r.currency}</td>
                    <td className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="text-right">
                      {r.pdf_path && <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => downloadStatement(r)}><Download className="h-3.5 w-3.5" /></Button>}
                      {staff && <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(r)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
