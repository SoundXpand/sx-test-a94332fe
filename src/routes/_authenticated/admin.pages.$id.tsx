import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useCurrentUser, isStaff } from "@/hooks/use-current-user";
import { getCmsPageFn, upsertCmsPageFn, saveCmsBlocksFn, type CmsBlock } from "@/lib/cms-pages.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Plus, Save, Trash2, ArrowUp, ArrowDown, ExternalLink, Image as ImageIcon, Type, Sparkles, MousePointerClick, Code, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/pages/$id")({
  component: PageEditor,
  head: () => ({ meta: [{ title: "Edit page — SoundXpand" }] }),
});

const BLOCK_TYPES: Array<{ type: CmsBlock["type"]; label: string; icon: any; defaults: Record<string, any> }> = [
  { type: "hero", label: "Hero", icon: Sparkles, defaults: { heading: "Hero heading", subheading: "Supporting subheading", ctaLabel: "Get started", ctaHref: "/auth", imageUrl: "" } },
  { type: "rich_text", label: "Text", icon: Type, defaults: { html: "<p>Write your content here…</p>" } },
  { type: "image", label: "Image", icon: ImageIcon, defaults: { src: "", alt: "", caption: "" } },
  { type: "cta", label: "CTA", icon: MousePointerClick, defaults: { heading: "Ready?", label: "Sign up", href: "/auth" } },
  { type: "features", label: "Features", icon: Star, defaults: { heading: "Why us", items: [{ title: "Fast", body: "Quick to set up." }, { title: "Reliable", body: "Built for scale." }] } },
  { type: "embed", label: "Embed", icon: Code, defaults: { html: "<iframe src=\"https://example.com\" width=\"100%\" height=\"400\"></iframe>" } },
];

