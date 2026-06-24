import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShieldCheck, Send, Search, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ticketStatusClass } from "@/routes/_authenticated/support";

export const Route = createFileRoute("/_authenticated/admin/tickets")({
  component: AdminTickets,
  head: () => ({ meta: [{ title: "Admin · Tickets — SoundXpand" }] }),
});

function AdminTickets() {
  const { data: me, isLoading } = useCurrentUser();
  const isAdmin = me?.primaryRole === "administrator" || (me?.primaryRole as any) === "admin";
  const [tickets, setTickets] = useState<any[]>([]);
  const [open, setOpen] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    const { data } = await supabase.from("support_tickets").select("*").order("updated_at", { ascending: false });
    const list = data ?? [];
    const ids = Array.from(new Set(list.map((t: any) => t.user_id).filter(Boolean)));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("user_id,username,full_name,email").in("user_id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.user_id, p]));
      setTickets(list.map((t: any) => ({ ...t, _profile: map.get(t.user_id) })));
    } else {
      setTickets(list);
    }
  }, []);
  useEffect(() => { if (isAdmin) load(); }, [load, isAdmin]);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!isAdmin) return <Navigate to="/dashboard" />;

  const openThread = async (t: any) => {
    setOpen(t);
    const { data } = await supabase.from("support_messages").select("*").eq("ticket_id", t.id).order("created_at");
    setMessages(data ?? []);
  };

  const sendReply = async () => {
    if (!open || !reply.trim()) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("support_messages").insert({ ticket_id: open.id, user_id: u.user.id, body: reply.trim() });
    await supabase.from("support_tickets").update({ status: "waiting_user", updated_at: new Date().toISOString() }).eq("id", open.id);
    setReply("");
    openThread({ ...open, status: "waiting_user" });
    load();
    toast.success("Reply sent");
  };

  const updateMeta = async (patch: any) => {
    if (!open) return;
    await supabase.from("support_tickets").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", open.id);
    setOpen({ ...open, ...patch });
    load();
  };

  const filtered = tickets.filter(t =>
    (filter === "all" || t.status === filter) &&
    (!q || t.subject.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><ShieldCheck className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Admin · Tickets</h1>
          <p className="text-sm text-muted-foreground">{tickets.filter(t => t.status === "open" || t.status === "waiting_admin").length} need attention</p>
        </div>
      </div>

      <Card className="p-4 bg-card/60 border-border">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search subjects…" className="pl-8 w-72" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="waiting_admin">Waiting admin</SelectItem>
              <SelectItem value="waiting_user">Waiting user</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="py-2 px-2">Subject</th><th>Priority</th><th>Status</th><th>Updated</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No tickets match.</td></tr>}
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-border/40 hover:bg-muted/30 cursor-pointer" onClick={() => openThread(t)}>
                  <td className="py-2.5 px-2 font-medium">{t.subject}</td>
                  <td className="capitalize">{t.priority}</td>
                  <td><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${ticketStatusClass(t.status)}`}>{t.status.replace(/_/g, " ")}</span></td>
                  <td className="text-muted-foreground text-xs">{new Date(t.updated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet open={!!open} onOpenChange={o => !o && setOpen(null)}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle className="truncate">{open?.subject}</SheetTitle>
          </SheetHeader>
          {open && (
            <div className="grid grid-cols-2 gap-2 my-3">
              <Select value={open.status} onValueChange={v => updateMeta({ status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="waiting_user">Waiting user</SelectItem>
                  <SelectItem value="waiting_admin">Waiting admin</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={open.priority} onValueChange={v => updateMeta({ priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.map(m => (
              <div key={m.id} className="rounded-lg bg-muted/40 p-3 text-sm">
                <div className="text-[10px] text-muted-foreground mb-1">{new Date(m.created_at).toLocaleString()}</div>
                <div className="whitespace-pre-wrap">{m.body}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Textarea value={reply} onChange={e => setReply(e.target.value)} rows={3} placeholder="Reply to user…" />
            <Button className="w-full" onClick={sendReply} disabled={!reply.trim()}><Send className="h-4 w-4 mr-1.5" />Send reply</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
