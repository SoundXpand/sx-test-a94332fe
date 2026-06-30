import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Plus } from "lucide-react";
import { ArtistFormDialog } from "@/components/artist-form-dialog";


export type ArtistRow = {
  id: string; name: string; is_primary: boolean;
  spotify_url?: string | null; apple_music_url?: string | null; youtube_music_url?: string | null;
};

export function useMyArtists() {
  const [artists, setArtists] = useState<ArtistRow[]>([]);
  const reload = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase.from("artists" as any).select("*").eq("owner_id", u.user.id).order("is_primary", { ascending: false }).order("name");
    setArtists(((data as unknown) as ArtistRow[]) ?? []);
  };
  useEffect(() => { reload(); }, []);
  return { artists, reload };
}

export function ArtistMultiSelect({
  value, onChange, placeholder = "Select artists…",
}: { value: string[]; onChange: (ids: string[]) => void; placeholder?: string }) {
  const { artists, reload } = useMyArtists();
  const [addOpen, setAddOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const selected = artists.filter(a => value.includes(a.id));

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-between font-normal">
          <span className="truncate text-left">
            {selected.length === 0 ? <span className="text-muted-foreground">{placeholder}</span>
              : selected.map(a => a.name).join(", ")}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="max-h-64 overflow-auto py-1">
          {artists.length === 0 && (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No artists yet.
            </div>
          )}
          {artists.map(a => (
            <button key={a.id} type="button" onClick={() => toggle(a.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted/40 text-left">
              <Checkbox checked={value.includes(a.id)} onCheckedChange={() => toggle(a.id)} />
              <span className="flex-1 truncate">{a.name}</span>
              {a.is_primary && <span className="text-[10px] uppercase text-muted-foreground">Primary</span>}
            </button>
          ))}
        </div>
        <div className="border-t border-border p-2">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex w-full items-center gap-2 px-2 py-1.5 text-xs text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add new artist
          </button>
        </div>
      </PopoverContent>
      <ArtistFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initial={{ name: "", is_primary: artists.length === 0 }}
        onSaved={async (a) => { await reload(); onChange([...value, a.id]); }}
      />
    </Popover>
  );
}