function PageEditor() {
  const { id } = Route.useParams();
  const { data: me, isLoading } = useCurrentUser();
  const staff = isStaff(me?.primaryRole);
  const navigate = useNavigate();
  const getFn = useServerFn(getCmsPageFn);
  const upsertFn = useServerFn(upsertCmsPageFn);
  const saveBlocksFn = useServerFn(saveCmsBlocksFn);

  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!staff) return;
    (async () => {
      try {
        const res: any = await getFn({ data: { id } });
        setPage(res.page);
        setBlocks((res.blocks ?? []).map((b: any) => ({ id: b.id, position: b.position, type: b.type, data: b.data ?? {} })));
      } catch (e: any) { toast.error(e.message); }
    })();
  }, [id, staff]);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!staff) return <Navigate to="/dashboard" />;
  if (!page) return <div className="p-8 text-muted-foreground">Loading…</div>;

  const updateMeta = (patch: any) => setPage((p: any) => ({ ...p, ...patch }));
  const addBlock = (type: CmsBlock["type"]) => {
    const def = BLOCK_TYPES.find(b => b.type === type)!;
    setBlocks(bs => [...bs, { position: bs.length, type, data: { ...def.defaults } }]);
  };
  const move = (idx: number, dir: -1 | 1) => {
    setBlocks(bs => {
      const next = [...bs];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return bs;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next.map((b, i) => ({ ...b, position: i }));
    });
  };
  const removeBlock = (idx: number) => setBlocks(bs => bs.filter((_, i) => i !== idx).map((b, i) => ({ ...b, position: i })));
  const patchBlock = (idx: number, data: any) => setBlocks(bs => bs.map((b, i) => i === idx ? { ...b, data: { ...b.data, ...data } } : b));

  const save = async () => {
    setBusy(true);
    try {
      await upsertFn({ data: { id, slug: page.slug, title: page.title, status: page.status, seo_title: page.seo_title, seo_description: page.seo_description, og_image_url: page.og_image_url } });
      await saveBlocksFn({ data: { pageId: id, blocks } });
      toast.success("Saved");
    } catch (e: any) { toast.error(e.message ?? "Save failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3 flex-wrap">
        <Button size="icon" variant="ghost" onClick={() => navigate({ to: "/admin/pages" })}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="font-display text-2xl font-semibold truncate flex-1">{page.title || "Untitled"}</h1>
        {page.status === "published" && (
          <Button asChild variant="outline" size="sm">
            <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" />View live</a>
          </Button>
        )}
        <Button onClick={save} disabled={busy}><Save className="h-4 w-4 mr-1" />{busy ? "Saving…" : "Save"}</Button>
      </div>

      <Card className="p-6 bg-card/60 border-border space-y-4">
        <h2 className="font-display text-base font-semibold">SEO & meta</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Title</Label><Input value={page.title ?? ""} onChange={e => updateMeta({ title: e.target.value })} /></div>
          <div><Label>Slug</Label><Input value={page.slug ?? ""} onChange={e => updateMeta({ slug: e.target.value })} /></div>
          <div><Label>SEO title</Label><Input value={page.seo_title ?? ""} onChange={e => updateMeta({ seo_title: e.target.value })} placeholder="Defaults to title" /></div>
          <div><Label>OG image URL</Label><Input value={page.og_image_url ?? ""} onChange={e => updateMeta({ og_image_url: e.target.value })} placeholder="https://…" /></div>
          <div className="sm:col-span-2"><Label>SEO description</Label><Textarea rows={2} value={page.seo_description ?? ""} onChange={e => updateMeta({ seo_description: e.target.value })} /></div>
          <div className="flex items-center gap-3">
            <Switch checked={page.status === "published"} onCheckedChange={(c) => updateMeta({ status: c ? "published" : "draft" })} />
            <span className="text-sm">{page.status === "published" ? "Published" : "Draft"}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card/60 border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Blocks ({blocks.length})</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add block</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {BLOCK_TYPES.map(b => (
                <DropdownMenuItem key={b.type} onClick={() => addBlock(b.type)}>
                  <b.icon className="h-4 w-4 mr-2" />{b.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {blocks.length === 0 && <p className="text-sm text-muted-foreground">No blocks yet. Add one to start.</p>}

        {blocks.map((b, idx) => (
          <Card key={idx} className="p-4 bg-background/40 border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{b.type.replace("_", " ")}</span>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUp className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(idx, 1)} disabled={idx === blocks.length - 1}><ArrowDown className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeBlock(idx)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </div>
            <BlockFields block={b} onChange={(d) => patchBlock(idx, d)} />
          </Card>
        ))}
      </Card>
    </div>
  );
}

function BlockFields({ block, onChange }: { block: CmsBlock; onChange: (d: any) => void }) {
  const d = block.data ?? {};
  if (block.type === "hero") return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Input value={d.heading ?? ""} onChange={e => onChange({ heading: e.target.value })} placeholder="Heading" />
      <Input value={d.subheading ?? ""} onChange={e => onChange({ subheading: e.target.value })} placeholder="Subheading" />
      <Input value={d.ctaLabel ?? ""} onChange={e => onChange({ ctaLabel: e.target.value })} placeholder="CTA label" />
      <Input value={d.ctaHref ?? ""} onChange={e => onChange({ ctaHref: e.target.value })} placeholder="CTA link" />
      <Input className="sm:col-span-2" value={d.imageUrl ?? ""} onChange={e => onChange({ imageUrl: e.target.value })} placeholder="Background image URL (optional)" />
    </div>
  );
  if (block.type === "rich_text") return (
    <Textarea rows={6} value={d.html ?? ""} onChange={e => onChange({ html: e.target.value })} placeholder="HTML allowed" />
  );
  if (block.type === "image") return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Input value={d.src ?? ""} onChange={e => onChange({ src: e.target.value })} placeholder="Image URL" />
      <Input value={d.alt ?? ""} onChange={e => onChange({ alt: e.target.value })} placeholder="Alt text" />
      <Input className="sm:col-span-2" value={d.caption ?? ""} onChange={e => onChange({ caption: e.target.value })} placeholder="Caption (optional)" />
    </div>
  );
  if (block.type === "cta") return (
    <div className="grid sm:grid-cols-3 gap-3">
      <Input value={d.heading ?? ""} onChange={e => onChange({ heading: e.target.value })} placeholder="Heading" />
      <Input value={d.label ?? ""} onChange={e => onChange({ label: e.target.value })} placeholder="Button label" />
      <Input value={d.href ?? ""} onChange={e => onChange({ href: e.target.value })} placeholder="Button link" />
    </div>
  );
  if (block.type === "features") {
    const items: any[] = Array.isArray(d.items) ? d.items : [];
    return (
      <div className="space-y-3">
        <Input value={d.heading ?? ""} onChange={e => onChange({ heading: e.target.value })} placeholder="Section heading" />
        {items.map((it, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-2">
            <Input value={it.title ?? ""} onChange={e => { const next = [...items]; next[i] = { ...it, title: e.target.value }; onChange({ items: next }); }} placeholder="Feature title" />
            <Input value={it.body ?? ""} onChange={e => { const next = [...items]; next[i] = { ...it, body: e.target.value }; onChange({ items: next }); }} placeholder="Feature description" />
          </div>
        ))}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onChange({ items: [...items, { title: "", body: "" }] })}><Plus className="h-3.5 w-3.5 mr-1" />Add item</Button>
          {items.length > 0 && (
            <Button size="sm" variant="ghost" onClick={() => onChange({ items: items.slice(0, -1) })}>Remove last</Button>
          )}
        </div>
      </div>
    );
  }
  if (block.type === "embed") return (
    <Textarea rows={4} value={d.html ?? ""} onChange={e => onChange({ html: e.target.value })} placeholder="<iframe …>" />
  );
  return null;
}
