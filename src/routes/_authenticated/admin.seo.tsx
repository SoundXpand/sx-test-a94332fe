import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useCurrentUser, isStaff } from "@/hooks/use-current-user";
import {
  getSeoOverviewFn, listIndexQueueFn, enqueueUrlsFn, rebuildIndexQueueFn,
  processIndexQueueFn, clearIndexQueueFn, getRobotsFn, saveRobotsFn, saveSeoSettingsFn,
} from "@/lib/seo.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Search, ListChecks, FileCode2, Bot, RefreshCw, PlayCircle, Trash2, Plus,
  Globe, Disc3, UserCircle2, CheckCircle2, XCircle, Clock, ExternalLink, Save,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: SeoCenter,
  head: () => ({ meta: [{ title: "SEO Center — SoundXpand" }, { name: "robots", content: "noindex" }] }),
});

function StatCard({ icon: Icon, label, value, hint }: any) {
  return (
    <Card className="p-5 bg-card/60 border-border">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
      {hint ? <div className="text-[11px] text-muted-foreground mt-1">{hint}</div> : null}
    </Card>
  );
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    success: "bg-emerald-500/15 text-emerald-500",
    failed: "bg-rose-500/15 text-rose-500",
    processing: "bg-amber-500/15 text-amber-500",
    pending: "bg-muted text-muted-foreground",
    skipped: "bg-muted text-muted-foreground",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[s] ?? "bg-muted"}`}>{s}</span>;
}

function SeoCenter() {
  const { data: me, isLoading } = useCurrentUser();
  const staff = isStaff(me?.primaryRole);
  const overviewFn = useServerFn(getSeoOverviewFn);
  const listQ = useServerFn(listIndexQueueFn);
  const enqueueFn = useServerFn(enqueueUrlsFn);
  const rebuildFn = useServerFn(rebuildIndexQueueFn);
  const processFn = useServerFn(processIndexQueueFn);
  const clearFn = useServerFn(clearIndexQueueFn);
  const getRobots = useServerFn(getRobotsFn);
  const saveRobots = useServerFn(saveRobotsFn);
  const saveSettings = useServerFn(saveSeoSettingsFn);

  const [overview, setOverview] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [robots, setRobots] = useState<string>("");
  const [manualUrls, setManualUrls] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({});

  const loadAll = async () => {
    if (!staff) return;
    try {
      const [ov, q, rb] = await Promise.all([overviewFn(), listQ({ data: { status: statusFilter } }), getRobots()]);
      setOverview(ov); setQueue(q); setRobots((rb as any)?.content ?? "");
      setSettings(ov.settings ?? {});
    } catch (e: any) { toast.error(e?.message ?? "Failed to load"); }
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line */ }, [staff, statusFilter]);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!staff) return <Navigate to="/dashboard" />;

  const run = async (label: string, fn: () => Promise<any>) => {
    setBusy(label);
    try { const r = await fn(); toast.success(`${label} done`); await loadAll(); return r; }
    catch (e: any) { toast.error(e?.message ?? "Error"); }
    finally { setBusy(null); }
  };

  const base = settings.base_url || "https://sx-test.lovable.app";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2"><Search className="h-6 w-6 text-primary" />SEO Center</h1>
          <p className="text-sm text-muted-foreground">Sitemaps, indexing, robots — Google & Bing.</p>
        </div>
        <Button variant="outline" onClick={loadAll}><RefreshCw className="h-4 w-4 mr-1.5" />Refresh</Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sitemaps">Sitemaps</TabsTrigger>
          <TabsTrigger value="indexing">Indexing</TabsTrigger>
          <TabsTrigger value="robots">Robots</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard icon={Clock} label="Queue pending" value={overview?.queue.pending ?? "—"} />
            <StatCard icon={CheckCircle2} label="Succeeded" value={overview?.queue.success ?? "—"} />
            <StatCard icon={XCircle} label="Failed" value={overview?.queue.failed ?? "—"} />
            <StatCard icon={ListChecks} label="Queue total" value={overview?.queue.total ?? "—"} />
            <StatCard icon={Disc3} label="Live releases" value={overview?.counts.releases ?? "—"} />
            <StatCard icon={UserCircle2} label="Public profiles" value={overview?.counts.profiles ?? "—"} />
          </div>
          <Card className="p-6 bg-card/60">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold">Recent queue activity</h2>
              <span className="text-xs text-muted-foreground">Last 15</span>
            </div>
            {(overview?.recent ?? []).length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">No entries yet.</div>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {overview.recent.map((r: any) => (
                  <li key={r.id} className="py-2 flex items-center gap-3">
                    {statusBadge(r.status)}
                    <span className="truncate flex-1 min-w-0" title={r.url}>{r.url}</span>
                    <span className="text-[10px] text-muted-foreground">{r.target}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(r.updated_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        {/* SITEMAPS */}
        <TabsContent value="sitemaps" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: "Main", path: "/sitemap-main.xml", desc: "Landing, distribution, legal", icon: Globe },
              { name: "Releases", path: "/sitemap-releases.xml", desc: `${overview?.counts.releases ?? 0} live smart-link URLs`, icon: Disc3 },
              { name: "Profiles", path: "/sitemap-profiles.xml", desc: `${overview?.counts.profiles ?? 0} public profiles`, icon: UserCircle2 },
            ].map(s => (
              <Card key={s.path} className="p-5 bg-card/60">
                <div className="flex items-center justify-between mb-2"><s.icon className="h-4 w-4 text-primary" /><Badge variant="outline">XML</Badge></div>
                <div className="font-display text-lg font-semibold">{s.name} sitemap</div>
                <div className="text-xs text-muted-foreground mb-3">{s.desc}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild><a href={s.path} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" />View</a></Button>
                </div>
              </Card>
            ))}
          </div>
          <Card className="p-5 bg-card/60">
            <div className="flex items-center justify-between mb-1">
              <div>
                <div className="font-display text-lg font-semibold">Sitemap index</div>
                <div className="text-xs text-muted-foreground">Submit this URL to Google Search Console & Bing Webmaster Tools.</div>
              </div>
              <Button variant="outline" size="sm" asChild><a href="/sitemap.xml" target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" />sitemap.xml</a></Button>
            </div>
            <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">{base}/sitemap.xml</code>
          </Card>
        </TabsContent>

        {/* INDEXING */}
        <TabsContent value="indexing" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-5 bg-card/60">
              <h3 className="font-display text-lg font-semibold mb-2">Rebuild queue</h3>
              <p className="text-xs text-muted-foreground mb-3">Enqueue all URLs from a source for re-indexing.</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={!!busy} onClick={() => run("Enqueue releases", () => rebuildFn({ data: { include: { releases: true } } }))}><Disc3 className="h-3.5 w-3.5 mr-1" />Releases</Button>
                <Button size="sm" disabled={!!busy} onClick={() => run("Enqueue profiles", () => rebuildFn({ data: { include: { profiles: true } } }))}><UserCircle2 className="h-3.5 w-3.5 mr-1" />Profiles</Button>
                <Button size="sm" disabled={!!busy} onClick={() => run("Enqueue core", () => rebuildFn({ data: { include: { core: true } } }))}><Globe className="h-3.5 w-3.5 mr-1" />Core pages</Button>
                <Button size="sm" variant="secondary" disabled={!!busy} onClick={() => run("Enqueue all", () => rebuildFn({ data: { include: { core: true, releases: true, profiles: true } } }))}>All</Button>
              </div>
            </Card>
            <Card className="p-5 bg-card/60">
              <h3 className="font-display text-lg font-semibold mb-2">Manual URLs</h3>
              <Textarea rows={3} placeholder={`${base}/some/path\n${base}/another`} value={manualUrls} onChange={e => setManualUrls(e.target.value)} />
              <Button size="sm" className="mt-2" disabled={!!busy || !manualUrls.trim()} onClick={() => run("Enqueue URLs", async () => {
                await enqueueFn({ data: { urls: manualUrls.split(/\s+/), source: "manual" } });
                setManualUrls("");
              })}><Plus className="h-3.5 w-3.5 mr-1" />Add to queue</Button>
            </Card>
          </div>

          <Card className="p-5 bg-card/60">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <h3 className="font-display text-lg font-semibold">Index Queue</h3>
              <div className="flex flex-wrap gap-2">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-xs bg-background border border-input rounded px-2 py-1">
                  {["all","pending","processing","success","failed","skipped"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button size="sm" disabled={!!busy} onClick={() => run("Process queue", () => processFn({ data: { limit: 50 } }))}><PlayCircle className="h-3.5 w-3.5 mr-1" />Process now</Button>
                <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run("Clear", () => clearFn({ data: { status: statusFilter } }))}><Trash2 className="h-3.5 w-3.5 mr-1" />Clear {statusFilter === "all" ? "all" : statusFilter}</Button>
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground mb-2">
              Google Indexing: <Badge variant={settings.google_indexing_enabled ? "default" : "outline"}>{settings.google_indexing_enabled ? "on" : "off"}</Badge>
              &nbsp;&nbsp;Bing IndexNow: <Badge variant={settings.bing_indexnow_enabled ? "default" : "outline"}>{settings.bing_indexnow_enabled ? "on" : "off"}</Badge>
              &nbsp;&nbsp;Auto-runs every 15 minutes via cron.
            </div>
            {queue.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">Queue is empty.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground text-left">
                    <tr><th className="py-2">Status</th><th>URL</th><th>Src</th><th>Google</th><th>Bing</th><th>Attempts</th><th>Updated</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {queue.map(r => (
                      <tr key={r.id}>
                        <td className="py-2">{statusBadge(r.status)}</td>
                        <td className="max-w-[380px] truncate" title={r.url}>{r.url}</td>
                        <td className="text-xs text-muted-foreground">{r.source ?? "—"}</td>
                        <td className="text-xs">{r.google_status ?? "—"}</td>
                        <td className="text-xs">{r.bing_status ?? "—"}</td>
                        <td className="text-xs">{r.attempts}</td>
                        <td className="text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ROBOTS */}
        <TabsContent value="robots" className="space-y-4 mt-4">
          <Card className="p-5 bg-card/60">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-display text-lg font-semibold flex items-center gap-2"><Bot className="h-4 w-4" />robots.txt editor</h3>
                <p className="text-xs text-muted-foreground">Served live at <code>/robots.txt</code>.</p>
              </div>
              <Button variant="outline" size="sm" asChild><a href="/robots.txt" target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" />Preview</a></Button>
            </div>
            <Textarea rows={14} value={robots} onChange={e => setRobots(e.target.value)} className="font-mono text-xs" />
            <Button size="sm" className="mt-3" disabled={!!busy} onClick={() => run("Save robots.txt", () => saveRobots({ data: { content: robots } }))}><Save className="h-3.5 w-3.5 mr-1" />Save</Button>
          </Card>
        </TabsContent>

        {/* SETTINGS */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card className="p-5 bg-card/60 space-y-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2"><FileCode2 className="h-4 w-4" />SEO Settings</h3>

            <div>
              <Label>Base URL</Label>
              <Input value={settings.base_url ?? ""} onChange={e => setSettings({ ...settings, base_url: e.target.value })} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Google site verification</Label>
                <Input placeholder="content of google-site-verification meta" value={settings.google_site_verification ?? ""} onChange={e => setSettings({ ...settings, google_site_verification: e.target.value })} />
              </div>
              <div>
                <Label>Bing site verification</Label>
                <Input placeholder="content of msvalidate.01 meta" value={settings.bing_site_verification ?? ""} onChange={e => setSettings({ ...settings, bing_site_verification: e.target.value })} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-md border border-border">
                <div>
                  <div className="text-sm font-medium">Google Indexing API</div>
                  <div className="text-[11px] text-muted-foreground">Needs GOOGLE_INDEXING_SA_JSON secret</div>
                </div>
                <Switch checked={!!settings.google_indexing_enabled} onCheckedChange={v => setSettings({ ...settings, google_indexing_enabled: v })} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-md border border-border">
                <div>
                  <div className="text-sm font-medium">Bing IndexNow</div>
                  <div className="text-[11px] text-muted-foreground">Needs BING_INDEXNOW_KEY secret</div>
                </div>
                <Switch checked={!!settings.bing_indexnow_enabled} onCheckedChange={v => setSettings({ ...settings, bing_indexnow_enabled: v })} />
              </div>
            </div>

            <div>
              <Label>Bing IndexNow key (also served at /&lt;key&gt;.txt)</Label>
              <Input value={settings.bing_indexnow_key ?? ""} onChange={e => setSettings({ ...settings, bing_indexnow_key: e.target.value })} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-md border border-border">
              <div>
                <div className="text-sm font-medium">Auto-enqueue on publish</div>
                <div className="text-[11px] text-muted-foreground">Adds smart-link URLs to the queue as releases go live.</div>
              </div>
              <Switch checked={!!settings.auto_enqueue_on_publish} onCheckedChange={v => setSettings({ ...settings, auto_enqueue_on_publish: v })} />
            </div>

            <Button size="sm" disabled={!!busy} onClick={() => run("Save settings", () => saveSettings({ data: settings }))}><Save className="h-3.5 w-3.5 mr-1" />Save settings</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
