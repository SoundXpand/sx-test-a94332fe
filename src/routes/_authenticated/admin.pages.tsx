import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useCurrentUser, isStaff } from "@/hooks/use-current-user";
import { listCmsPagesFn, upsertCmsPageFn, deleteCmsPageFn } from "@/lib/cms-pages.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, Pencil, Trash2, FileText } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/pages")({
  component: AdminPages,
  head: () => ({ meta: [{ title: "Pages — SoundXpand" }] }),
});

function AdminPages() {
  const { data: me, isLoading } = useCurrentUser();
  const staff = isStaff(me?.primaryRole);
  const listFn = useServerFn(listCmsPagesFn);
  const upsertFn = useServerFn(upsertCmsPageFn);
  const deleteFn = useServerFn(deleteCmsPageFn);
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const load = async () => { try { setRows(await listFn()); } catch {} };
  useEffect(() => { if (staff) load(); }, [staff]);

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!staff) return <Navigate to="/dashboard" />;

  const create = async () => {
    if (!newTitle.trim() || !newSlug.trim()) return toast.error("Title and slug required");
    try {
      const { id } = await upsertFn({ data: { slug: newSlug, title: newTitle, status: "draft" } });
      setNewOpen(false); setNewSlug(""); setNewTitle("");
      navigate({ to: "/admin/pages/$id", params: { id } });
    } catch (e: any) { toast.error(e.message ?? "Create failed"); }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete page "${title}"? This removes all blocks.`)) return;
    try { await deleteFn({ data: { id } }); toast.success("Page deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Pages</h1>
          <p className="text-sm text-muted-foreground">Build and publish marketing or info pages at /p/&lt;slug&gt;.</p>
        </div>
        <Button onClick={() => setNewOpen(true)}><Plus className="h-4 w-4 mr-1" />New page</Button>
      </div>

      <Card className="p-4 bg-card/60 border-border">
        {rows.length === 0 ? (
          <EmptyState icon={FileText} title="No pages yet" description="Create your first page to get started." />
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="py-2 px-2">Title</th><th>Slug</th><th>Status</th><th>Updated</th><th className="text-right pr-2">Actions</th>
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30">
                  <td className="py-2.5 px-2 font-medium">
                    <Link to="/admin/pages/$id" params={{ id: r.id }} className="hover:text-primary">{r.title}</Link>
                  </td>
                  <td className="text-muted-foreground font-mono text-xs">/p/{r.slug}</td>
                  <td>
                    <Badge variant={r.status === "published" ? "default" : "secondary"} className="capitalize">{r.status}</Badge>
                  </td>
                  <td className="text-muted-foreground text-xs">{new Date(r.updated_at).toLocaleString()}</td>
                  <td className="text-right pr-2 space-x-1">
                    {r.status === "published" && (
                      <Button asChild size="icon" variant="ghost" className="h-8 w-8" title="View live">
                        <a href={`/p/${r.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                      </Button>
                    )}
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8" title="Edit">
                      <Link to="/admin/pages/$id" params={{ id: r.id }}><Pencil className="h-3.5 w-3.5" /></Link>
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Delete" onClick={() => remove(r.id, r.title)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New page</DialogTitle>
            <DialogDescription>Start with a title and slug. You can edit everything else next.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={newTitle} onChange={e => { setNewTitle(e.target.value); if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")); }} /></div>
            <div><Label>Slug</Label><Input value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="about-us" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={create}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
