import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArtistFormDialog } from "@/components/artist-form-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label as UILabel } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus, Pencil, Trash2, Star, Wallet, FileSignature, Download } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser, isStaff } from "@/hooks/use-current-user";
import { SignedAgreementsCard } from "@/components/agreements/signed-agreements-card";

export const Route = createFileRoute("/_authenticated/settings")({
  component: Settings,
});

type Artist = {
  id: string; name: string; is_primary: boolean;
  spotify_url: string | null; apple_music_url: string | null; youtube_music_url: string | null;
};

function Settings() {
  const { data: me } = useCurrentUser();
  const staff = isStaff(me?.primaryRole);
  const [profile, setProfile] = useState({ full_name: "", artist_name: "", mobile: "", country: "", label_name: "" });
  const [subLabels, setSubLabels] = useState<string[]>([]);
  const [newSubLabel, setNewSubLabel] = useState("");
  const [password, setPassword] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [editing, setEditing] = useState<Partial<Artist> | null>(null);
  const [open, setOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<string>("");
  const [payoutDetails, setPayoutDetails] = useState<Record<string, string>>({});
  const [payoutSaving, setPayoutSaving] = useState(false);

  const loadArtists = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("artists" as any).select("*").eq("owner_id", u.user.id).order("is_primary", { ascending: false }).order("name");
    setArtists(((data as unknown) as Artist[]) ?? []);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("profiles").select("full_name,artist_name,mobile,country,label_name,sub_labels,payout_method,payout_details").eq("user_id", data.user.id).maybeSingle()
        .then(({ data: p }) => {
          if (!p) return;
          setProfile({
            full_name: p.full_name ?? "", artist_name: p.artist_name ?? "",
            mobile: p.mobile ?? "", country: p.country ?? "", label_name: (p as any).label_name ?? "",
          });
          setSubLabels(((p as any).sub_labels as string[]) ?? []);
          setPayoutMethod((p as any).payout_method ?? "");
          setPayoutDetails(((p as any).payout_details as Record<string, string>) ?? {});
        });
    });
    loadArtists();
  }, []);

  const savePayout = async () => {
    if (!payoutMethod) return toast.error("Select a payout method");
    setPayoutSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setPayoutSaving(false); return; }
    const { error } = await supabase.from("profiles").update({
      payout_method: payoutMethod, payout_details: payoutDetails,
    } as any).eq("user_id", u.user.id);
    setPayoutSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Payout preference saved");
  };
  const pdSet = (k: string) => (v: string) => setPayoutDetails(d => ({ ...d, [k]: v }));

  const saveSubLabels = async (next: string[]) => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    setSubLabels(next);
    const { error } = await supabase.from("profiles").update({ sub_labels: next } as any).eq("user_id", u.user.id);
    if (error) toast.error(error.message);
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

      {!staff && <Card className="p-6 space-y-4 bg-card/60">
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

        <div className="pt-3 border-t border-border space-y-2">
          <Label>Sub labels</Label>
          <p className="text-xs text-muted-foreground">Imprint sub-labels selectable in the release wizard.</p>
          {subLabels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {subLabels.map(s => (
                <Badge key={s} variant="secondary" className="gap-1.5">
                  {s}
                  <button onClick={() => saveSubLabels(subLabels.filter(x => x !== s))} className="opacity-60 hover:opacity-100">×</button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input value={newSubLabel} onChange={e => setNewSubLabel(e.target.value)} placeholder="Sub-label name" />
            <Button variant="outline" onClick={() => {
              const v = newSubLabel.trim();
              if (!v) return;
              if (subLabels.includes(v)) return toast.error("Already added");
              saveSubLabels([...subLabels, v]); setNewSubLabel("");
            }}>Add</Button>
          </div>
        </div>
      </Card>}


      {!staff && <Card className="p-6 space-y-4 bg-card/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Artists management</h2>
            <p className="text-xs text-muted-foreground">Artists added here can be selected on releases and tracks.</p>
          </div>
          <ArtistFormDialog
            open={open}
            onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}
            initial={editing}
            defaultPrimary={artists.length === 0}
            onSaved={() => { setEditing(null); loadArtists(); }}
            trigger={
              <Button size="sm" onClick={() => setEditing({ name: "", is_primary: artists.length === 0 })}>
                <Plus className="h-4 w-4 mr-1.5" />Add artist
              </Button>
            }
          />

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
      </Card>}

      {!staff && <Card className="p-6 space-y-4 bg-card/60">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Payment & withdrawal preference</h2>
        </div>
        <p className="text-xs text-muted-foreground">Choose how you'd like to receive your royalty payouts.</p>
        <div className="space-y-1.5">
          <UILabel>Payout method</UILabel>
          <Select value={payoutMethod} onValueChange={(v) => { setPayoutMethod(v); setPayoutDetails({}); }}>
            <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="bank">Bank transfer</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {payoutMethod === "upi" && (
          <div className="space-y-1.5">
            <UILabel>UPI ID *</UILabel>
            <Input value={payoutDetails.upi_id ?? ""} onChange={e => pdSet("upi_id")(e.target.value)} placeholder="yourname@bank" />
          </div>
        )}

        {payoutMethod === "bank" && (
          <div className="grid md:grid-cols-2 gap-3">
            <div><UILabel>Account holder name *</UILabel><Input value={payoutDetails.account_holder ?? ""} onChange={e => pdSet("account_holder")(e.target.value)} /></div>
            <div><UILabel>Bank name *</UILabel><Input value={payoutDetails.bank_name ?? ""} onChange={e => pdSet("bank_name")(e.target.value)} /></div>
            <div><UILabel>Account number *</UILabel><Input value={payoutDetails.account_number ?? ""} onChange={e => pdSet("account_number")(e.target.value)} /></div>
            <div><UILabel>IFSC / Routing *</UILabel><Input value={payoutDetails.ifsc_or_routing ?? ""} onChange={e => pdSet("ifsc_or_routing")(e.target.value)} /></div>
            <div className="md:col-span-2"><UILabel>SWIFT (international, optional)</UILabel><Input value={payoutDetails.swift ?? ""} onChange={e => pdSet("swift")(e.target.value)} /></div>
          </div>
        )}

        {payoutMethod === "paypal" && (
          <div className="space-y-1.5">
            <UILabel>PayPal email *</UILabel>
            <Input type="email" value={payoutDetails.paypal_email ?? ""} onChange={e => pdSet("paypal_email")(e.target.value)} placeholder="you@example.com" />
          </div>
        )}

        <Button onClick={savePayout} disabled={payoutSaving || !payoutMethod}>{payoutSaving ? "Saving…" : "Save payout preference"}</Button>
      </Card>}

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
