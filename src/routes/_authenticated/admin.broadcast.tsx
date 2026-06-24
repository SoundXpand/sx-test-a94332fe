import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Megaphone } from "lucide-react";
import { useCurrentUser, isStaff } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/admin/broadcast")({
  component: Broadcast,
  head: () => ({ meta: [{ title: "Broadcast — SoundXpand" }] }),
});

function Broadcast() {
  const { data: me } = useCurrentUser();
  const staff = isStaff(me?.primaryRole);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("notifications" as any).select("*").is("user_id", null).order("created_at", { ascending: false }).limit(30);
    setRecent((data as any[]) ?? []);
  };
  useEffect(() => { if (staff) load(); }, [staff]);

  const send = async () => {
    if (!title.trim()) return toast.error("Title required");
    setBusy(true);
    const { error } = await supabase.from("notifications" as any).insert({
      user_id: null, kind: "broadcast", title, body: body || null, link: link || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Broadcast sent");
    setTitle(""); setBody(""); setLink("");
    load();
  };

  if (!staff) return <div className="text-sm text-muted-foreground">Staff only.</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><Megaphone className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-2xl font-semibold">Broadcast</h1>
          <p className="text-sm text-muted-foreground">Send a notification to every user.</p>
        </div>
      </div>

      <Card className="p-6 bg-card/60 space-y-3">
        <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Big news!" /></div>
        <div><Label>Message</Label><Textarea rows={4} value={body} onChange={e => setBody(e.target.value)} /></div>
        <div><Label>Link (optional)</Label><Input value={link} onChange={e => setLink(e.target.value)} placeholder="/releases" /></div>
        <Button onClick={send} disabled={busy}><Send className="h-4 w-4 mr-1.5" />Send to all users</Button>
      </Card>

      <Card className="p-6 bg-card/60 space-y-3">
        <h2 className="font-semibold">Recent broadcasts</h2>
        {recent.length === 0 ? <div className="text-sm text-muted-foreground">None yet.</div> : (
          <ul className="divide-y divide-border">
            {recent.map(n => (
              <li key={n.id} className="py-2.5">
                <div className="font-medium text-sm">{n.title}</div>
                {n.body && <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>}
                <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
