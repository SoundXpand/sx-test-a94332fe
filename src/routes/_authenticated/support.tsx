import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { LifeBuoy, Send, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/_authenticated/support")({
  component: Support,
  head: () => ({ meta: [{ title: "Support — SoundXpand" }] }),
});

const TicketSchema = z.object({
  subject: z.string().trim().min(3, "Subject too short").max(120),
  priority: z.enum(["low", "normal", "high"]),
  category: z.string().min(1),
  body: z.string().trim().min(10, "Please describe your issue (min 10 chars)").max(4000),
});

const faqs = [
  { q: "How long does it take for a release to go live?", a: "Most platforms take 1-7 business days after submission." },
  { q: "When do I receive royalties?", a: "Royalty statements are generated monthly and payable from $10." },
  { q: "Can I edit a release after it's live?", a: "Metadata edits are possible. Audio replacement requires a new submission." },
  { q: "What audio format do you accept?", a: "MP3 320 kbps minimum, WAV preferred for highest quality." },
];

function Support() {
  const [tab, setTab] = useState("tickets");
  const [tickets, setTickets] = useState<any[]>([]);
  const [openTicket, setOpenTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({ subject: "", priority: "normal" as const, category: "technical", body: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("support_tickets").select("*").order("updated_at", { ascending: false });
    setTickets(data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openThread = async (t: any) => {
    setOpenTicket(t);
    const { data } = await supabase.from("support_messages").select("*").eq("ticket_id", t.id).order("created_at");
    setMessages(data ?? []);
  };

  const submitTicket = async () => {
    const parsed = TicketSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { data: t, error } = await supabase.from("support_tickets").insert({
        user_id: u.user.id, subject: form.subject, priority: form.priority, status: "open",
      }).select().single();
      if (error) throw error;
      await supabase.from("support_messages").insert({ ticket_id: t.id, user_id: u.user.id, body: `[${form.category}] ${form.body}` });
      toast.success("Ticket created");
      setForm({ subject: "", priority: "normal", category: "technical", body: "" });
      setTab("tickets");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  const sendReply = async () => {
    if (!openTicket || !reply.trim()) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("support_messages").insert({ ticket_id: openTicket.id, user_id: u.user.id, body: reply.trim() });
    if (error) return toast.error(error.message);
    await supabase.from("support_tickets").update({ status: "waiting_admin", updated_at: new Date().toISOString() }).eq("id", openTicket.id);
    setReply("");
    openThread(openTicket);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><LifeBuoy className="h-5 w-5" /></div>
        <h1 className="font-display text-2xl font-semibold">Support</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="tickets">My tickets ({tickets.length})</TabsTrigger>
          <TabsTrigger value="new"><Plus className="h-3.5 w-3.5 mr-1" />New ticket</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <Card className="p-0 bg-card/60 border-border overflow-hidden">
            {tickets.length === 0 ? (
              <div className="p-6"><EmptyState icon={LifeBuoy} title="No tickets" description="Create a ticket and our team will respond within 24h." /></div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="py-2 px-4">Subject</th><th>Priority</th><th>Status</th><th>Updated</th>
                </tr></thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id} className="border-b border-border/40 hover:bg-muted/30 cursor-pointer" onClick={() => openThread(t)}>
                      <td className="py-2.5 px-4 font-medium">{t.subject}</td>
                      <td className="capitalize">{t.priority}</td>
                      <td><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${ticketStatusClass(t.status)}`}>{t.status.replace(/_/g, " ")}</span></td>
                      <td className="text-muted-foreground text-xs">{new Date(t.updated_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="new">
          <Card className="p-6 bg-card/60 border-border max-w-2xl space-y-4">
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Brief summary" maxLength={120} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="release">Release issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Message *</Label>
              <Textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={6} placeholder="Describe what happened, steps to reproduce, any release IDs…" maxLength={4000} />
            </div>
            <Button onClick={submitTicket} disabled={busy}>{busy ? "Submitting…" : <><Send className="h-4 w-4 mr-1.5" />Submit ticket</>}</Button>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card className="p-6 bg-card/60 border-border max-w-3xl">
            <Accordion type="single" collapsible>
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`f${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!openTicket} onOpenChange={o => !o && setOpenTicket(null)}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle className="truncate">{openTicket?.subject}</SheetTitle>
            <div className="flex gap-2 text-xs">
              {openTicket && <span className={`px-2 py-0.5 rounded-full capitalize ${ticketStatusClass(openTicket.status)}`}>{openTicket.status?.replace(/_/g, " ")}</span>}
              {openTicket && <span className="px-2 py-0.5 rounded-full bg-muted capitalize">{openTicket.priority}</span>}
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto space-y-3 my-4">
            {messages.map(m => (
              <div key={m.id} className="rounded-lg bg-muted/40 p-3 text-sm">
                <div className="text-[10px] text-muted-foreground mb-1">{new Date(m.created_at).toLocaleString()}</div>
                <div className="whitespace-pre-wrap">{m.body}</div>
              </div>
            ))}
            {messages.length === 0 && <div className="text-muted-foreground text-sm">No messages yet.</div>}
          </div>
          <div className="space-y-2">
            <Textarea value={reply} onChange={e => setReply(e.target.value)} rows={3} placeholder="Type a reply…" />
            <Button className="w-full" onClick={sendReply} disabled={!reply.trim()}><Send className="h-4 w-4 mr-1.5" />Send reply</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function ticketStatusClass(s: string) {
  switch (s) {
    case "open": return "bg-amber-500/15 text-amber-500";
    case "in_progress": return "bg-blue-500/15 text-blue-500";
    case "waiting_user": return "bg-orange-500/15 text-orange-500";
    case "waiting_admin": return "bg-purple-500/15 text-purple-500";
    case "resolved": return "bg-success/15 text-success";
    case "closed": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
  }
}
