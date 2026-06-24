import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/platform-settings")({
  component: PlatformSettings,
  head: () => ({ meta: [{ title: "Platform settings — SoundXpand" }] }),
});

function PlatformSettings() {
  const [brand, setBrand] = useState({ name: "SoundXpand", logo: "", favicon: "" });
  const [smtp, setSmtp] = useState({ host: "", port: "587", user: "", from: "" });
  const [features, setFeatures] = useState({ auto_approve: false, maintenance: false });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("platform_settings").select("key,value");
      (data ?? []).forEach(r => {
        if (r.key === "brand") setBrand({ ...brand, ...(r.value as any) });
        if (r.key === "smtp") setSmtp({ ...smtp, ...(r.value as any) });
        if (r.key === "features") setFeatures({ ...features, ...(r.value as any) });
      });
      const { data: l } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(10);
      setLogs(l ?? []);
    })();
  }, []);

  const save = async (key: string, value: any) => {
    const { error } = await supabase.from("platform_settings").upsert({ key, value });
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Platform settings</h1>
        <p className="text-sm text-muted-foreground">Administrator-only configuration.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card/60 border-border space-y-4">
          <h2 className="font-display font-semibold">Brand</h2>
          <div><Label>Brand name</Label><Input value={brand.name} onChange={e => setBrand({ ...brand, name: e.target.value })} /></div>
          <div><Label>Logo URL</Label><Input value={brand.logo} onChange={e => setBrand({ ...brand, logo: e.target.value })} placeholder="https://…" /></div>
          <div><Label>Favicon URL</Label><Input value={brand.favicon} onChange={e => setBrand({ ...brand, favicon: e.target.value })} placeholder="https://…" /></div>
          <Button onClick={() => save("brand", brand)}>Save brand</Button>
        </Card>

        <Card className="p-6 bg-card/60 border-border space-y-4">
          <h2 className="font-display font-semibold">SMTP</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Host</Label><Input value={smtp.host} onChange={e => setSmtp({ ...smtp, host: e.target.value })} /></div>
            <div><Label>Port</Label><Input value={smtp.port} onChange={e => setSmtp({ ...smtp, port: e.target.value })} /></div>
            <div><Label>User</Label><Input value={smtp.user} onChange={e => setSmtp({ ...smtp, user: e.target.value })} /></div>
            <div className="col-span-2"><Label>From address</Label><Input value={smtp.from} onChange={e => setSmtp({ ...smtp, from: e.target.value })} /></div>
          </div>
          <Button onClick={() => save("smtp", smtp)}>Save SMTP</Button>
        </Card>

        <Card className="p-6 bg-card/60 border-border space-y-4">
          <h2 className="font-display font-semibold">Operations</h2>
          <label className="flex items-center justify-between">
            <span className="text-sm">Auto-approve new users</span>
            <Switch checked={features.auto_approve} onCheckedChange={v => setFeatures({ ...features, auto_approve: v })} />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm">Maintenance mode</span>
            <Switch checked={features.maintenance} onCheckedChange={v => setFeatures({ ...features, maintenance: v })} />
          </label>
          <Button onClick={() => save("features", features)}>Save</Button>
        </Card>

        <Card className="p-6 bg-card/60 border-border">
          <h2 className="font-display font-semibold mb-3">Audit logs</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {logs.map(l => (
                <li key={l.id} className="flex items-center justify-between">
                  <span className="truncate">{l.action}</span>
                  <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
