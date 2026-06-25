import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Edit, Copy, ExternalLink, Trash2, Send, ArrowDownToLine, RotateCcw, Eye, Link2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isReleaseLive } from "@/lib/release-status";

export type Release = {
  id: string;
  title: string;
  status: string;
  slug?: string | null;
  rejection_reason?: string | null;
};

export function ReleaseRowActions({ row, onChanged, admin = false }: { row: Release; onChanged: () => void; admin?: boolean }) {
  const navigate = useNavigate();
  const [reasonOpen, setReasonOpen] = useState(false);

  const host = typeof window !== "undefined" ? window.location.origin : "";
  const smartlink = row.slug ? `${host}/l/${row.slug}` : null;

  const copySmartlink = async () => {
    if (!smartlink) return;
    await navigator.clipboard.writeText(smartlink);
    toast.success("Smartlink copied", { description: smartlink });
  };

  const updateStatus = async (status: string, extra: Record<string, any> = {}) => {
    const { error } = await supabase.from("releases").update({ status, ...extra }).eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(`Status updated → ${status.replace(/_/g, " ")}`);
    onChanged();
  };

  const deleteDraft = async () => {
    if (!confirm("Delete this draft permanently?")) return;
    const { error } = await supabase.from("releases").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Draft deleted");
    onChanged();
  };

  return (
    <>
      <div className="flex items-center gap-1.5 justify-end">
        {isReleaseLive(row.status) && smartlink && (
          <Button size="sm" variant="outline" onClick={copySmartlink} title={smartlink}>
            <Link2 className="h-3.5 w-3.5 mr-1" />Smartlink
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate({ to: "/releases/$id", params: { id: row.id } })}>
              <Eye className="h-4 w-4 mr-2" />View details
            </DropdownMenuItem>
            {smartlink && (
              <>
                <DropdownMenuItem onClick={copySmartlink}><Copy className="h-4 w-4 mr-2" />Copy smartlink</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={smartlink} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 mr-2" />Open smartlink</a>
                </DropdownMenuItem>
              </>
            )}
            {admin ? (
              <>
                <DropdownMenuSeparator />
                {row.status === "taken_down" ? (
                  <DropdownMenuItem onClick={() => updateStatus("live")}>
                    <RotateCcw className="h-4 w-4 mr-2" />Restore live
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => updateStatus("taken_down")} className="text-destructive">
                    <ArrowDownToLine className="h-4 w-4 mr-2" />Takedown
                  </DropdownMenuItem>
                )}
              </>
            ) : (
              <>
                <DropdownMenuSeparator />
                {row.status === "draft" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate({ to: "/releases/new", search: { draft: row.id } as any })}>
                      <Edit className="h-4 w-4 mr-2" />Resume edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={deleteDraft} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />Delete draft
                    </DropdownMenuItem>
                  </>
                )}
                {row.status === "pending" && (
                  <DropdownMenuItem onClick={() => updateStatus("draft")}>
                    <ArrowDownToLine className="h-4 w-4 mr-2" />Withdraw to draft
                  </DropdownMenuItem>
                )}
                {isReleaseLive(row.status) && (
                  <DropdownMenuItem onClick={() => updateStatus("takedown_requested")} className="text-destructive">
                    <ArrowDownToLine className="h-4 w-4 mr-2" />Request takedown
                  </DropdownMenuItem>
                )}
                {row.status === "rejected" && (
                  <>
                    <DropdownMenuItem onClick={() => setReasonOpen(true)}><Eye className="h-4 w-4 mr-2" />View reason</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: "/releases/new", search: { edit: row.id } as any })}>
                      <Edit className="h-4 w-4 mr-2" />Edit & resubmit
                    </DropdownMenuItem>
                  </>
                )}
                {row.status === "takedown_requested" && (
                  <DropdownMenuItem disabled><Send className="h-4 w-4 mr-2" />Awaiting admin</DropdownMenuItem>
                )}
                {row.status === "taken_down" && (
                  <DropdownMenuItem onClick={() => updateStatus("pending")}>
                    <RotateCcw className="h-4 w-4 mr-2" />Request restore
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejection reason</DialogTitle>
            <DialogDescription>Why this release was rejected by the reviewer.</DialogDescription>
          </DialogHeader>
          <Textarea readOnly value={row.rejection_reason || "No reason provided."} rows={6} />
          <DialogFooter>
            <Button onClick={() => setReasonOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Back-compat wrapper kept so legacy imports don't break — prefer <ReleaseStatusBadge />.
import { getStatusMeta } from "@/lib/release-status";
export function statusBadgeClass(status: string) {
  return getStatusMeta(status).badgeClass;
}
