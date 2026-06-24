import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser, roleLabel } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
  head: () => ({ meta: [{ title: "Profile — SoundXpand" }] }),
});

function Profile() {
  const { data, refetch } = useCurrentUser();
  const [form, setForm] = useState({ full_name: "", artist_name: "", country: "", mobile: "" });

  useEffect(() => {
    if (data?.profile) setForm({
      full_name: data.profile.full_name || "",
      artist_name: data.profile.artist_name || "",
      country: data.profile.country || "",
      mobile: data.profile.mobile || "",
    });
  }, [data]);

  const save = async () => {
    const { error } = await supabase.from("profiles").update(form).eq("user_id", data!.user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    refetch();
  };

  if (!data) return null;
  const initials = (data.profile?.full_name || data.user.email || "?").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">Profile</h1>
      <Card className="p-6 bg-card/60 border-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/15 text-primary grid place-items-center text-lg font-semibold">{initials}</div>
          <div>
            <div className="font-semibold">{data.profile?.full_name}</div>
            <div className="text-sm text-muted-foreground">{roleLabel(data.primaryRole)} · {data.profile?.username}</div>
            <div className="text-xs text-muted-foreground">{data.user.email}</div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Full name</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><Label>Artist name</Label><Input value={form.artist_name} onChange={e => setForm({ ...form, artist_name: e.target.value })} /></div>
          <div><Label>Country</Label><Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
          <div><Label>Mobile</Label><Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} /></div>
        </div>
        <Button className="mt-5" onClick={save}>Save changes</Button>
      </Card>
    </div>
  );
}
