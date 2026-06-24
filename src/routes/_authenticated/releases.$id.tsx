import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Copy, RefreshCw, Disc3, ImageIcon, Check, X, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import { statusBadgeClass } from "@/components/catalog/release-row-actions";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/releases/$id")({
  component: ReleaseDetail,
  head: () => ({ meta: [{ title: "Release detail — SoundXpand" }] }),
});

function ReleaseDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: me } = useCurrentUser();
  const isAdmin = me?.primaryRole === "administrator" || me?.primaryRole === "admin" as any;
  const [release, setRelease] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (r.data?.artwork_path) {
      const { data: s } = await supabase.storage.from("artwork").createSignedUrl(r.data.artwork_path, 3600);
      setArtworkUrl(s?.signedUrl ?? null);
    }
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

  const adminUpdateStatus = async (status: string) => {
    const { error } = await supabase.from("releases").update({ status, ...(status === "rejected" ? { rejection_reason: prompt("Rejection reason?") || "Not specified" } : {}) }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Release → ${status}`);
    load();
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!release) return <div className="p-8">Not found. <Link to="/catalog" className="text-primary">Back to catalog</Link></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/catalog" })}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="font-display text-2xl font-semibold truncate">{release.title}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadgeClass(release.status)}`}>{release.status.replace(/_/g, " ")}</span>
      </div>

      <Card className="p-6 bg-card/60 border-border">
        <div className="flex gap-6 flex-wrap">
          <div className="h-40 w-40 rounded-xl bg-muted overflow-hidden grid place-items-center shrink-0">
            {artworkUrl ? <img src={artworkUrl} className="h-full w-full object-cover" alt="" /> : <ImageIcon className="h-10 w-10 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-[240px] space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge variant="outline" className="capitalize"><Disc3 className="h-3 w-3 mr-1" />{release.release_type}</Badge>
              {release.primary_genre && <Badge variant="outline">{release.primary_genre}</Badge>}
              {release.upc && <span className="text-muted-foreground text-xs">UPC {release.upc}</span>}
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
              {isAdmin && release.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => adminUpdateStatus("approved")}><Check className="h-3.5 w-3.5 mr-1" />Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => adminUpdateStatus("rejected")}><X className="h-3.5 w-3.5 mr-1" />Reject</Button>
                </>
              )}
              {isAdmin && release.status === "approved" && (
                <Button size="sm" onClick={() => adminUpdateStatus("live")}><Send className="h-3.5 w-3.5 mr-1" />Mark live</Button>
              )}
              {isAdmin && release.status === "takedown_requested" && (
                <Button size="sm" variant="destructive" onClick={() => adminUpdateStatus("taken_down")}>Approve takedown</Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tracks">Tracklist ({tracks.length})</TabsTrigger>
          <TabsTrigger value="delivery">Delivery ({deliveries.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({events.length})</TabsTrigger>
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
          </Card>
        </TabsContent>

        <TabsContent value="tracks">
          <Card className="p-0 bg-card/60 border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="py-2 px-4">#</th><th>Title</th><th>ISRC</th><th>Duration</th><th>Explicit</th>
              </tr></thead>
              <tbody>
                {tracks.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No tracks</td></tr>}
                {tracks.map(t => (
                  <tr key={t.id} className="border-b border-border/40">
                    <td className="py-2.5 px-4 text-muted-foreground">{t.track_number}</td>
                    <td className="font-medium">{t.title}{t.version ? <span className="text-muted-foreground"> ({t.version})</span> : null}</td>
                    <td className="text-muted-foreground font-mono text-xs">{t.isrc || "—"}</td>
                    <td className="text-muted-foreground">{t.duration_seconds ? formatDur(t.duration_seconds) : "—"}</td>
                    <td>{t.explicit ? <Badge variant="destructive">E</Badge> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card className="p-0 bg-card/60 border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="py-2 px-4">Platform</th><th>Status</th><th>Last update</th><th>Link</th><th className="text-right pr-4">Actions</th>
              </tr></thead>
              <tbody>
                {deliveries.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No DSPs yet — submit to seed deliveries.</td></tr>}
                {deliveries.map(d => (
                  <tr key={d.id} className="border-b border-border/40">
                    <td className="py-2.5 px-4 font-medium">{d.platform}</td>
                    <td><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${deliveryStatusClass(d.status)}`}>{d.status.replace(/_/g, " ")}</span></td>
                    <td className="text-muted-foreground text-xs">{new Date(d.last_event_at).toLocaleString()}</td>
                    <td>{d.external_url ? <a href={d.external_url} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" />Open</a> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="text-right pr-4">
                      {isAdmin && (
                        <div className="inline-flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => simulate(d.platform, "in_delivery")} title="Mark in delivery"><RefreshCw className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => simulate(d.platform, "delivered")}>Delivered</Button>
                          <Button size="sm" variant="ghost" onClick={() => simulate(d.platform, "live")}>Live</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isAdmin && (
              <div className="p-3 border-t border-border text-xs text-muted-foreground">
                Admin: action buttons call the DSP webhook locally to simulate the lifecycle for demo purposes.
              </div>
            )}
          </Card>
        </TabsContent>

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
      </Tabs>
    </div>
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
