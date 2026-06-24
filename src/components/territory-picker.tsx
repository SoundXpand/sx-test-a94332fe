import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CONTINENTS, ALL_COUNTRY_CODES } from "@/lib/territories";

type Props = {
  worldwide: boolean;
  countries: string[];
  onChange: (next: { worldwide: boolean; countries: string[] }) => void;
};

export function TerritoryPicker({ worldwide, countries, onChange }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({ Asia: true });
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return CONTINENTS;
    return CONTINENTS.map(c => ({
      ...c,
      countries: c.countries.filter(x => x.name.toLowerCase().includes(term)),
    })).filter(c => c.countries.length);
  }, [q]);

  const set = (codes: string[]) => onChange({ worldwide: false, countries: Array.from(new Set(codes)) });
  const toggleCountry = (code: string) => set(countries.includes(code) ? countries.filter(c => c !== code) : [...countries, code]);
  const toggleContinent = (codes: string[], on: boolean) => {
    const base = countries.filter(c => !codes.includes(c));
    set(on ? [...base, ...codes] : base);
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Checkbox checked={worldwide} onCheckedChange={v => onChange({ worldwide: !!v, countries: v ? ALL_COUNTRY_CODES : countries })} />
        Worldwide (all territories)
      </label>

      {!worldwide && (
        <>
          <div className="flex gap-2">
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search country…" className="h-8" />
            <Button size="sm" variant="outline" onClick={() => set(ALL_COUNTRY_CODES)}>All</Button>
            <Button size="sm" variant="ghost" onClick={() => set([])}>None</Button>
          </div>
          <div className="rounded-lg border border-border max-h-80 overflow-y-auto divide-y">
            {filtered.map(c => {
              const codes = c.countries.map(x => x.code);
              const selected = codes.filter(x => countries.includes(x));
              const all = selected.length === codes.length;
              const some = selected.length > 0 && !all;
              const isOpen = open[c.name] ?? false;
              return (
                <div key={c.name} className="text-sm">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/40">
                    <button onClick={() => setOpen({ ...open, [c.name]: !isOpen })}>
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <Checkbox checked={all} data-state={some ? "indeterminate" : undefined} onCheckedChange={v => toggleContinent(codes, !!v)} />
                    <span className="font-medium flex-1">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{selected.length}/{codes.length}</span>
                  </div>
                  {isOpen && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 p-3">
                      {c.countries.map(co => (
                        <label key={co.code} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox checked={countries.includes(co.code)} onCheckedChange={() => toggleCountry(co.code)} />
                          <span>{co.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
