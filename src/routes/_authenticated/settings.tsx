import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: Settings,
});

function Settings() {
  const [profile, setProfile] = useState({ full_name: "", artist_name: "", mobile: "", country: "" });
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("profiles").select("full_name,artist_name,mobile,country").eq("user_id", data.user.id).maybeSingle()
        .then(({ data: p }) => p && setProfile({
          full_name: p.full_name ?? "", artist_name: p.artist_name ?? "",
          mobile: p.mobile ?? "", country: p.country ?? "",
        }));
    });
  }, []);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>

      <Card className="p-6 space-y-4 bg-card/60">
        <h2 className="font-semibold">Profile</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Full name</Label><Input value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></div>
          <div><Label>Artist/Label</Label><Input value={profile.artist_name} onChange={e => setProfile({ ...profile, artist_name: e.target.value })} /></div>
          <div><Label>Mobile</Label><Input value={profile.mobile} onChange={e => setProfile({ ...profile, mobile: e.target.value })} /></div>
          <div><Label>Country</Label><Input value={profile.country} onChange={e => setProfile({ ...profile, country: e.target.value })} /></div>
        </div>
        <Button onClick={async () => {
          const { data: u } = await supabase.auth.getUser();
          if (!u.user) return;
          const { error } = await supabase.from("profiles").update(profile).eq("user_id", u.user.id);
          if (error) return toast.error(error.message);
          toast.success("Profile saved");
        }}>Save profile</Button>
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
