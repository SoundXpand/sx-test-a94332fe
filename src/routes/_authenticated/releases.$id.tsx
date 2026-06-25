import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ArrowLeft, ExternalLink, Copy, RefreshCw, Disc3, Check, X, Clock, Send, Save, Trash2, Package, Download, ChevronDown, Globe } from "lucide-react";
import { toast } from "sonner";
import { ReleaseStatusBadge } from "@/components/catalog/status-badge";
import { EDITABLE_RELEASE_STATUSES, getStatusMeta } from "@/lib/release-status";
import { useCurrentUser, isStaff } from "@/hooks/use-current-user";
import { useServerFn } from "@tanstack/react-start";
import { archiveReleaseFn, updateReleaseAdminFn, updateDspDeliveryFn } from "@/lib/admin-actions.functions";
import { ArtworkImage } from "@/components/catalog/artwork-image";
import { AudioPlayButton } from "@/components/catalog/audio-play-button";
import { downloadReleaseBundle } from "@/lib/release-bundle";
import { downloadReleaseMetadataXlsx } from "@/lib/metadata-export";
import { DSPS_FULL } from "@/lib/dsp-list";

export const Route = createFileRoute("/_authenticated/releases/$id")({
  component: ReleaseDetail,
  head: () => ({ meta: [{ title: "Release detail — SoundXpand" }] }),
});

const STATUS_OPTIONS = EDITABLE_RELEASE_STATUSES;



function ReleaseDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: me } = useCurrentUser();
  const staff = isStaff(me?.primaryRole);
  const [release, setRelease] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const updateFn = useServerFn(updateReleaseAdminFn);
  const archiveFn = useServerFn(archiveReleaseFn);

  const load = useCallback(async () => {
    const [r, t, d, e] = await Promise.all([
      supabase.from("releases").select("*").eq("id", id).maybeSingle(),
      supabase.from("release_tracks").select("*").eq("release_id", id).order("track_number"),
      supabase.from("dsp_deliveries" as any).select("*").eq("release_id", id).order("platform"),
      supabase.from("release_events" as any).select("*").eq("release_id", id).order("created_at", { ascending: false }),
    ]);
    setRelease(r.data);
    setTracks(t.data ?? []);
    setDeliveries((d.data as any[]) ?? []);
    setEvents((e.data as any[]) ?? []);
    if (r.data?.owner_id) {
      const { data: prof } = await supabase.from("profiles").select("country,full_name,artist_name").eq("user_id", r.data.owner_id).maybeSingle();
      setOwnerProfile(prof);
    }
    if (r.data?.artwork_path) {
      const { data: s } = await supabase.storage.from("artwork").createSignedUrl(r.data.artwork_path, 3600);
      setArtworkUrl(s?.signedUrl ?? null);
    } else setArtworkUrl(null);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const smartlink = release?.slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/l/${release.slug}` : null;

  const copy = async () => {
    if (!smartlink) return;
    await navigator.clipboard.writeText(smartlink);
    toast.success("Smartlink copied");
  };

  const simulate = async (platform: string, status: string) => {
    const url = `/api/public/dsp-webhook/${encodeURIComponent(platform.toLowerCase().replace(/\s+/g, "-"))}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-simulate": "1" },
      body: JSON.stringify({ release_id: id, platform, status, external_url: status === "live" ? `https://example.com/${platform.toLowerCase()}/${id}` : undefined }),
    });
    if (res.ok) { toast.success(`${platform} → ${status}`); load(); }
    else toast.error(`Webhook failed (${res.status})`);
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!release) return <div className="p-8">Not found. <Link to="/catalog" className="text-primary">Back to catalog</Link></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/catalog" })}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="font-display text-2xl font-semibold truncate">{release.title}</h1>
        <ReleaseStatusBadge status={release.status} />
        {release.archived_at && <Badge variant="destructive">Archived</Badge>}
      </div>

      <Card className="p-6 bg-card/60 border-border">
        <div className="flex gap-6 flex-wrap">
          <ArtworkImage src={artworkUrl} alt={release.title} className="h-40 w-40 rounded-xl shrink-0" />
          <div className="flex-1 min-w-[240px] space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="outline" className="capitalize"><Disc3 className="h-3 w-3 mr-1" />{release.release_type}</Badge>
              {release.primary_genre && <Badge variant="outline">{release.primary_genre}</Badge>}
              {release.upc && <span className="text-muted-foreground text-xs">UPC {release.upc}</span>}
              {release.catalog_number && <span className="text-muted-foreground text-xs">CAT {release.catalog_number}</span>}
              {release.release_date && <span className="text-muted-foreground text-xs">Release {release.release_date}</span>}
            </div>
            <div className="text-sm text-muted-foreground">{release.record_label || "Independent"}</div>
            <div className="flex flex-wrap gap-2 pt-2">
              {smartlink && (
                <>
                  <Button size="sm" variant="outline" onClick={copy}><Copy className="h-3.5 w-3.5 mr-1" />Copy smartlink</Button>
                  <Button size="sm" variant="outline" asChild><a href={smartlink} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" />Open</a></Button>
                </>
              )}
              {staff && (
                <>
                  <Button size="sm" variant="outline" onClick={() => downloadReleaseMetadataXlsx(release, tracks, { ownerCountry: ownerProfile?.country, ownerName: ownerProfile?.artist_name || ownerProfile?.full_name })}>
                    <Download className="h-3.5 w-3.5 mr-1" />Metadata
                  </Button>
                  <Button size="sm" variant="outline" onClick={async () => {
                    try { await downloadReleaseBundle(release); toast.success("Bundle ready"); }
                    catch (e: any) { toast.error(e.message ?? "Bundle failed"); }
                  }}>
                    <Package className="h-3.5 w-3.5 mr-1" />Bundle ZIP
                  </Button>
                  {release.archived_at ? (
                    <Button size="sm" variant="outline" onClick={async () => {
                      await archiveFn({ data: { releaseId: id, restore: true } }); toast.success("Restored"); load();
                    }}>Restore</Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={async () => {
                      if (!confirm("Archive this release? It will permanently delete after 7 days (along with audio, artwork, tracks).")) return;
                      await archiveFn({ data: { releaseId: id } }); toast.success("Archived"); load();
                    }}><Trash2 className="h-3.5 w-3.5 mr-1" />Archive</Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tracks">Tracklist ({tracks.length})</TabsTrigger>
          <TabsTrigger value="delivery">Delivery ({deliveries.length})</TabsTrigger>
          {staff && <TabsTrigger value="prefs">Delivery prefs</TabsTrigger>}
          <TabsTrigger value="timeline">Activity log ({events.length})</TabsTrigger>
          {staff && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6 bg-card/60 border-border">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <Row k="Title" v={release.title} />
              <Row k="Version" v={release.version} />
              <Row k="Type" v={release.release_type} />
              <Row k="Primary genre" v={release.primary_genre} />
              <Row k="Secondary genre" v={release.secondary_genre} />
              <Row k="Language" v={release.language} />
              <Row k="Release date" v={release.release_date} />
              <Row k="Original release date" v={release.original_release_date} />
              <Row k="Label" v={release.record_label} />
              <Row k="UPC" v={release.upc} />
              <Row k="Catalog #" v={release.catalog_number} />
              <Row k="Copyright year" v={release.copyright_year} />
              <Row k="Parental advisory" v={release.parental_advisory ? "Yes" : "No"} />
              <Row k="Slug" v={release.slug} />
            </div>
            {release.rejection_reason && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <strong>Rejection reason:</strong> {release.rejection_reason}
              </div>
            )}
            {release.admin_remarks && (
              <div className="mt-4 p-3 rounded-lg bg-muted/40 text-sm">
                <strong>Admin remarks:</strong> {release.admin_remarks}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="tracks">
          <Card className="p-2 bg-card/60 border-border space-y-1">
            {tracks.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">No tracks</div>}
            {tracks.map(t => (
              <Collapsible key={t.id} className="border border-border/40 rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30 transition">
                  <AudioPlayButton path={t.audio_path} />
                  <span className="text-muted-foreground text-xs w-6">{t.track_number}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{t.title}{t.version ? <span className="text-muted-foreground"> ({t.version})</span> : null}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {[t.isrc, t.duration_seconds ? formatDur(t.duration_seconds) : null, t.language, t.explicit ? "Explicit" : null].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0"><ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" /></Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 px-4 py-3 text-xs border-t border-border/40 bg-background/40">
                    <Row k="Title" v={t.title} />
                    <Row k="Version" v={t.version} />
                    <Row k="ISRC" v={t.isrc} />
                    <Row k="Duration" v={t.duration_seconds ? formatDur(t.duration_seconds) : null} />
                    <Row k="Language" v={t.language} />
                    <Row k="Genre" v={t.primary_genre} />
                    <Row k="Explicit" v={t.explicit ? "Yes" : "No"} />
                    <Row k="Composer" v={t.composer} />
                    <Row k="Lyricist" v={t.lyricist} />
                    <Row k="Producer" v={t.producer} />
                    <Row k="Featured artist" v={t.featured_artist} />
                    <Row k="Contributors" v={t.contributors} />
                    <Row k="Publishing info" v={t.publishing_info} />
                    <Row k="© owner" v={t.copyright_owner} />
                    <Row k="Audio file" v={t.audio_path?.split("/").pop()} />
                    <Row k="Size" v={t.file_size_bytes ? `${(t.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : null} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </Card>
        </TabsContent>


        <TabsContent value="delivery">
          <Card className="p-0 bg-card/60 border-border overflow-hidden">
            <DspDeliveryTable deliveries={deliveries} releaseId={id} staff={staff} onChanged={load} simulate={simulate} />
          </Card>
        </TabsContent>

        {staff && (
          <TabsContent value="prefs">
            <Card className="p-6 bg-card/60 border-border space-y-5">
              <div>
                <h3 className="font-display text-base font-semibold mb-2 flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />Territories</h3>
                <p className="text-sm text-muted-foreground">{Array.isArray(release.territories) && release.territories.length ? release.territories.join(", ") : "Worldwide"}</p>
                {Array.isArray(release.excluded_territories) && release.excluded_territories.length > 0 && (
                  <p className="text-xs text-destructive mt-1">Excluded: {release.excluded_territories.join(", ")}</p>
                )}
              </div>
              <div>
                <h3 className="font-display text-base font-semibold mb-2">Release window</h3>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <Row k="Release date" v={release.release_date} />
                  <Row k="Original release" v={release.original_release_date} />
                  <Row k="Pre-order" v={release.preorder_date} />
                </div>
              </div>
              <div>
                <h3 className="font-display text-base font-semibold mb-2">Pricing</h3>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <Row k="Pricing tier" v={release.price_tier || "Standard"} />
                  <Row k="Currency" v={release.currency || "USD"} />
                  <Row k="Suggested price" v={release.suggested_price ?? "—"} />
                </div>
              </div>
              <div>
                <h3 className="font-display text-base font-semibold mb-2">DSP outlets ({Array.isArray(release.store_selection) ? release.store_selection.length || "All" : "All"})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                  {DSPS_FULL.map(d => {
                    const sel = Array.isArray(release.store_selection) && release.store_selection.length
                      ? release.store_selection.includes(d.name) || release.store_selection.includes(d.slug)
                      : true;
                    const status = deliveries.find(x => x.platform === d.name)?.status;
                    return (
                      <div key={d.slug} className={`flex items-center gap-2 rounded-md border px-2 py-1.5 ${sel ? "border-border" : "border-dashed border-border/40 opacity-50"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status === "live" ? "bg-success" : status === "delivered" ? "bg-blue-500" : status === "rejected" ? "bg-destructive" : "bg-muted-foreground/40"}`} />
                        <span className="truncate flex-1">{d.name}</span>
                        {status && <span className="text-[10px] uppercase text-muted-foreground">{status.replace(/_/g, " ")}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </TabsContent>
        )}



        <TabsContent value="timeline">
          <Card className="p-6 bg-card/60 border-border">
            {events.length === 0 ? (
              <div className="text-muted-foreground text-sm">No events yet.</div>
            ) : (
              <ol className="relative border-l border-border ml-3 space-y-5">
                {events.map(ev => (
                  <li key={ev.id} className="pl-5 relative">
                    <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                    <div className="flex items-center gap-2 text-sm font-medium capitalize">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {ev.type.replace(/_/g, " ")}
                    </div>
                    {ev.note && <div className="text-sm text-muted-foreground mt-0.5">{ev.note}</div>}
                    <div className="text-xs text-muted-foreground mt-1">{new Date(ev.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </TabsContent>

        {staff && (
          <TabsContent value="admin">
            <AdminEditor release={release} tracks={tracks} onSave={async (patch, trackPatches) => {
              try { await updateFn({ data: { releaseId: id, patch, trackPatches } }); toast.success("Saved"); load(); }
              catch (e: any) { toast.error(e.message ?? "Save failed"); }
            }} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function AdminEditor({ release, tracks, onSave }: {
  release: any; tracks: any[];
  onSave: (patch: any, trackPatches?: Array<{ id: string; isrc?: string | null; title?: string }>) => Promise<void>;
}) {
  const [status, setStatus] = useState(release.status);
  const [upc, setUpc] = useState(release.upc ?? "");
  const [cat, setCat] = useState(release.catalog_number ?? "");
  const [remarks, setRemarks] = useState(release.admin_remarks ?? "");
  const [rejection, setRejection] = useState(release.rejection_reason ?? "");
  const [date, setDate] = useState(release.release_date ?? "");
  const [trackEdits, setTrackEdits] = useState<Record<string, { isrc: string; title: string }>>(
    Object.fromEntries(tracks.map(t => [t.id, { isrc: t.isrc ?? "", title: t.title ?? "" }]))
  );

  return (
    <Card className="p-6 bg-card/60 border-border space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <select className="bg-background border border-input rounded-md text-sm px-2 py-2 w-full" value={status} onChange={e => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Release date</Label>
          <Input type="date" value={date || ""} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>UPC / Barcode</Label>
          <Input value={upc} onChange={e => setUpc(e.target.value)} placeholder="e.g. 884389000000" />
        </div>
        <div className="space-y-2">
          <Label>Catalog number</Label>
          <Input value={cat} onChange={e => setCat(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Admin remarks (internal)</Label>
          <Textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Visible to staff and the release owner." />
        </div>
        {status === "rejected" && (
          <div className="space-y-2 sm:col-span-2">
            <Label>Rejection reason (sent to artist)</Label>
            <Textarea rows={3} value={rejection} onChange={e => setRejection(e.target.value)} />
          </div>
        )}
      </div>

      <div>
        <Label className="mb-2 block">Tracks — ISRC & title</Label>
        <div className="space-y-2">
          {tracks.map(t => (
            <div key={t.id} className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground w-6">{t.track_number}</span>
              <Input className="flex-1" value={trackEdits[t.id]?.title ?? ""} onChange={e => setTrackEdits(p => ({ ...p, [t.id]: { ...p[t.id], title: e.target.value } }))} placeholder="Track title" />
              <Input className="w-48 font-mono text-xs" value={trackEdits[t.id]?.isrc ?? ""} onChange={e => setTrackEdits(p => ({ ...p, [t.id]: { ...p[t.id], isrc: e.target.value } }))} placeholder="ISRC" />
            </div>
          ))}
          {tracks.length === 0 && <p className="text-xs text-muted-foreground">No tracks</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => {
          const patch: any = {
            status,
            upc: upc || null,
            catalog_number: cat || null,
            admin_remarks: remarks || null,
            release_date: date || null,
          };
          if (status === "rejected") patch.rejection_reason = rejection || "Not specified";
          const trackPatches = tracks
            .filter(t => trackEdits[t.id] && (trackEdits[t.id].isrc !== (t.isrc ?? "") || trackEdits[t.id].title !== (t.title ?? "")))
            .map(t => ({ id: t.id, isrc: trackEdits[t.id].isrc || null, title: trackEdits[t.id].title }));
          onSave(patch, trackPatches);
        }}>
          <Save className="h-4 w-4 mr-1" />Save changes
        </Button>
      </div>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return <div className="flex justify-between border-b border-border/40 py-1.5"><span className="text-muted-foreground">{k}</span><span className="font-medium truncate ml-3">{v ?? "—"}</span></div>;
}

function formatDur(s: number) {
  const m = Math.floor(s / 60); const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function deliveryStatusClass(s: string) {
  switch (s) {
    case "live": return "bg-success/15 text-success";
    case "delivered": return "bg-blue-500/15 text-blue-500";
    case "in_delivery": return "bg-amber-500/15 text-amber-500";
    case "rejected": return "bg-destructive/15 text-destructive";
    case "takedown": return "bg-orange-500/15 text-orange-500";
    default: return "bg-muted text-muted-foreground";
  }
}

const DSP_STATUS_OPTIONS = ["pending", "in_delivery", "delivered", "live", "rejected", "takedown"];

function DspDeliveryTable({
  deliveries, releaseId, staff, onChanged, simulate,
}: { deliveries: any[]; releaseId: string; staff: boolean; onChanged: () => void; simulate: (p: string, s: string) => void }) {
  const updateFn = useServerFn(updateDspDeliveryFn);
  const [edits, setEdits] = useState<Record<string, { status: string; url: string; error: string }>>({});
  const init = (d: any) => edits[d.id] ?? { status: d.status, url: d.external_url ?? "", error: d.error ?? "" };
  const set = (id: string, patch: Partial<{ status: string; url: string; error: string }>) =>
    setEdits(s => ({ ...s, [id]: { ...init({ id, status: "", external_url: "", error: "" }), ...s[id], ...patch } }));

  const save = async (d: any) => {
    const e = init(d);
    try {
      await updateFn({ data: { deliveryId: d.id, releaseId, platform: d.platform, status: e.status, external_url: e.url || null, error: e.error || null } });
      toast.success(`${d.platform} updated`);
      setEdits(s => { const n = { ...s }; delete n[d.id]; return n; });
      onChanged();
    } catch (e: any) { toast.error(e.message ?? "Update failed"); }
  };

  return (
    <table className="w-full text-sm">
      <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
        <th className="py-2 px-4">Platform</th><th>Status</th><th>Link</th><th>Note</th><th>Updated</th><th className="text-right pr-4">Actions</th>
      </tr></thead>
      <tbody>
        {deliveries.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No DSPs yet.</td></tr>}
        {deliveries.map(d => {
          const e = init(d);
          const dirty = !!edits[d.id];
          return (
            <tr key={d.id} className="border-b border-border/40 align-top">
              <td className="py-2.5 px-4 font-medium">{d.platform}</td>
              <td className="pr-2">
                {staff ? (
                  <select className="bg-background border border-input rounded-md text-xs px-2 py-1" value={e.status} onChange={ev => set(d.id, { status: ev.target.value })}>
                    {DSP_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                ) : (
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${deliveryStatusClass(d.status)}`}>{d.status.replace(/_/g, " ")}</span>
                )}
              </td>
              <td className="pr-2">
                {staff ? (
                  <Input className="h-7 text-xs w-44" value={e.url} onChange={ev => set(d.id, { url: ev.target.value })} placeholder="https://…" />
                ) : d.external_url ? (
                  <a href={d.external_url} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1 text-xs"><ExternalLink className="h-3 w-3" />Open</a>
                ) : <span className="text-muted-foreground text-xs">—</span>}
              </td>
              <td className="pr-2">
                {staff ? (
                  <Input className="h-7 text-xs w-44" value={e.error} onChange={ev => set(d.id, { error: ev.target.value })} placeholder="Optional note" />
                ) : <span className="text-muted-foreground text-xs">{d.error || "—"}</span>}
              </td>
              <td className="text-muted-foreground text-xs">{d.last_event_at ? new Date(d.last_event_at).toLocaleString() : "—"}</td>
              <td className="text-right pr-4">
                {staff && (
                  <div className="inline-flex gap-1">
                    <Button size="sm" variant={dirty ? "default" : "ghost"} onClick={() => save(d)} disabled={!dirty}>
                      <Save className="h-3 w-3 mr-1" />Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => simulate(d.platform, "live")} title="Simulate webhook → live"><RefreshCw className="h-3 w-3" /></Button>
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function DspLog({ events }: { events: any[] }) {
  const dspEvents = events.filter(e => typeof e.type === "string" && e.type.startsWith("dsp_"));
  if (dspEvents.length === 0) return <p className="text-sm text-muted-foreground">No DSP events recorded yet.</p>;
  return (
    <ol className="space-y-2 text-sm">
      {dspEvents.map(ev => (
        <li key={ev.id} className="flex items-start gap-3 border-b border-border/30 pb-2">
          <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${ev.type.includes("live") ? "bg-success" : ev.type.includes("rejected") ? "bg-destructive" : ev.type.includes("delivered") ? "bg-blue-500" : "bg-muted-foreground/40"}`} />
          <div className="flex-1 min-w-0">
            <div className="capitalize">{ev.note || ev.type.replace(/_/g, " ")}</div>
            <div className="text-xs text-muted-foreground">{new Date(ev.created_at).toLocaleString()}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

