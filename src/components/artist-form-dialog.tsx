import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ArtistRow } from "@/components/artist-multi-select";

type EditingArtist = Partial<ArtistRow>;

export function ArtistFormDialog({
  open,
  onOpenChange,
  initial,
  defaultPrimary = false,
  onSaved,
  trigger,
}: {
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  initial?: EditingArtist | null;
  defaultPrimary?: boolean;
  onSaved?: (artist: ArtistRow) => void;
  trigger?: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open! : internalOpen;
  const setOpen = (o: boolean) => { if (isControlled) onOpenChange?.(o); else setInternalOpen(o); };

  const [editing, setEditing] = useState<EditingArtist>({ name: "", is_primary: defaultPrimary });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setEditing(initial ?? { name: "", is_primary: defaultPrimary });
  }, [isOpen, initial, defaultPrimary]);

  const save = async () => {
    if (!editing.name?.trim()) return toast.error("Artist name is required");
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setSaving(false); return; }
    const row = {
      name: editing.name.trim(),
      spotify_url: editing.spotify_url || null,
      apple_music_url: editing.apple_music_url || null,
      youtube_music_url: editing.youtube_music_url || null,
      is_primary: !!editing.is_primary,
    };
    let saved: ArtistRow | null = null;
    if (editing.id) {
      const { data, error } = await supabase.from("artists" as any).update(row).eq("id", editing.id).select().single();
      if (error) { setSaving(false); return toast.error(error.message); }
      saved = data as unknown as ArtistRow;
    } else {
      const { data, error } = await supabase.from("artists" as any).insert({ ...row, owner_id: u.user.id }).select().single();
      if (error) { setSaving(false); return toast.error(error.message); }
      saved = data as unknown as ArtistRow;
    }
    setSaving(false);
    toast.success("Artist saved");
    setOpen(false);
    if (saved) onSaved?.(saved);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader><DialogTitle>{editing.id ? "Edit artist" : "Add artist"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Artist name *</Label><Input value={editing.name ?? ""} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
          <div><Label>Spotify URL</Label><Input value={editing.spotify_url ?? ""} onChange={e => setEditing({ ...editing, spotify_url: e.target.value })} placeholder="https://open.spotify.com/artist/…" /></div>
          <div><Label>Apple Music URL</Label><Input value={editing.apple_music_url ?? ""} onChange={e => setEditing({ ...editing, apple_music_url: e.target.value })} placeholder="https://music.apple.com/…" /></div>
          <div><Label>YouTube Music URL</Label><Input value={editing.youtube_music_url ?? ""} onChange={e => setEditing({ ...editing, youtube_music_url: e.target.value })} placeholder="https://music.youtube.com/…" /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!editing.is_primary} onChange={e => setEditing({ ...editing, is_primary: e.target.checked })} />
            Mark as primary artist
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
