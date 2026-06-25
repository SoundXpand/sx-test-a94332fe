import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getStatusMeta } from "@/lib/release-status";
import { cn } from "@/lib/utils";

export function ReleaseStatusBadge({ status, className }: { status: string | null | undefined; className?: string }) {
  const meta = getStatusMeta(status);
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium cursor-help select-none",
              meta.badgeClass,
              className,
            )}
          >
            {meta.label}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs leading-relaxed">
          <div className="font-semibold mb-0.5">{meta.label}</div>
          <div className="opacity-90">{meta.description}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
