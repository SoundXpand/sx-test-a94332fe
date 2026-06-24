import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search, ExternalLink, Link2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/_authenticated/tools/dsp-lookup")({
  component: DspLookup,
  head: () => ({ meta: [{ title: "DSP lookup — SoundXpand" }] }),
});

type Hit = { platform: string; title: string; artist: string; url: string; externalId: string; artwork?: string };

function DspLookup() {
  const [upc, setUpc] = useState("");
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [releases, setReleases] = useState<{ id: string; title: string }[]>([]);
  const [attachTo, setAttachTo] = useState<string>("");

  useEffect(() => {
    supabase.from("releases").select("id,title").order("created_at", { ascending: false })
      .then(r => setReleases(r.data ?? []));
  }, []);

  const search = async () => {
    setBusy(true);
    setHits(null);
    try {
      const r = await fetch("/api/dsp-lookup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upc: upc || undefined, artist, title }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Lookup failed");
      setHits(j.hits ?? []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const attach = async (h: Hit) => {
    if (!attachTo) return toast.error("Pick a release to attach to");
    const { error } = await supabase.from("release_links").upsert({
      release_id: attachTo, platform: h.platform, url: h.url, external_id: h.externalId, artwork_url: h.artwork,
    }, { onConflict: "release_id,platform" });
    if (error) return toast.error(error.message);
    toast.success(`${h.platform} link attached`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">DSP lookup</h1>
        <p className="text-sm text-muted-foreground">Search Spotify, YouTube and Deezer by UPC or artist + title, then attach links to your releases.</p>
      </div>

      <Card className="p-5 bg-card/60 border-border space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div><Label>UPC / Barcode</Label><Input value={upc} onChange={e => setUpc(e.target.value)} placeholder="e.g. 196589123456" /></div>
          <div><Label>Artist</Label><Input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist name" /></div>
          <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Track or album title" /></div>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Attach hits to:</Label>
            <Select value={attachTo} onValueChange={setAttachTo}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Select a release" /></SelectTrigger>
              <SelectContent>
                {releases.map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={search} disabled={busy || (!upc && !artist && !title)}>
            {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Search className="h-4 w-4 mr-1.5" />}
            Search
          </Button>
        </div>
      </Card>

      {hits === null ? null : hits.length === 0 ? (
        <EmptyState icon={Search} title="No matches" description="Try a different UPC or simplify the artist/title query." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hits.map((h, i) => (
            <Card key={i} className="p-3 bg-card/60 border-border flex gap-3">
              <div className="h-20 w-20 shrink-0 rounded-md overflow-hidden bg-muted">
                {h.artwork && <img src={h.artwork} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="text-xs text-muted-foreground">{h.platform}</div>
                <div className="font-medium truncate">{h.title}</div>
                <div className="text-xs text-muted-foreground truncate">{h.artist}</div>
                <div className="mt-auto flex gap-1.5 pt-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={h.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" />Open</a>
                  </Button>
                  <Button size="sm" onClick={() => attach(h)} disabled={!attachTo}>
                    <Link2 className="h-3.5 w-3.5 mr-1" />Attach
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
