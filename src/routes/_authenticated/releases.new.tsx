import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Check, ChevronRight, ChevronLeft, Save, Sparkles, ImageIcon, Disc3, Music as MusicIcon } from "lucide-react";
import { toast } from "sonner";
import { ArtistMultiSelect, useMyArtists } from "@/components/artist-multi-select";

export const Route = createFileRoute("/_authenticated/releases/new")({
  component: NewRelease,
  head: () => ({ meta: [{ title: "New release — SoundXpand" }] }),
});

const STORES = [
  "Spotify", "Apple Music", "Amazon Music", "YouTube Music", "TikTok", "Instagram",
  "Facebook", "Deezer", "Tidal", "Boomplay", "JioSaavn", "Wynk", "Gaana",
];
const STEPS = ["Release details", "Artwork", "Tracks", "Audio", "Distribution", "Review"];

type Track = {
  title: string; version: string; language: string; explicit: boolean; isrc: string;
  composer: string; lyricist: string; producer: string; featured_artist: string;
  copyright_owner: string; publishing_info: string;
  artist_ids: string[];
};

const blankTrack = (): Track => ({
  title: "", version: "", language: "English", explicit: false, isrc: "",
  composer: "", lyricist: "", producer: "", featured_artist: "",
  copyright_owner: "", publishing_info: "",
  artist_ids: [],
});

