import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSignature, Download, ExternalLink } from "lucide-react";

type Row = {
  id: string;
  agreement_key: string;
  version: string;
  signed_name: string;
  signature_type: string;
  signed_at: string;
  licensor_hash: string | null;
  licensee_hash: string | null;
  pdf_url: string | null;
};

const TITLES: Record<string, string> = {
  "sx-exclusive-licensing": "Exclusive Licensing and Distribution Agreement",
};

export function SignedAgreementsCard({
  userId,
  title = "Signed agreements",
  emptyText = "You haven’t signed any agreements yet.",
}: {
  userId: string;
  title?: string;
  emptyText?: string;
}) {
  const { data, isLoading } = useQuery({
    enabled: !!userId,
    queryKey: ["signed-agreements", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_agreements" as any)
        .select("id,agreement_key,version,signed_name,signature_type,signed_at,licensor_hash,licensee_hash,pdf_url")
        .eq("user_id", userId)
        .order("signed_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  return (
    <Card className="p-6 space-y-4 bg-card/60">
      <div className="flex items-center gap-2">
        <FileSignature className="h-4 w-4 text-primary" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : !data || data.length === 0 ? (
        <div className="text-sm text-muted-foreground">{emptyText}</div>
      ) : (
        <ul className="divide-y divide-border">
          {data.map((r) => (
            <li key={r.id} className="py-3 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">
                    {TITLES[r.agreement_key] ?? r.agreement_key}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono">v{r.version}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{r.signature_type}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Signed by <span className="text-foreground">{r.signed_name}</span> ·{" "}
                  {new Date(r.signed_at).toLocaleString()}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground space-y-0.5">
                  {r.licensor_hash && (
                    <div>
                      Licensor hash: {r.licensor_hash.slice(0, 22)}…{r.licensor_hash.slice(-6)}
                    </div>
                  )}
                  {r.licensee_hash && (
                    <div>
                      Licensee hash: {r.licensee_hash.slice(0, 22)}…{r.licensee_hash.slice(-6)}
                    </div>
                  )}
                </div>
              </div>
              {r.pdf_url ? (
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" asChild>
                    <a href={r.pdf_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View
                    </a>
                  </Button>
                  <Button size="sm" asChild>
                    <a href={r.pdf_url} download>
                      <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
                    </a>
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">PDF unavailable</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
