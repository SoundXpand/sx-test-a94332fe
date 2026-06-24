import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/releases/new")({
  component: NewRelease,
  head: () => ({ meta: [{ title: "New release — SoundXpand" }] }),
});

const STORES = [
  "Spotify", "Apple Music", "Amazon Music", "YouTube Music", "TikTok", "Instagram",
  "Facebook", "Deezer", "Tidal", "Boomplay", "JioSaavn", "Wynk", "Gaana",
];
const STEPS = ["Release details", "Artwork", "Tracks", "Audio", "Stores", "Review"];

type Track = { title: string; isrc: string; explicit: boolean; composer: string; producer: string };

function NewRelease() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [release, setRelease] = useState({
    title: "", version: "", release_type: "single",
    primary_genre: "", secondary_genre: "", language: "English",
    release_date: "", original_release_date: "", copyright_year: new Date().getFullYear(),
    record_label: "", upc: "", catalog_number: "", parental_advisory: false,
  });
  const [artwork, setArtwork] = useState<{ file: File | null; preview: string | null; valid: boolean }>({
    file: null, preview: null, valid: false,
  });
  const [tracks, setTracks] = useState<Track[]>([{ title: "", isrc: "", explicit: false, composer: "", producer: "" }]);
  const [audioFiles, setAudioFiles] = useState<(File | null)[]>([null]);
  const [stores, setStores] = useState<string[]>([...STORES]);

  const handleArtwork = (file: File) => {
    if (file.size > 10 * 1024 * 1024) return toast.error("Max 10MB");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const valid = img.width === 3000 && img.height === 3000;
      setArtwork({ file, preview: url, valid });
      if (!valid) toast.error(`Artwork must be 3000×3000. Got ${img.width}×${img.height}.`);
    };
    img.src = url;
  };

  const submit = async () => {
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      let artwork_path: string | null = null;
      if (artwork.file) {
        const path = `${u.user.id}/${Date.now()}-${artwork.file.name}`;
        const { error } = await supabase.storage.from("artwork").upload(path, artwork.file);
        if (!error) artwork_path = path;
      }
      const { data: rel, error: relErr } = await supabase.from("releases").insert({
        ...release,
        owner_id: u.user.id,
        artwork_path,
        store_selection: stores,
        status: "pending",
      }).select().single();
      if (relErr) throw relErr;

      for (let i = 0; i < tracks.length; i++) {
        const t = tracks[i];
        let audio_path: string | null = null;
        const af = audioFiles[i];
        if (af) {
          const p = `${u.user.id}/${rel.id}/${i}-${af.name}`;
          const { error } = await supabase.storage.from("audio").upload(p, af);
          if (!error) audio_path = p;
        }
        await supabase.from("release_tracks").insert({
          release_id: rel.id, track_number: i + 1,
          title: t.title, isrc: t.isrc || null,
          explicit: t.explicit, composer: t.composer || null, producer: t.producer || null,
          audio_path, file_size_bytes: af?.size ?? null,
        });
      }
      toast.success("Release submitted for review");
      navigate({ to: "/catalog" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-semibold">New release</h1>
        <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
      </div>

      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      <Card className="p-6 bg-card/60">
        {step === 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Release title"><Input value={release.title} onChange={e => setRelease({ ...release, title: e.target.value })} /></Field>
            <Field label="Version"><Input value={release.version} onChange={e => setRelease({ ...release, version: e.target.value })} placeholder="e.g. Remastered" /></Field>
            <Field label="Release type">
              <Select value={release.release_type} onValueChange={v => setRelease({ ...release, release_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="ep">EP</SelectItem>
                  <SelectItem value="album">Album</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Primary genre"><Input value={release.primary_genre} onChange={e => setRelease({ ...release, primary_genre: e.target.value })} /></Field>
            <Field label="Secondary genre"><Input value={release.secondary_genre} onChange={e => setRelease({ ...release, secondary_genre: e.target.value })} /></Field>
            <Field label="Language"><Input value={release.language} onChange={e => setRelease({ ...release, language: e.target.value })} /></Field>
            <Field label="Release date"><Input type="date" value={release.release_date} onChange={e => setRelease({ ...release, release_date: e.target.value })} /></Field>
            <Field label="Original release date"><Input type="date" value={release.original_release_date} onChange={e => setRelease({ ...release, original_release_date: e.target.value })} /></Field>
            <Field label="Copyright year"><Input type="number" value={release.copyright_year} onChange={e => setRelease({ ...release, copyright_year: Number(e.target.value) })} /></Field>
            <Field label="Record label"><Input value={release.record_label} onChange={e => setRelease({ ...release, record_label: e.target.value })} /></Field>
            <Field label="UPC"><Input value={release.upc} onChange={e => setRelease({ ...release, upc: e.target.value })} /></Field>
            <Field label="Catalog number"><Input value={release.catalog_number} onChange={e => setRelease({ ...release, catalog_number: e.target.value })} /></Field>
            <label className="flex items-center gap-2 col-span-2">
              <Checkbox checked={release.parental_advisory} onCheckedChange={v => setRelease({ ...release, parental_advisory: !!v })} />
              Parental advisory
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">3000×3000 RGB JPEG/PNG, max 10MB.</p>
            <Input type="file" accept="image/png,image/jpeg" onChange={e => e.target.files?.[0] && handleArtwork(e.target.files[0])} />
            {artwork.preview && (
              <div className="flex items-center gap-4">
                <img src={artwork.preview} alt="" className="h-40 w-40 rounded-xl object-cover border border-border" />
                <div className={`text-sm ${artwork.valid ? "text-success" : "text-destructive"}`}>
                  {artwork.valid ? "✓ Valid 3000×3000 artwork" : "Wrong dimensions"}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {tracks.map((t, i) => (
              <Card key={i} className="p-4 bg-muted/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Track {i + 1}</span>
                  {tracks.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => {
                      setTracks(tracks.filter((_, j) => j !== i));
                      setAudioFiles(audioFiles.filter((_, j) => j !== i));
                    }}>Remove</Button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <Field label="Title"><Input value={t.title} onChange={e => { const c = [...tracks]; c[i].title = e.target.value; setTracks(c); }} /></Field>
                  <Field label="ISRC"><Input value={t.isrc} onChange={e => { const c = [...tracks]; c[i].isrc = e.target.value; setTracks(c); }} /></Field>
                  <Field label="Composer"><Input value={t.composer} onChange={e => { const c = [...tracks]; c[i].composer = e.target.value; setTracks(c); }} /></Field>
                  <Field label="Producer"><Input value={t.producer} onChange={e => { const c = [...tracks]; c[i].producer = e.target.value; setTracks(c); }} /></Field>
                  <label className="flex items-center gap-2 col-span-2">
                    <Checkbox checked={t.explicit} onCheckedChange={v => { const c = [...tracks]; c[i].explicit = !!v; setTracks(c); }} />
                    Explicit content
                  </label>
                </div>
              </Card>
            ))}
            <Button variant="outline" onClick={() => { setTracks([...tracks, { title: "", isrc: "", explicit: false, composer: "", producer: "" }]); setAudioFiles([...audioFiles, null]); }}>
              + Add track
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">MP3 320 kbps recommended.</p>
            {tracks.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/10">
                <span className="text-sm font-medium w-32 truncate">{t.title || `Track ${i + 1}`}</span>
                <Input type="file" accept="audio/mpeg,audio/wav" onChange={e => {
                  const c = [...audioFiles]; c[i] = e.target.files?.[0] ?? null; setAudioFiles(c);
                }} />
                {audioFiles[i] && <span className="text-xs text-success">✓ {(audioFiles[i]!.size / 1024 / 1024).toFixed(1)}MB</span>}
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {STORES.map(s => {
              const on = stores.includes(s);
              return (
                <button key={s} onClick={() => setStores(on ? stores.filter(x => x !== s) : [...stores, s])}
                  className={`p-4 rounded-xl border text-sm transition ${on ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                  <div className="flex items-center gap-2">{on && <Check className="h-4 w-4" />}{s}</div>
                </button>
              );
            })}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 text-sm">
            <Row k="Title" v={release.title} />
            <Row k="Type" v={release.release_type} />
            <Row k="Genre" v={release.primary_genre} />
            <Row k="Release date" v={release.release_date} />
            <Row k="Tracks" v={String(tracks.length)} />
            <Row k="Audio uploaded" v={`${audioFiles.filter(Boolean).length}/${tracks.length}`} />
            <Row k="Artwork" v={artwork.valid ? "✓ Valid" : "✗ Missing or invalid"} />
            <Row k="Stores" v={`${stores.length} selected`} />
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
        ) : (
          <Button onClick={submit} disabled={busy}>{busy ? "Submitting…" : "Submit release"}</Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b border-border/50 py-2"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v || "—"}</span></div>;
}
