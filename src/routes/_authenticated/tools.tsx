import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Wand2, Palette, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tools")({
  component: Tools,
});

const tools = [
  { id: "ai-mastering", name: "AI Mastering", icon: Sparkles, desc: "One-click mastering tuned for streaming platforms." },
  { id: "metadata-assistant", name: "AI Metadata Assistant", icon: Wand2, desc: "Auto-fill genres, moods, and tags from your audio." },
  { id: "artwork-studio", name: "Artwork Studio", icon: Palette, desc: "Generate album artwork from a prompt." },
];

function Tools() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Tools</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {tools.map(t => <ToolCard key={t.id} {...t} />)}
      </div>
    </div>
  );
}

function ToolCard({ id, name, icon: Icon, desc }: { id: string; name: string; icon: typeof Sparkles; desc: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <Card className="p-6 bg-card/60 relative overflow-hidden">
      <div className="absolute top-3 right-3 px-2 py-0.5 text-xs rounded-full bg-warning/15 text-warning">Coming Soon</div>
      <Icon className="h-8 w-8 text-primary mb-3" />
      <h3 className="font-semibold">{name}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">{desc}</p>
      {done ? (
        <div className="text-sm text-success">✓ We'll notify you</div>
      ) : (
        <div className="flex gap-2">
          <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <Button size="sm" onClick={async () => {
            if (!email) return;
            const { error } = await supabase.from("notify_waitlist").insert({ tool: id, email });
            if (error) return toast.error(error.message);
            setDone(true);
          }}><Bell className="h-3 w-3" /></Button>
        </div>
      )}
    </Card>
  );
}
