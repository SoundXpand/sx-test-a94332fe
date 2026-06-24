import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/users/$username")({
  component: UserDetail,
});

type Profile = {
  user_id: string; username: string; email: string; full_name: string; artist_name: string;
  mobile: string | null; country: string | null; status: string;
  role_type: string | null; first_name: string | null; last_name: string | null;
  city: string | null; main_genre: string | null; current_distributor: string | null;
  tracks_released_bucket: string | null; private_link: string | null;
  spotify_monthly_listeners_bucket: string | null;
  social_instagram: string | null; social_facebook: string | null;
  social_tiktok: string | null; social_vk: string | null; social_youtube: string | null;
  label_name: string | null; privacy_accepted_at: string | null;
  rejection_reason: string | null; created_at: string;
};

type Artist = { id: string; name: string; is_primary: boolean; spotify_url: string | null; apple_music_url: string | null; youtube_music_url: string | null };

function UserDetail() {
  const { username } = Route.useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    setIsAdmin(roles?.some(r => r.role === "administrator") ?? false);
    const { data: p } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
    setProfile((p as unknown) as Profile);
    if (p) {
      const [{ data: a }, { data: rels }] = await Promise.all([
        supabase.from("artists" as any).select("*").eq("owner_id", (p as any).user_id),
        supabase.from("releases").select("id,title,release_type,status,release_date,upc,catalog_number,slug,created_at").eq("owner_id", (p as any).user_id).order("created_at", { ascending: false }),
      ]);
      setArtists(((a as unknown) as Artist[]) ?? []);
      setReleases(rels ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [username]);

  const setStatus = async (status: "approved" | "rejected" | "suspended") => {
    if (!profile) return;
    const patch: any = { status };
    if (status === "approved") patch.approved_at = new Date().toISOString();
    if (status === "rejected") patch.rejection_reason = reason || null;
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", profile.user_id);
    if (error) return toast.error(error.message);
    toast.success(`User ${status}`);
    load();
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!isAdmin) return <div className="text-sm text-muted-foreground">Administrators only.</div>;
  if (!profile) return <div>
    <Button variant="ghost" onClick={() => navigate({ to: "/users" })}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
    <div className="mt-4 text-sm text-muted-foreground">User not found.</div>
  </div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link to="/users" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" />All users</Link>
          <h1 className="font-display text-2xl font-semibold mt-1">{profile.username}</h1>
          <p className="text-sm text-muted-foreground">{profile.full_name} · {profile.email}</p>
        </div>
        <Badge>{profile.status}</Badge>
      </div>

      <Card className="p-6 bg-card/60 space-y-2">
        <h2 className="font-semibold mb-2">Account</h2>
        <Row k="Role type" v={profile.role_type} />
        <Row k="Name" v={`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()} />
        <Row k="Display name" v={profile.artist_name} />
        <Row k="Phone" v={profile.mobile} />
        <Row k="Country / City" v={[profile.country, profile.city].filter(Boolean).join(" · ")} />
        <Row k="Label" v={profile.label_name} />
        <Row k="Created" v={new Date(profile.created_at).toLocaleString()} />
        <Row k="Privacy policy accepted" v={profile.privacy_accepted_at ? new Date(profile.privacy_accepted_at).toLocaleString() : "—"} />
      </Card>

      <Card className="p-6 bg-card/60 space-y-2">
        <h2 className="font-semibold mb-2">Music profile</h2>
        <Row k="Main genre" v={profile.main_genre} />
        <Row k="Current distributor" v={profile.current_distributor} />
        <Row k="Tracks released" v={profile.tracks_released_bucket} />
        <Row k="Spotify monthly listeners" v={profile.spotify_monthly_listeners_bucket} />
        <Row k="Private link" v={profile.private_link} />
      </Card>

      <Card className="p-6 bg-card/60 space-y-2">
        <h2 className="font-semibold mb-2">Socials</h2>
        <Row k="Instagram" v={profile.social_instagram} />
        <Row k="Facebook" v={profile.social_facebook} />
        <Row k="TikTok" v={profile.social_tiktok} />
        <Row k="VK" v={profile.social_vk} />
        <Row k="YouTube" v={profile.social_youtube} />
      </Card>

      <Card className="p-6 bg-card/60 space-y-3">
        <h2 className="font-semibold">Artists ({artists.length})</h2>
        {artists.length === 0 ? (
          <div className="text-sm text-muted-foreground">No artists added.</div>
        ) : artists.map(a => (
          <div key={a.id} className="rounded-lg border border-border p-3">
            <div className="font-medium">{a.name} {a.is_primary && <Badge variant="secondary" className="text-[10px] ml-1">Primary</Badge>}</div>
            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
              {a.spotify_url && <div>Spotify: <a href={a.spotify_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{a.spotify_url}</a></div>}
              {a.apple_music_url && <div>Apple Music: <a href={a.apple_music_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{a.apple_music_url}</a></div>}
              {a.youtube_music_url && <div>YouTube Music: <a href={a.youtube_music_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{a.youtube_music_url}</a></div>}
            </div>
          </div>
        ))}
      </Card>

      <Card className="p-6 bg-card/60 space-y-3">
        <h2 className="font-semibold">Review</h2>
        {profile.rejection_reason && <div className="text-xs text-destructive">Previous reason: {profile.rejection_reason}</div>}
        <Textarea placeholder="Reason (required for rejection)" value={reason} onChange={e => setReason(e.target.value)} rows={2} />
        <div className="flex flex-wrap gap-2">
          {profile.status !== "approved" && <Button onClick={() => setStatus("approved")}>Approve</Button>}
          {profile.status !== "rejected" && <Button variant="outline" onClick={() => { if (!reason.trim()) return toast.error("Provide a rejection reason"); setStatus("rejected"); }}>Reject</Button>}
          {profile.status !== "suspended" && <Button variant="outline" onClick={() => setStatus("suspended")}>Suspend</Button>}
        </div>
      </Card>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/40 py-1.5 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right truncate max-w-[60%]">{v || "—"}</span>
    </div>
  );
}
