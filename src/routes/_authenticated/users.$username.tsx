import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser, isStaff } from "@/hooks/use-current-user";
import { approveUserFn } from "@/lib/admin-actions.functions";

export const Route = createFileRoute("/_authenticated/users/$username")({
  component: UserDetail,
});

function UserDetail() {
  const { username } = Route.useParams();
  const navigate = useNavigate();
  const { data: me } = useCurrentUser();
  const staff = isStaff(me?.primaryRole);
  const [profile, setProfile] = useState<any>(null);
  const [artists, setArtists] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: p } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
    setProfile(p);
    if (p) {
      const [{ data: a }, { data: rels }, { data: tks }, { data: acts }] = await Promise.all([
        supabase.from("artists" as any).select("*").eq("owner_id", (p as any).user_id),
        supabase.from("releases").select("id,title,release_type,status,release_date,upc,catalog_number,slug,delivered_at,created_at").eq("owner_id", (p as any).user_id).order("created_at", { ascending: false }),
        supabase.from("support_tickets").select("id,subject,status,priority,updated_at").eq("user_id", (p as any).user_id).order("updated_at", { ascending: false }),
        supabase.from("user_activity_log" as any).select("*").eq("user_id", (p as any).user_id).order("created_at", { ascending: false }).limit(50),
      ]);
      setArtists((a as any[]) ?? []);
      setReleases(rels ?? []);
      setTickets(tks ?? []);
      setActivity((acts as any[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [username]);

  const setStatus = async (status: "approved" | "rejected" | "suspended") => {
    if (!profile) return;
    if (status === "approved") {
      try { await approveUserFn({ data: { targetUserId: profile.user_id } }); }
      catch (e: any) { return toast.error(e.message); }
      toast.success("User approved — notification sent");
      return load();
    }
    const patch: any = { status };
    if (status === "rejected") patch.rejection_reason = reason || null;
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", profile.user_id);
    if (error) return toast.error(error.message);
    toast.success(`User ${status}`);
    load();
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!staff) return <div className="text-sm text-muted-foreground">Staff only.</div>;
  if (!profile) return <div>
    <Button variant="ghost" onClick={() => navigate({ to: "/users" })}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
    <div className="mt-4 text-sm text-muted-foreground">User not found.</div>
  </div>;

  const payout = (profile.payout_details ?? {}) as Record<string, string>;

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
        <div className="flex items-center gap-2 mb-2"><Wallet className="h-4 w-4 text-primary" /><h2 className="font-semibold">Payment & withdrawal preference</h2></div>
        <Row k="Method" v={profile.payout_method} />
        {profile.payout_method === "upi" && <Row k="UPI ID" v={payout.upi_id} />}
        {profile.payout_method === "bank" && (<>
          <Row k="Account holder" v={payout.account_holder} />
          <Row k="Bank name" v={payout.bank_name} />
          <Row k="Account number" v={payout.account_number} />
          <Row k="IFSC / Routing" v={payout.ifsc_or_routing} />
          <Row k="SWIFT" v={payout.swift} />
        </>)}
        {profile.payout_method === "paypal" && <Row k="PayPal email" v={payout.paypal_email} />}
        {!profile.payout_method && <div className="text-sm text-muted-foreground">No payout method configured.</div>}
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
        {artists.length === 0 ? <div className="text-sm text-muted-foreground">No artists added.</div> : artists.map(a => (
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
        <h2 className="font-semibold">Catalog ({releases.length})</h2>
        {releases.length === 0 ? <div className="text-sm text-muted-foreground">No releases yet.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="py-2">Title</th><th>Type</th><th>UPC</th><th>Catalog</th><th>Status</th><th>Release date</th>
              </tr></thead>
              <tbody>
                {releases.map(r => (
                  <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2 font-medium"><Link to="/releases/$id" params={{ id: r.id }} className="hover:text-primary">{r.title}</Link></td>
                    <td className="capitalize text-muted-foreground">{r.release_type}</td>
                    <td className="text-muted-foreground">{r.upc || "—"}</td>
                    <td className="text-muted-foreground">{r.catalog_number || "—"}</td>
                    <td><Badge variant="secondary" className="text-[10px] capitalize">{r.status.replace(/_/g," ")}</Badge></td>
                    <td className="text-muted-foreground">{r.release_date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-card/60 space-y-3">
        <h2 className="font-semibold">Support tickets ({tickets.length})</h2>
        {tickets.length === 0 ? <div className="text-sm text-muted-foreground">No tickets.</div> : (
          <ul className="divide-y divide-border">
            {tickets.map(t => (
              <li key={t.id} className="py-2 flex justify-between text-sm">
                <span>{t.subject}</span>
                <span className="text-xs text-muted-foreground capitalize">{t.status.replace(/_/g," ")} · {t.priority}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6 bg-card/60 space-y-3">
        <h2 className="font-semibold">Logbook ({activity.length})</h2>
        {activity.length === 0 ? <div className="text-sm text-muted-foreground">No activity yet.</div> : (
          <ul className="divide-y divide-border max-h-96 overflow-y-auto">
            {activity.map((a: any) => (
              <li key={a.id} className="py-2 flex justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="font-medium capitalize">{a.kind}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.summary || "—"}</div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(a.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
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