function NewRelease() {
  const navigate = useNavigate();
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const draft = params.get("draft");
  const editId = params.get("edit");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [sourceReleaseId, setSourceReleaseId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [release, setRelease] = useState({
    title: "", artist_name: "", primary_artist: "", version: "", release_type: "single",
    primary_genre: "", secondary_genre: "", language: "English",
    release_date: "", original_release_date: "", copyright_year: new Date().getFullYear(),
    record_label: "", upc: "", catalog_number: "", parental_advisory: false,
    description: "", producer_info: "", copyright_info: "",
  });
  const [artwork, setArtwork] = useState<{ file: File | null; preview: string | null; width?: number; height?: number; size?: number; valid: boolean }>({
    file: null, preview: null, valid: false,
  });
  const [tracks, setTracks] = useState<Track[]>([blankTrack()]);
  const [audioFiles, setAudioFiles] = useState<(File | null)[]>([null]);
  const [audioMeta, setAudioMeta] = useState<Array<{ duration?: number; valid: boolean; reason?: string } | null>>([null]);
  const [stores, setStores] = useState<string[]>([...STORES]);
  const [storeQuery, setStoreQuery] = useState("");
  const [territory, setTerritory] = useState<"worldwide" | "custom">("worldwide");
  const [pricing, setPricing] = useState("mid");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  // AI artwork
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInputs, setAiInputs] = useState({ mood: "", color: "", style: "minimal" });
  const [aiBusy, setAiBusy] = useState(false);
  const [aiImages, setAiImages] = useState<string[]>([]);

  // Load draft if requested
  useEffect(() => {
    if (!draft) return;
    (async () => {
      const { data } = await supabase.from("release_drafts").select("*").eq("id", draft).maybeSingle();
      if (data) {
        setDraftId(data.id);
        setStep(data.current_step || 0);
        setSourceReleaseId((data as any).source_release_id ?? null);
        const p = (data.payload as any) || {};
        if (p.release) setRelease(p.release);
        if (p.tracks) setTracks(p.tracks);
        if (p.stores) setStores(p.stores);
        if (p.territory) setTerritory(p.territory);
        if (p.pricing) setPricing(p.pricing);
        if (p.rightsConfirmed) setRightsConfirmed(true);
      }
    })();
  }, [draft]);

  // Load existing release for edit (creates an edit-draft tied via source_release_id)
  useEffect(() => {
    if (!editId) return;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: rel } = await supabase.from("releases").select("*").eq("id", editId).maybeSingle();
      if (!rel) return;
      const { data: trk } = await supabase.from("release_tracks").select("*").eq("release_id", editId).order("track_number");
      const releaseState = {
        title: rel.title || "", artist_name: "", primary_artist: "", version: rel.version || "",
        release_type: rel.release_type || "single",
        primary_genre: rel.primary_genre || "", secondary_genre: rel.secondary_genre || "",
        language: rel.language || "English",
        release_date: rel.release_date || "", original_release_date: rel.original_release_date || "",
        copyright_year: rel.copyright_year || new Date().getFullYear(),
        record_label: rel.record_label || "", upc: rel.upc || "", catalog_number: rel.catalog_number || "",
        parental_advisory: !!rel.parental_advisory,
        description: "", producer_info: "", copyright_info: "",
      };
      const trackState: Track[] = (trk ?? []).map(t => ({
        title: t.title, version: t.version || "", language: t.language || "English",
        explicit: !!t.explicit, isrc: t.isrc || "",
        composer: t.composer || "", lyricist: t.lyricist || "",
        producer: t.producer || "", featured_artist: t.featured_artist || "",
        copyright_owner: t.copyright_owner || "", publishing_info: t.publishing_info || "",
        artist_ids: [],
      }));
      setRelease(releaseState);
      if (trackState.length) {
        setTracks(trackState);
        setAudioFiles(new Array(trackState.length).fill(null));
        setAudioMeta(new Array(trackState.length).fill({ valid: true, reason: "Existing audio kept" }));
      }
      if (Array.isArray(rel.store_selection)) setStores(rel.store_selection as string[]);
      setSourceReleaseId(editId);
      // Create an edit-draft so progress saves
      const payload = { release: releaseState, tracks: trackState, stores: rel.store_selection ?? STORES, territory: "worldwide", pricing: "mid", rightsConfirmed: false };
      const { data: d } = await supabase.from("release_drafts").insert({
        owner_id: u.user.id, title: rel.title || "Untitled release", payload, current_step: 0, source_release_id: editId,
      } as any).select().single();
      if (d) setDraftId(d.id);
      toast.info("Editing existing release — submit will resubmit for review.");
    })();
  }, [editId]);

  // Autosave
  const lastSave = useRef(0);
  useEffect(() => {
    const handle = setTimeout(async () => {
      if (!release.title) return;
      const now = Date.now();
      if (now - lastSave.current < 8000) return;
      lastSave.current = now;
      await saveDraft(false);
    }, 10000);
    return () => clearTimeout(handle);
  });

  const saveDraft = async (loud = true) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const payload = { release, tracks, stores, territory, pricing };
    if (draftId) {
      await supabase.from("release_drafts").update({ title: release.title || "Untitled release", payload, current_step: step }).eq("id", draftId);
    } else {
      const { data } = await supabase.from("release_drafts").insert({
        owner_id: u.user.id, title: release.title || "Untitled release", payload, current_step: step,
      }).select().single();
      if (data) setDraftId(data.id);
    }
    if (loud) toast.success("Draft saved");
  };

  const handleArtwork = (file: File) => {
    if (file.size > 10 * 1024 * 1024) return toast.error("Artwork must be ≤ 10MB");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const valid = img.width === 3000 && img.height === 3000;
      setArtwork({ file, preview: url, width: img.width, height: img.height, size: file.size, valid });
      if (!valid) toast.error(`Artwork must be 3000×3000. Got ${img.width}×${img.height}.`);
    };
    img.src = url;
  };

  const handleAudio = async (i: number, file: File) => {
    const next = [...audioFiles]; next[i] = file; setAudioFiles(next);
    try {
      const buf = await file.arrayBuffer();
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decoded = await ctx.decodeAudioData(buf.slice(0));
      const duration = decoded.duration;
      const channels = decoded.numberOfChannels;
      const sampleRate = decoded.sampleRate;
      const isMp3 = file.type === "audio/mpeg" || file.name.toLowerCase().endsWith(".mp3");
      const validRate = sampleRate === 44100 || sampleRate === 48000;
      const validCh = channels === 2;
      const valid = isMp3 && validRate && validCh;
      const reason = !isMp3 ? "Not MP3" : !validRate ? `Sample rate ${sampleRate} Hz` : !validCh ? `${channels} channel(s)` : undefined;
      const m = [...audioMeta]; m[i] = { duration, valid, reason }; setAudioMeta(m);
    } catch {
      const m = [...audioMeta]; m[i] = { valid: false, reason: "Could not decode" }; setAudioMeta(m);
    }
  };

  const generateAi = async () => {
    setAiBusy(true);
    try {
      const prompt = `Album cover artwork for "${release.title || "Untitled"}" by ${release.artist_name || "artist"}. Genre: ${release.primary_genre || "music"}. Mood: ${aiInputs.mood || "atmospheric"}. Color theme: ${aiInputs.color || "deep blues and gold"}. Style: ${aiInputs.style}. Square 1:1, no text, no watermarks.`;
      const res = await fetch("/api/generate-image", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const urls: string[] = (json.data ?? []).map((d: any) => d.url || (d.b64_json ? `data:image/png;base64,${d.b64_json}` : null)).filter(Boolean);
      setAiImages(prev => [...urls, ...prev].slice(0, 8));
    } catch (e) {
      toast.error("AI generation failed: " + (e as Error).message);
    } finally { setAiBusy(false); }
  };

  const attachAiImage = async (url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const file = new File([blob], "ai-artwork.png", { type: blob.type || "image/png" });
    handleArtwork(file);
    setAiOpen(false);
  };

  const submit = async () => {
    if (!sourceReleaseId && !artwork.valid) return toast.error("Artwork is required");
    if (!rightsConfirmed) return toast.error("Confirm rights ownership");
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

      const releasePayload: any = {
        title: release.title, version: release.version, release_type: release.release_type,
        primary_genre: release.primary_genre, secondary_genre: release.secondary_genre, language: release.language,
        release_date: release.release_date || null, original_release_date: release.original_release_date || null,
        copyright_year: release.copyright_year, record_label: release.record_label,
        upc: release.upc, catalog_number: release.catalog_number, parental_advisory: release.parental_advisory,
        store_selection: stores, status: "pending", rejection_reason: null,
      };
      if (artwork_path) releasePayload.artwork_path = artwork_path;

      let releaseId: string;
      if (sourceReleaseId) {
        const { error: upErr } = await supabase.from("releases").update(releasePayload).eq("id", sourceReleaseId);
        if (upErr) throw upErr;
        releaseId = sourceReleaseId;
        // Replace tracks: delete then re-insert
        await supabase.from("release_tracks").delete().eq("release_id", releaseId);
      } else {
        const { data: rel, error: relErr } = await supabase.from("releases").insert({
          ...releasePayload, owner_id: u.user.id,
        }).select().single();
        if (relErr) throw relErr;
        releaseId = rel.id;
      }

      for (let i = 0; i < tracks.length; i++) {
        const t = tracks[i];
        let audio_path: string | null = null;
        const af = audioFiles[i];
        if (af) {
          const p = `${u.user.id}/${releaseId}/${i}-${af.name}`;
          const { error } = await supabase.storage.from("audio").upload(p, af, { upsert: true });
          if (!error) audio_path = p;
        }
        await supabase.from("release_tracks").insert({
          release_id: releaseId, track_number: i + 1,
          title: t.title, version: t.version, language: t.language, isrc: t.isrc || null,
          explicit: t.explicit, composer: t.composer || null, lyricist: t.lyricist || null,
          producer: t.producer || null, featured_artist: t.featured_artist || null,
          copyright_owner: t.copyright_owner || null, publishing_info: t.publishing_info || null,
          audio_path, file_size_bytes: af?.size ?? null,
          duration_seconds: audioMeta[i]?.duration ?? null,
        });
      }
      // Seed per-DSP delivery rows + submission event
      const deliveryRows = stores.map(p => ({ release_id: releaseId, platform: p, status: "queued" }));
      if (deliveryRows.length) {
        await supabase.from("dsp_deliveries" as any).upsert(deliveryRows, { onConflict: "release_id,platform" });
      }
      await supabase.from("release_events" as any).insert({
        release_id: releaseId, type: "submitted", actor_id: u.user.id,
        note: sourceReleaseId ? "Resubmitted for review" : "Submitted for review",
        payload: { stores, territory, pricing },
      });
      if (draftId) await supabase.from("release_drafts").delete().eq("id", draftId);
      toast.success(sourceReleaseId ? "Release resubmitted for review" : "Release submitted for review");
      navigate({ to: "/releases/$id", params: { id: releaseId } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  const allValidAudio = audioFiles.length === tracks.length && audioMeta.every(m => m?.valid);
  const metadataComplete = !!(release.title && release.artist_name && release.primary_genre && release.release_date);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">New release</h1>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
        </div>
        <Button variant="outline" onClick={() => saveDraft(true)}><Save className="h-4 w-4 mr-1.5" />Save draft</Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${i === step ? "bg-primary text-primary-foreground border-primary" : i < step ? "bg-primary/10 text-primary border-primary/30" : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"}`}
            title={`Step ${i + 1}: ${s}`}>
            <span className="opacity-60 mr-1">{i + 1}.</span>{s}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <Card className="p-6 bg-card/60 border-border">
          {step === 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Release title *"><Input value={release.title} onChange={e => setRelease({ ...release, title: e.target.value })} /></Field>
              <Field label="Artist name *"><Input value={release.artist_name} onChange={e => setRelease({ ...release, artist_name: e.target.value })} /></Field>
              <Field label="Primary artist *"><Input value={release.primary_artist} onChange={e => setRelease({ ...release, primary_artist: e.target.value })} /></Field>
              <Field label="Release type *">
                <Select value={release.release_type} onValueChange={v => setRelease({ ...release, release_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="ep">EP</SelectItem>
                    <SelectItem value="album">Album</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Label name"><Input value={release.record_label} onChange={e => setRelease({ ...release, record_label: e.target.value })} /></Field>
              <Field label="Genre *"><Input value={release.primary_genre} onChange={e => setRelease({ ...release, primary_genre: e.target.value })} /></Field>
              <Field label="Sub genre"><Input value={release.secondary_genre} onChange={e => setRelease({ ...release, secondary_genre: e.target.value })} /></Field>
              <Field label="Language *"><Input value={release.language} onChange={e => setRelease({ ...release, language: e.target.value })} /></Field>
              <Field label="Release date *"><Input type="date" value={release.release_date} onChange={e => setRelease({ ...release, release_date: e.target.value })} /></Field>
              <Field label="Original release date"><Input type="date" value={release.original_release_date} onChange={e => setRelease({ ...release, original_release_date: e.target.value })} /></Field>
              <Field label="UPC"><Input value={release.upc} onChange={e => setRelease({ ...release, upc: e.target.value })} /></Field>
              <Field label="Catalog number"><Input value={release.catalog_number} onChange={e => setRelease({ ...release, catalog_number: e.target.value })} /></Field>
              <Field label="Copyright info"><Input value={release.copyright_info} onChange={e => setRelease({ ...release, copyright_info: e.target.value })} placeholder="© 2026 …" /></Field>
              <Field label="Producer info"><Input value={release.producer_info} onChange={e => setRelease({ ...release, producer_info: e.target.value })} /></Field>
              <label className="flex items-center gap-2 col-span-full">
                <Checkbox checked={release.parental_advisory} onCheckedChange={v => setRelease({ ...release, parental_advisory: !!v })} />
                Parental advisory
              </label>
              <div className="col-span-full"><Label>Description</Label><Textarea value={release.description} onChange={e => setRelease({ ...release, description: e.target.value })} rows={3} /></div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-muted-foreground">3000×3000 RGB JPG/PNG, max 10 MB.</p>
                <Button variant="outline" size="sm" onClick={() => setAiOpen(o => !o)}>
                  <Sparkles className="h-4 w-4 mr-1.5" />AI Artwork Studio
                </Button>
              </div>

              {aiOpen && (
                <Card className="p-4 bg-primary/5 border-primary/20 space-y-3">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div><Label className="text-xs">Mood</Label><Input value={aiInputs.mood} onChange={e => setAiInputs({ ...aiInputs, mood: e.target.value })} placeholder="dreamy, dark…" /></div>
                    <div><Label className="text-xs">Color theme</Label><Input value={aiInputs.color} onChange={e => setAiInputs({ ...aiInputs, color: e.target.value })} placeholder="warm sunset" /></div>
                    <div>
                      <Label className="text-xs">Style</Label>
                      <Select value={aiInputs.style} onValueChange={v => setAiInputs({ ...aiInputs, style: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="photorealistic">Photorealistic</SelectItem>
                          <SelectItem value="painterly">Painterly</SelectItem>
                          <SelectItem value="abstract">Abstract</SelectItem>
                          <SelectItem value="3d-render">3D render</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={generateAi} disabled={aiBusy}>
                    {aiBusy ? "Generating…" : "Generate concepts"}
                  </Button>
                  {aiImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {aiImages.map((u, i) => (
                        <button key={i} onClick={() => attachAiImage(u)} className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary">
                          <img src={u} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              <Input type="file" accept="image/png,image/jpeg" onChange={e => e.target.files?.[0] && handleArtwork(e.target.files[0])} />
              {artwork.preview && (
                <div className="flex items-center gap-5">
                  <img src={artwork.preview} alt="" className="h-48 w-48 rounded-xl object-cover border border-border" />
                  <div className="text-sm space-y-1">
                    <div>Resolution: <span className="font-medium">{artwork.width}×{artwork.height}</span></div>
                    <div>File size: <span className="font-medium">{artwork.size ? (artwork.size / 1024 / 1024).toFixed(2) + " MB" : "—"}</span></div>
                    <div>Color mode: <span className="font-medium">RGB</span></div>
                    <div className={artwork.valid ? "text-success font-medium" : "text-destructive font-medium"}>
                      {artwork.valid ? "✓ Valid" : "✕ Invalid dimensions"}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => document.querySelector<HTMLInputElement>("input[type=file]")?.click()}>Replace</Button>
                      <Button size="sm" variant="ghost" onClick={() => setArtwork({ file: null, preview: null, valid: false })}>Remove</Button>
                    </div>
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
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => {
                        const ct = [...tracks]; ct.splice(i + 1, 0, { ...t });
                        const ca = [...audioFiles]; ca.splice(i + 1, 0, null);
                        const cm = [...audioMeta]; cm.splice(i + 1, 0, null);
                        setTracks(ct); setAudioFiles(ca); setAudioMeta(cm);
                      }}>Duplicate</Button>
                      {tracks.length > 1 && (
                        <Button size="sm" variant="ghost" onClick={() => {
                          setTracks(tracks.filter((_, j) => j !== i));
                          setAudioFiles(audioFiles.filter((_, j) => j !== i));
                          setAudioMeta(audioMeta.filter((_, j) => j !== i));
                        }}>Remove</Button>
                      )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <Field label="Title *"><Input value={t.title} onChange={e => upd(tracks, setTracks, i, { title: e.target.value })} /></Field>
                    <Field label="Version"><Input value={t.version} onChange={e => upd(tracks, setTracks, i, { version: e.target.value })} /></Field>
                    <Field label="Language"><Input value={t.language} onChange={e => upd(tracks, setTracks, i, { language: e.target.value })} /></Field>
                    <Field label="ISRC"><Input value={t.isrc} onChange={e => upd(tracks, setTracks, i, { isrc: e.target.value })} /></Field>
                    <Field label="Composer"><Input value={t.composer} onChange={e => upd(tracks, setTracks, i, { composer: e.target.value })} /></Field>
                    <Field label="Lyricist"><Input value={t.lyricist} onChange={e => upd(tracks, setTracks, i, { lyricist: e.target.value })} /></Field>
                    <Field label="Producer"><Input value={t.producer} onChange={e => upd(tracks, setTracks, i, { producer: e.target.value })} /></Field>
                    <Field label="Featured artist"><Input value={t.featured_artist} onChange={e => upd(tracks, setTracks, i, { featured_artist: e.target.value })} /></Field>
                    <Field label="Copyright owner"><Input value={t.copyright_owner} onChange={e => upd(tracks, setTracks, i, { copyright_owner: e.target.value })} /></Field>
                    <Field label="Publisher"><Input value={t.publishing_info} onChange={e => upd(tracks, setTracks, i, { publishing_info: e.target.value })} /></Field>
                    <label className="flex items-center gap-2 col-span-full">
                      <Checkbox checked={t.explicit} onCheckedChange={v => upd(tracks, setTracks, i, { explicit: !!v })} />
                      Explicit content
                    </label>
                  </div>
                </Card>
              ))}
              <Button variant="outline" onClick={() => {
                setTracks([...tracks, blankTrack()]);
                setAudioFiles([...audioFiles, null]);
                setAudioMeta([...audioMeta, null]);
              }}>+ Add track</Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">MP3 320 kbps, 44.1 kHz, stereo recommended.</p>
              {tracks.map((t, i) => {
                const f = audioFiles[i];
                const m = audioMeta[i];
                return (
                  <Card key={i} className="p-4 bg-muted/10 space-y-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="font-medium text-sm">{t.title || `Track ${i + 1}`}</div>
                      <Input type="file" accept="audio/mpeg,audio/wav" className="w-auto" onChange={e => e.target.files?.[0] && handleAudio(i, e.target.files[0])} />
                    </div>
                    {f && (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                        <Info k="Filename" v={f.name} />
                        <Info k="Size" v={`${(f.size / 1024 / 1024).toFixed(2)} MB`} />
                        <Info k="Duration" v={m?.duration ? formatDur(m.duration) : "—"} />
                        <Info k="Status" v={m?.valid ? "✓ Passed" : `✕ ${m?.reason || "—"}`} valid={m?.valid} />
                      </div>
                    )}
                    {f && <audio controls src={URL.createObjectURL(f)} className="w-full" />}
                  </Card>
                );
              })}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                  <Input value={storeQuery} onChange={e => setStoreQuery(e.target.value)} placeholder="Search stores…" className="w-64" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setStores([...STORES])}>Select all</Button>
                    <Button size="sm" variant="ghost" onClick={() => setStores([])}>Deselect all</Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {STORES.filter(s => s.toLowerCase().includes(storeQuery.toLowerCase())).map(s => {
                    const on = stores.includes(s);
                    return (
                      <button key={s} onClick={() => setStores(on ? stores.filter(x => x !== s) : [...stores, s])}
                        className={`p-3 rounded-xl border text-sm transition flex items-center gap-2 ${on ? "border-primary bg-primary/10" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                        {on && <Check className="h-4 w-4 text-primary" />}{s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label className="text-sm">Territory</Label>
                <Select value={territory} onValueChange={v => setTerritory(v as any)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="worldwide">Worldwide</SelectItem>
                    <SelectItem value="custom">Custom countries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Pricing tier</Label>
                <Select value={pricing} onValueChange={setPricing}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox checked={rightsConfirmed} onCheckedChange={v => setRightsConfirmed(!!v)} className="mt-0.5" />
                <span>I confirm I own or control all rights to the music, artwork, and metadata in this release.</span>
              </label>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Row k="Title" v={release.title} />
                <Row k="Artist" v={release.artist_name} />
                <Row k="Type" v={release.release_type} />
                <Row k="Genre" v={release.primary_genre} />
                <Row k="Release date" v={release.release_date} />
                <Row k="Tracks" v={String(tracks.length)} />
                <Row k="Audio uploaded" v={`${audioFiles.filter(Boolean).length}/${tracks.length}`} />
                <Row k="Stores" v={`${stores.length} selected`} />
              </div>
              <div className="rounded-xl border border-border p-4 space-y-2 text-sm">
                <CheckRow ok={metadataComplete} label="Metadata complete" />
                <CheckRow ok={artwork.valid} label="Artwork valid (3000×3000)" />
                <CheckRow ok={allValidAudio} label="Audio valid" />
                <CheckRow ok={rightsConfirmed} label="Rights confirmed" />
              </div>
            </div>
          )}
        </Card>

        <aside className="lg:sticky lg:top-20 h-fit space-y-4">
          <Card className="p-4 bg-card/60 border-border">
            <div className="text-xs text-muted-foreground mb-2">Live preview</div>
            <div className="aspect-square rounded-xl bg-muted overflow-hidden grid place-items-center">
              {artwork.preview ? (
                <img src={artwork.preview} className="h-full w-full object-cover" alt="" />
              ) : (
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="mt-3 space-y-1">
              <div className="font-display font-semibold truncate">{release.title || "Untitled release"}</div>
              <div className="text-xs text-muted-foreground truncate">{release.artist_name || "Unknown artist"}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                <Disc3 className="h-3 w-3" />{release.release_type} · <MusicIcon className="h-3 w-3" />{tracks.length} track{tracks.length !== 1 ? "s" : ""}
              </div>
              <div className="text-xs text-muted-foreground">{stores.length} stores selected</div>
              <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted">Draft</span>
            </div>
          </Card>
        </aside>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" />Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
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
function Info({ k, v, valid }: { k: string; v: string; valid?: boolean }) {
  return <div className={`rounded-md bg-muted/30 px-2 py-1.5 ${valid === false ? "text-destructive" : valid ? "text-success" : ""}`}>
    <div className="text-[10px] uppercase text-muted-foreground">{k}</div><div className="truncate">{v}</div>
  </div>;
}
function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return <div className="flex items-center gap-2">
    <span className={`h-4 w-4 grid place-items-center rounded-full text-[10px] ${ok ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>{ok ? "✓" : "○"}</span>
    <span className={ok ? "" : "text-muted-foreground"}>{label}</span>
  </div>;
}
function upd<T>(arr: T[], set: (v: T[]) => void, i: number, patch: Partial<T>) {
  const c = [...arr]; c[i] = { ...c[i], ...patch }; set(c);
}
function formatDur(s: number) {
  const m = Math.floor(s / 60); const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}
