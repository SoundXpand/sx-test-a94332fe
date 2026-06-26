import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Play, Pause, Loader2 } from "lucide-react";

let currentAudio: HTMLAudioElement | null = null;

export function AudioPlayButton({ path }: { path?: string | null }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");

  useEffect(() => () => { ref.current?.pause(); }, []);

  if (!path) return <span className="text-muted-foreground text-xs">—</span>;

  const toggle = async () => {
    if (state === "playing") { ref.current?.pause(); setState("idle"); return; }
    setState("loading");
    const { data } = await supabase.storage.from("audio").createSignedUrl(path, 600);
    if (!data?.signedUrl) { setState("idle"); return; }
    if (currentAudio && currentAudio !== ref.current) { currentAudio.pause(); }
    const a = new Audio(data.signedUrl);
    ref.current = a; currentAudio = a;
    a.onended = () => setState("idle");
    a.onpause = () => setState(s => (s === "playing" ? "idle" : s));
    try { await a.play(); setState("playing"); }
    catch { setState("idle"); }
  };

  return (
    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={toggle} title={state === "playing" ? "Pause" : "Play"}>
      {state === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : state === "playing" ? <Pause className="h-3.5 w-3.5" />
        : <Play className="h-3.5 w-3.5" />}
    </Button>
  );
}
