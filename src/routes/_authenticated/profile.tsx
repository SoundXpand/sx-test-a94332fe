import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUser, roleLabel } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
  head: () => ({ meta: [{ title: "Profile — SoundXpand" }] }),
});

const SOCIAL_KEYS = [
  ["social_instagram", "Instagram"],
  ["social_youtube", "YouTube"],
  ["social_spotify", "Spotify"],
  ["social_apple", "Apple Music"],
  ["social_soundcloud", "SoundCloud"],
  ["social_tiktok", "TikTok"],
  ["social_facebook", "Facebook"],
  ["social_vk", "VK"],
  ["social_website", "Website"],
] as const;

function Profile() {
  const { data, refetch } = useCurrentUser();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (data?.profile) setForm({ ...data.profile });
  }, [data]);

  const save = async () => {
    const allowed = [
      "full_name","artist_name","display_name","country","mobile","bio","is_public","avatar_url",
      ...SOCIAL_KEYS.map(([k]) => k),
    ];
    const patch: any = {};
    for (const k of allowed) if (k in form) patch[k] = form[k];
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", data!.user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    refetch();
  };

  if (!data) return null;
  const initials = (data.profile?.full_name || data.user.email || "?").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const roleSlug = (data.profile?.role_type || "artist").toLowerCase();
  const publicPath = `/${roleSlug}/${data.profile?.username || ""}`;
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}${publicPath}` : publicPath;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">Profile</h1>

      <Card className="p-6 bg-card/60 border-border space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/15 text-primary grid place-items-center text-lg font-semibold overflow-hidden">
            {form.avatar_url ? <img src={form.avatar_url} alt="" className="h-full w-full object-cover" /> : initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">{data.profile?.full_name}</div>
            <div className="text-sm text-muted-foreground">{roleLabel(data.primaryRole)} · {data.profile?.username}</div>
            <div className="text-xs text-muted-foreground truncate">{data.user.email}</div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
          <div className="min-w-0">
            <div className="text-sm font-medium">Public profile</div>
            <div className="text-xs text-muted-foreground truncate">{publicPath}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Switch checked={!!form.is_public} onCheckedChange={(v) => setForm({ ...form, is_public: v })} />
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("Link copied"); }}><Copy className="h-3 w-3 mr-1" />Copy</Button>
            <Button size="sm" variant="outline" asChild><Link to={publicPath as any}><ExternalLink className="h-3 w-3 mr-1" />Visit</Link></Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Full name</Label><Input value={form.full_name || ""} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><Label>Display name</Label><Input value={form.display_name || form.artist_name || ""} onChange={e => setForm({ ...form, display_name: e.target.value })} /></div>
          <div><Label>Artist name</Label><Input value={form.artist_name || ""} onChange={e => setForm({ ...form, artist_name: e.target.value })} /></div>
          <div><Label>Country</Label><Input value={form.country || ""} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
          <div><Label>Mobile</Label><Input value={form.mobile || ""} onChange={e => setForm({ ...form, mobile: e.target.value })} /></div>
          <div><Label>Avatar URL</Label><Input value={form.avatar_url || ""} onChange={e => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://" /></div>
        </div>

        <div>
          <Label>Biography</Label>
          <Textarea rows={5} value={form.bio || ""} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell listeners about your story…" />
        </div>

        <div>
          <Label className="mb-2 block">Social links</Label>
          <div className="grid md:grid-cols-2 gap-3">
            {SOCIAL_KEYS.map(([k, lbl]) => (
              <div key={k}>
                <Label className="text-xs text-muted-foreground">{lbl}</Label>
                <Input value={form[k] || ""} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder="https://" />
              </div>
            ))}
          </div>
        </div>

        <Button onClick={save}>Save changes</Button>
      </Card>

      <div className="text-xs text-muted-foreground space-x-3">
        <Link to="/legal/terms" className="hover:text-foreground">Terms</Link>
        <Link to="/legal/privacy" className="hover:text-foreground">Privacy</Link>
      </div>
    </div>
  );
}
