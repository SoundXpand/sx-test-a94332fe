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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES, GENRES, P_YEARS } from "@/lib/release-options";
import { DSPS_FULL } from "@/lib/dsp-list";
import { TerritoryPicker } from "@/components/territory-picker";
import { ALL_COUNTRY_CODES } from "@/lib/territories";

export const Route = createFileRoute("/_authenticated/releases/new")({
  component: NewRelease,
  head: () => ({ meta: [{ title: "New release — SoundXpand" }] }),
});

const STORES = DSPS_FULL.map(d => d.name);
const STORE_LOGO: Record<string, string | undefined> = Object.fromEntries(DSPS_FULL.map(d => [d.name, d.logo]));
const STEPS = ["Release details", "Artwork", "Tracks", "Audio", "Distribution", "Review"];

type Track = {
  title: string; version: string; language: string; explicit: boolean; isrc: string;
  composer: string; lyricist: string; producer: string; featured_artist: string;
  copyright_owner: string; publishing_info: string;
  artist_ids: string[]; primary_genre: string;
};

const blankTrack = (): Track => ({
  title: "", version: "", language: "English", explicit: false, isrc: "",
  composer: "", lyricist: "", producer: "", featured_artist: "",
  copyright_owner: "", publishing_info: "",
  artist_ids: [], primary_genre: "",
});

