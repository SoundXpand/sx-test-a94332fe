import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: Settings,
});

type Artist = {
  id: string; name: string; is_primary: boolean;
  spotify_url: string | null; apple_music_url: string | null; youtube_music_url: string | null;
};

function Settings() {
  const [profile, setProfile] = useState({ full_name: "", artist_name: "", mobile: "", country: "", label_name: "" });
  const [password, setPassword] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [editing, setEditing] = useState<Partial<Artist> | null>(null);
  const [open, setOpen] = useState(false);

  const loadArtists = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("artists" as any).select("*").eq("owner_id", u.user.id).order("is_primary", { ascending: false }).order("name");
    setArtists(((data as unknown) as Artist[]) ?? []);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("profiles").select("full_name,artist_name,mobile,country,label_name").eq("user_id", data.user.id).maybeSingle()
        .then(({ data: p }) => p && setProfile({
          full_name: p.full_name ?? "", artist_name: p.artist_name ?? "",
          mobile: p.mobile ?? "", country: p.country ?? "", label_name: (p as any).label_name ?? "",
        }));
    });
    loadArtists();
  }, []);

  const saveArtist = async () => {
    if (!editing?.name?.trim()) return toast.error("Artist name is required");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const row = {
      name: editing.name.trim(),
      spotify_url: editing.spotify_url || null,
      apple_music_url: editing.apple_music_url || null,
      youtube_music_url: editing.youtube_music_url || null,
      is_primary: !!editing.is_primary,
    };
    if (editing.id) {
      const { error } = await supabase.from("artists" as any).update(row).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("artists" as any).insert({ ...row, owner_id: u.user.id });
      if (error) return toast.error(error.message);
    }
    toast.success("Artist saved");
    setOpen(false); setEditing(null);
    loadArtists();
  };

  const removeArtist = async (id: string) => {
    if (!confirm("Remove this artist?")) return;
    const { error } = await supabase.from("artists" as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    loadArtists();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>

      <Card className="p-6 space-y-4 bg-card/60">
        <h2 className="font-semibold">Profile</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Full name</Label><Input value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></div>
          <div><Label>Display name</Label><Input value={profile.artist_name} onChange={e => setProfile({ ...profile, artist_name: e.target.value })} /></div>
          <div><Label>Mobile</Label><Input value={profile.mobile} onChange={e => setProfile({ ...profile, mobile: e.target.value })} /></div>
          <div><Label>Country</Label><Input value={profile.country} onChange={e => setProfile({ ...profile, country: e.target.value })} /></div>
        </div>
        <Button onClick={async () => {
          const { data: u } = await supabase.auth.getUser();
          if (!u.user) return;
          const { error } = await supabase.from("profiles").update({
            full_name: profile.full_name, artist_name: profile.artist_name,
            mobile: profile.mobile, country: profile.country,
          }).eq("user_id", u.user.id);
          if (error) return toast.error(error.message);
          toast.success("Profile saved");
        }}>Save profile</Button>
      </Card>

      <Card className="p-6 space-y-4 bg-card/60">
        <h2 className="font-semibold">Label details</h2>
        <p className="text-xs text-muted-foreground">Your label or imprint name appears on release credits.</p>
        <div><Label>Label name</Label><Input value={profile.label_name} onChange={e => setProfile({ ...profile, label_name: e.target.value })} placeholder="e.g. Stardust Records" /></div>
        <Button onClick={async () => {
          const { data: u } = await supabase.auth.getUser();
          if (!u.user) return;
          const { error } = await supabase.from("profiles").update({ label_name: profile.label_name } as any).eq("user_id", u.user.id);
          if (error) return toast.error(error.message);
          toast.success("Label saved");
        }}>Save label</Button>
      </Card>

      <Card className="p-6 space-y-4 bg-card/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Artists management</h2>
            <p className="text-xs text-muted-foreground">Artists added here can be selected on releases and tracks.</p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditing({ name: "", is_primary: artists.length === 0 })}>
                <Plus className="h-4 w-4 mr-1.5" />Add artist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing?.id ? "Edit artist" : "Add artist"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Artist name *</Label><Input value={editing?.name ?? ""} onChange={e => setEditing({ ...(editing || {}), name: e.target.value })} /></div>
                <div><Label>Spotify URL</Label><Input value={editing?.spotify_url ?? ""} onChange={e => setEditing({ ...(editing || {}), spotify_url: e.target.value })} placeholder="https://open.spotify.com/artist/…" /></div>
                <div><Label>Apple Music URL</Label><Input value={editing?.apple_music_url ?? ""} onChange={e => setEditing({ ...(editing || {}), apple_music_url: e.target.value })} placeholder="https://music.apple.com/…" /></div>
                <div><Label>YouTube Music URL</Label><Input value={editing?.youtube_music_url ?? ""} onChange={e => setEditing({ ...(editing || {}), youtube_music_url: e.target.value })} placeholder="https://music.youtube.com/…" /></div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!editing?.is_primary} onChange={e => setEditing({ ...(editing || {}), is_primary: e.target.checked })} />
                  Mark as primary artist
                </label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
                <Button onClick={saveArtist}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {artists.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg">
            No artists yet. Add your first artist to use them on releases.
          </div>
        ) : (
          <div className="space-y-2">
            {artists.map(a => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{a.name}</span>
                    {a.is_primary && <Badge variant="secondary" className="text-[10px]"><Star className="h-3 w-3 mr-0.5" />Primary</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3">
                    {a.spotify_url && <span>Spotify ✓</span>}
                    {a.apple_music_url && <span>Apple Music ✓</span>}
                    {a.youtube_music_url && <span>YouTube Music ✓</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(a); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => removeArtist(a.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-4 bg-card/60">
        <h2 className="font-semibold">Change password</h2>
        <Input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} />
        <Button onClick={async () => {
          if (password.length < 8) return toast.error("Min 8 chars");
          const { error } = await supabase.auth.updateUser({ password });
          if (error) return toast.error(error.message);
          toast.success("Password updated");
          setPassword("");
        }}>Update password</Button>
      </Card>

      <Card className="p-6 space-y-4 bg-card/60">
        <h2 className="font-semibold">Theme</h2>
        <p className="text-sm text-muted-foreground">Switch between dark, light, and system themes.</p>
        <ThemeToggle />
      </Card>
    </div>
  );
}