const genCatalog = () => `SXM${String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")}`;

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
    record_label: "", sub_label: "", upc: "", catalog_number: "", parental_advisory: false,
    p_year: new Date().getFullYear(), p_name: "", c_year: new Date().getFullYear(), c_name: "",
  });
  const [singleMode, setSingleMode] = useState(true);
  const [profileMeta, setProfileMeta] = useState<{ label_name: string; sub_labels: string[]; role_type: string | null }>({
    label_name: "", sub_labels: [], role_type: null,
  });
  const [artwork, setArtwork] = useState<{ file: File | null; preview: string | null; width?: number; height?: number; size?: number; valid: boolean }>({
    file: null, preview: null, valid: false,
  });
  const [tracks, setTracks] = useState<Track[]>([blankTrack()]);
  const [audioFiles, setAudioFiles] = useState<(File | null)[]>([null]);
  const [audioMeta, setAudioMeta] = useState<Array<{ duration?: number; valid: boolean; reason?: string } | null>>([null]);
  const [stores, setStores] = useState<string[]>([...STORES]);
  const [storeQuery, setStoreQuery] = useState("");
  const [territoryWorldwide, setTerritoryWorldwide] = useState(true);
  const [territoryCountries, setTerritoryCountries] = useState<string[]>(ALL_COUNTRY_CODES);
  const [pricing, setPricing] = useState("mid");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [releaseArtistIds, setReleaseArtistIds] = useState<string[]>([]);
  const { artists: myArtists } = useMyArtists();

  // Load profile defaults (label, sub-labels, role) + auto-gen catalog
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: p } = await supabase.from("profiles").select("label_name,sub_labels,role_type").eq("user_id", u.user.id).maybeSingle();
      if (p) {
        setProfileMeta({
          label_name: (p as any).label_name ?? "",
          sub_labels: ((p as any).sub_labels as string[]) ?? [],
          role_type: (p as any).role_type ?? null,
        });
        setRelease(r => ({ ...r, record_label: r.record_label || ((p as any).label_name ?? ""), p_name: r.p_name || ((p as any).label_name ?? ""), c_name: r.c_name || ((p as any).label_name ?? "") }));
      }
      // Generate unique catalog number
      for (let i = 0; i < 6; i++) {
        const cand = genCatalog();
        const { data: hit } = await supabase.from("releases").select("id").eq("catalog_number", cand).maybeSingle();
        if (!hit) { setRelease(r => r.catalog_number ? r : { ...r, catalog_number: cand }); break; }
      }
    })();
  }, []);

  // Keep single-track mode in sync with release_type
  useEffect(() => {
    if (release.release_type === "single") {
      setSingleMode(true);
      if (tracks.length > 1) {
        setTracks(tracks.slice(0, 1));
        setAudioFiles(audioFiles.slice(0, 1));
        setAudioMeta(audioMeta.slice(0, 1));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [release.release_type]);


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
        if (p.territory) { setTerritoryWorldwide(p.territory === "worldwide" || p.territory?.worldwide); setTerritoryCountries(p.territory?.countries ?? ALL_COUNTRY_CODES); }
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
        record_label: rel.record_label || "", sub_label: (rel as any).sub_label || "",
        upc: rel.upc || "", catalog_number: rel.catalog_number || "",
        parental_advisory: !!rel.parental_advisory,
        p_year: (rel as any).p_year || new Date().getFullYear(), p_name: (rel as any).p_name || "",
        c_year: (rel as any).c_year || new Date().getFullYear(), c_name: (rel as any).c_name || "",
      };
      const trackState: Track[] = (trk ?? []).map(t => ({
        title: t.title, version: t.version || "", language: t.language || "English",
        explicit: !!t.explicit, isrc: t.isrc || "",
        composer: t.composer || "", lyricist: t.lyricist || "",
        producer: t.producer || "", featured_artist: t.featured_artist || "",
        copyright_owner: t.copyright_owner || "", publishing_info: t.publishing_info || "",
        artist_ids: [], primary_genre: (t as any).primary_genre || "",
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
    const territory = { worldwide: territoryWorldwide, countries: territoryCountries };
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
    if (!release.title) return toast.error("Release title is required");
    if (!releaseArtistIds.length) return toast.error("Select at least one artist");
    if (!release.record_label) return toast.error("Label name is required");
    if (!release.primary_genre) return toast.error("Primary genre is required");
    if (!release.language) return toast.error("Language is required");
    if (!release.catalog_number) return toast.error("Catalog number is required");
    if (!release.p_name || !release.c_name) return toast.error("P Name and C Name are required");
    if (release.upc && !release.original_release_date) return toast.error("Original release date is required when UPC is set");
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");

      // Ensure catalog uniqueness (skip self when editing)
      let catalog = release.catalog_number;
      for (let attempt = 0; attempt < 8; attempt++) {
        const q = supabase.from("releases").select("id").eq("catalog_number", catalog);
        const { data: hit } = await q.maybeSingle();
        if (!hit || (sourceReleaseId && hit.id === sourceReleaseId)) break;
        catalog = genCatalog();
      }
      if (catalog !== release.catalog_number) {
        toast.info(`Catalog number reassigned to ${catalog} (was taken)`);
        setRelease(r => ({ ...r, catalog_number: catalog }));
      }

      let artwork_path: string | null = null;
      if (artwork.file) {
        try {
          const { uploadToR2 } = await import("@/lib/storage-url");
          artwork_path = await uploadToR2({ kind: "artwork", file: artwork.file });
        } catch (e: any) { toast.error(`Artwork upload failed: ${e.message}`); throw e; }
      }

      const primaryName = myArtists.find(a => releaseArtistIds.includes(a.id))?.name ?? "";
      const releasePayload: any = {
        title: release.title, version: release.version, release_type: release.release_type,
        primary_genre: release.primary_genre, secondary_genre: release.secondary_genre, language: release.language,
        release_date: release.release_date || null, original_release_date: release.original_release_date || null,
        copyright_year: release.p_year, record_label: release.record_label, sub_label: release.sub_label || null,
        upc: release.upc, catalog_number: catalog, parental_advisory: release.parental_advisory,
        store_selection: stores, status: "pending", rejection_reason: null,
        artist_ids: releaseArtistIds,
        p_year: release.p_year, p_name: release.p_name, c_year: release.c_year, c_name: release.c_name,
      };
      if (primaryName && !release.artist_name) release.artist_name = primaryName;
      if (artwork_path) releasePayload.artwork_path = artwork_path;

      let releaseId: string;
      if (sourceReleaseId) {
        const { error: upErr } = await supabase.from("releases").update(releasePayload).eq("id", sourceReleaseId);
        if (upErr) throw upErr;
        releaseId = sourceReleaseId;
        await supabase.from("release_tracks").delete().eq("release_id", releaseId);
      } else {
        const { data: rel, error: relErr } = await supabase.from("releases").insert({
          ...releasePayload, owner_id: u.user.id,
        }).select().single();
        if (relErr) throw relErr;
        releaseId = rel.id;
      }

      const isSingle = singleMode || release.release_type === "single";

      // Auto-generate ISRCs when UPC/barcode missing: INV2I{YY}{NNNNN}
      let nextIsrcSerial = 0;
      const yy = String(new Date().getFullYear()).slice(-2);
      if (!release.upc) {
        const prefix = `INV2I${yy}`;
        const { data: existing } = await supabase
          .from("release_tracks")
          .select("isrc")
          .like("isrc", `${prefix}%`)
          .order("isrc", { ascending: false })
          .limit(1);
        const top = existing?.[0]?.isrc ?? "";
        const tail = parseInt(top.slice(prefix.length), 10);
        nextIsrcSerial = Math.max(22, isNaN(tail) ? 0 : tail);
      }
      const mintIsrc = () => {
        if (release.upc) return null;
        nextIsrcSerial += 1;
        return `INV2I${yy}${String(nextIsrcSerial).padStart(5, "0")}`;
      };

      for (let i = 0; i < tracks.length; i++) {
        const t = tracks[i];
        const eff = isSingle && i === 0 ? {
          title: t.title || release.title,
          version: t.version || release.version,
          language: t.language || release.language,
          primary_genre: t.primary_genre || release.primary_genre,
          artist_ids: t.artist_ids.length ? t.artist_ids : releaseArtistIds,
        } : { title: t.title, version: t.version, language: t.language, primary_genre: t.primary_genre, artist_ids: t.artist_ids };
        let audio_path: string | null = null;
        const af = audioFiles[i];
        if (af) {
          try {
            const { uploadToR2 } = await import("@/lib/storage-url");
            audio_path = await uploadToR2({ kind: "audio", file: af, subdir: releaseId });
          } catch (e: any) { toast.error(`Audio upload failed: ${e.message}`); throw e; }
        }
        const tArtistNames = myArtists.filter(a => eff.artist_ids.includes(a.id)).map(a => a.name).join(", ");
        await supabase.from("release_tracks").insert({
          release_id: releaseId, track_number: i + 1,
          title: eff.title, version: eff.version, language: eff.language, isrc: t.isrc || mintIsrc(),
          explicit: t.explicit, composer: t.composer || null, lyricist: t.lyricist || null,
          producer: t.producer || null, featured_artist: tArtistNames || t.featured_artist || null,
          copyright_owner: null, publishing_info: t.publishing_info || "SoundXpand",
          primary_genre: eff.primary_genre || null,
          audio_path, file_size_bytes: af?.size ?? null,
          duration_seconds: audioMeta[i]?.duration ?? null,
        } as any);
      }

      // Seed per-DSP delivery rows + submission event
      const deliveryRows = stores.map(p => ({ release_id: releaseId, platform: p, status: "queued" }));
      if (deliveryRows.length) {
        await supabase.from("dsp_deliveries" as any).upsert(deliveryRows, { onConflict: "release_id,platform" });
      }
      await supabase.from("release_events" as any).insert({
        release_id: releaseId, type: "submitted", actor_id: u.user.id,
        note: sourceReleaseId ? "Resubmitted for review" : "Submitted for review",
        payload: { stores, territory: { worldwide: territoryWorldwide, countries: territoryCountries }, pricing },
      });
      if (draftId) await supabase.from("release_drafts").delete().eq("id", draftId);
      toast.success(sourceReleaseId ? "Release resubmitted for review" : "Release submitted for review");
      navigate({ to: "/releases/$id", params: { id: releaseId } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  const allValidAudio = audioFiles.length === tracks.length && audioMeta.every(m => m?.valid);
  const metadataComplete = !!(release.title && releaseArtistIds.length > 0 && release.primary_genre && release.release_date);

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
            <div className="space-y-4">
              {profileMeta.role_type && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">You are:</span>
                  <Badge variant="secondary">{profileMeta.role_type}</Badge>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Release title *"><Input value={release.title} onChange={e => setRelease({ ...release, title: e.target.value })} placeholder="e.g. Midnight Echoes" /></Field>
                <Field label="Version"><Input value={release.version} onChange={e => setRelease({ ...release, version: e.target.value })} placeholder="e.g. Remix, Acoustic" /></Field>

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
                <Field label="Catalog number * (auto-generated)">
                  <Input value={release.catalog_number} onChange={e => setRelease({ ...release, catalog_number: e.target.value })} placeholder="SXM0001" />
                </Field>

                <Field label="Select artists *">
                  <ArtistMultiSelect value={releaseArtistIds} onChange={setReleaseArtistIds} />
                </Field>
                <Field label="Label name *">
                  <Input value={release.record_label} onChange={e => setRelease({ ...release, record_label: e.target.value })} placeholder={profileMeta.label_name || "Your label"} />
                </Field>

                <Field label="Sub label">
                  <Select value={release.sub_label || "__none"} onValueChange={v => setRelease({ ...release, sub_label: v === "__none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">None</SelectItem>
                      {profileMeta.sub_labels.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Primary genre *">
                  <Select value={release.primary_genre} onValueChange={v => setRelease({ ...release, primary_genre: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>

                <Field label="Sub genre">
                  <Select value={release.secondary_genre || "__none"} onValueChange={v => setRelease({ ...release, secondary_genre: v === "__none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">None</SelectItem>
                      {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Language *">
                  <Select value={release.language} onValueChange={v => setRelease({ ...release, language: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>

                <Field label={`Original release date${release.upc ? " *" : ""}`}>
                  <Input type="date" value={release.original_release_date} onChange={e => setRelease({ ...release, original_release_date: e.target.value })} />
                </Field>
                <Field label="UPC / Barcode">
                  <Input value={release.upc} onChange={e => setRelease({ ...release, upc: e.target.value })} placeholder="8888888888" />
                </Field>

                <Field label="P Year *">
                  <Select value={String(release.p_year)} onValueChange={v => setRelease({ ...release, p_year: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{P_YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="P Name *">
                  <Input value={release.p_name} onChange={e => setRelease({ ...release, p_name: e.target.value })} placeholder="℗ Copyright holder of the sound recording" />
                </Field>

                <Field label="C Year *">
                  <Select value={String(release.c_year)} onValueChange={v => setRelease({ ...release, c_year: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{P_YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="C Name *">
                  <Input value={release.c_name} onChange={e => setRelease({ ...release, c_name: e.target.value })} placeholder="© Copyright holder of the work" />
                </Field>

                <label className="flex items-center gap-2 col-span-full">
                  <Checkbox checked={release.parental_advisory} onCheckedChange={v => setRelease({ ...release, parental_advisory: !!v })} />
                  Parental advisory
                </label>
              </div>
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

          {step === 2 && (() => {
            // Auto-prefill track 1 from release-level fields when single
            const isSingle = singleMode || release.release_type === "single";
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap rounded-lg border border-border bg-muted/20 p-3">
                  <div>
                    <div className="text-sm font-medium">Single track release?</div>
                    <div className="text-xs text-muted-foreground">When on, the release has exactly one track and inherits release-level details.</div>
                  </div>
                  <Switch
                    checked={isSingle}
                    onCheckedChange={(v) => {
                      setSingleMode(v);
                      if (v) {
                        setRelease({ ...release, release_type: "single" });
                        if (tracks.length > 1) {
                          setTracks(tracks.slice(0, 1));
                          setAudioFiles(audioFiles.slice(0, 1));
                          setAudioMeta(audioMeta.slice(0, 1));
                        }
                      } else {
                        const n = tracks.length;
                        const t = n >= 7 ? "album" : n >= 2 ? "ep" : "ep";
                        setRelease({ ...release, release_type: t });
                      }
                    }}
                  />
                </div>

                {tracks.map((t, i) => {
                  const v = isSingle && i === 0 ? {
                    title: t.title || release.title,
                    version: t.version || release.version,
                    language: t.language || release.language,
                    primary_genre: t.primary_genre || release.primary_genre,
                    artist_ids: t.artist_ids.length ? t.artist_ids : releaseArtistIds,
                  } : t;
                  return (
                    <Card key={i} className="p-4 bg-muted/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Track {i + 1}</span>
                        <div className="flex gap-1">
                          {!isSingle && (
                            <Button size="sm" variant="ghost" onClick={() => {
                              const ct = [...tracks]; ct.splice(i + 1, 0, { ...t });
                              const ca = [...audioFiles]; ca.splice(i + 1, 0, null);
                              const cm = [...audioMeta]; cm.splice(i + 1, 0, null);
                              setTracks(ct); setAudioFiles(ca); setAudioMeta(cm);
                              setRelease(r => ({ ...r, release_type: ct.length >= 7 ? "album" : "ep" }));
                            }}>Duplicate</Button>
                          )}
                          {!isSingle && tracks.length > 1 && (
                            <Button size="sm" variant="ghost" onClick={() => {
                              const ct = tracks.filter((_, j) => j !== i);
                              setTracks(ct);
                              setAudioFiles(audioFiles.filter((_, j) => j !== i));
                              setAudioMeta(audioMeta.filter((_, j) => j !== i));
                              setRelease(r => ({ ...r, release_type: ct.length === 1 ? "single" : ct.length >= 7 ? "album" : "ep" }));
                              if (ct.length === 1) setSingleMode(true);
                            }}>Remove</Button>
                          )}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Field label="Title *"><Input value={v.title} onChange={e => upd(tracks, setTracks, i, { title: e.target.value })} placeholder="Track title" /></Field>
                        <Field label="Version"><Input value={v.version} onChange={e => upd(tracks, setTracks, i, { version: e.target.value })} placeholder="e.g. Remix, Acoustic" /></Field>
                        <Field label="Primary genre">
                          <Select value={v.primary_genre} onValueChange={val => upd(tracks, setTracks, i, { primary_genre: val })}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>{GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                        <Field label="Language">
                          <Select value={v.language} onValueChange={val => upd(tracks, setTracks, i, { language: val })}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>{LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                        <Field label="ISRC"><Input value={t.isrc} onChange={e => upd(tracks, setTracks, i, { isrc: e.target.value })} placeholder="Auto-generated if blank" /></Field>
                        <Field label="Artists"><ArtistMultiSelect value={v.artist_ids} onChange={(ids) => upd(tracks, setTracks, i, { artist_ids: ids })} /></Field>
                        <Field label="Composer *"><Input required value={t.composer} onChange={e => upd(tracks, setTracks, i, { composer: e.target.value })} placeholder="Comma separated" /></Field>
                        {!["No human vocals","No linguistic content"].includes(v.language) && (
                          <Field label="Lyricist *"><Input required value={t.lyricist} onChange={e => upd(tracks, setTracks, i, { lyricist: e.target.value })} placeholder="Comma separated" /></Field>
                        )}
                        <Field label="Producer *"><Input required value={t.producer} onChange={e => upd(tracks, setTracks, i, { producer: e.target.value })} placeholder="Comma separated" /></Field>
                        <Field label="Publisher">
                          <Select value={t.publishing_info || "SoundXpand"} onValueChange={val => upd(tracks, setTracks, i, { publishing_info: val })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SoundXpand">SoundXpand</SelectItem>
                              <SelectItem value="SoundXpand PRO">SoundXpand PRO</SelectItem>
                              <SelectItem value="SoundXpand Publishing">SoundXpand Publishing</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <label className="flex items-center gap-2 col-span-full">
                          <Checkbox checked={t.explicit} onCheckedChange={v => upd(tracks, setTracks, i, { explicit: !!v })} />
                          Explicit content
                        </label>
                      </div>
                    </Card>
                  );
                })}
                {!isSingle && (
                  <Button variant="outline" onClick={() => {
                    const ct = [...tracks, blankTrack()];
                    setTracks(ct);
                    setAudioFiles([...audioFiles, null]);
                    setAudioMeta([...audioMeta, null]);
                    setRelease(r => ({ ...r, release_type: ct.length >= 7 ? "album" : "ep" }));
                  }}>+ Add track</Button>
                )}
              </div>
            );
          })()}


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
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Release date *">
                  <Input type="date" value={release.release_date} onChange={e => setRelease({ ...release, release_date: e.target.value })} />
                </Field>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                  <Input value={storeQuery} onChange={e => setStoreQuery(e.target.value)} placeholder="Search stores…" className="w-64" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setStores([...STORES])}>Select all</Button>
                    <Button size="sm" variant="ghost" onClick={() => setStores([])}>Deselect all</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {STORES.filter(s => s.toLowerCase().includes(storeQuery.toLowerCase())).map(s => {
                    const on = stores.includes(s);
                    const logo = STORE_LOGO[s];
                    return (
                      <button key={s} onClick={() => setStores(on ? stores.filter(x => x !== s) : [...stores, s])}
                        className={`p-2.5 rounded-xl border text-sm text-left transition flex items-center gap-2.5 ${on ? "border-primary bg-primary/10" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                        <span className="h-8 w-8 shrink-0 rounded-md bg-background border border-border grid place-items-center overflow-hidden">
                          {logo ? (
                            <img src={logo} alt="" className="h-5 w-5 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                          ) : (
                            <span className="text-[10px] font-semibold">{s.slice(0, 2).toUpperCase()}</span>
                          )}
                        </span>
                        <span className="flex-1 line-clamp-2 text-foreground">{s}</span>
                        {on && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label className="text-sm">Territory</Label>
                <div className="mt-1.5">
                  <TerritoryPicker
                    worldwide={territoryWorldwide}
                    countries={territoryCountries}
                    onChange={({ worldwide, countries }) => { setTerritoryWorldwide(worldwide); setTerritoryCountries(countries); }}
                  />
                </div>
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
                <Row k="Artists" v={myArtists.filter(a => releaseArtistIds.includes(a.id)).map(a => a.name).join(", ")} />
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
              <div className="text-xs text-muted-foreground truncate">{myArtists.filter(a => releaseArtistIds.includes(a.id)).map(a => a.name).join(", ") || "Unknown artist"}</div>
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
