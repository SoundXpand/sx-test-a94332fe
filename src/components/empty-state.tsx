import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-border bg-card/30">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 grid place-items-center mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>
      {actionLabel && (actionTo || onAction) && (
        <div className="mt-5">
          {actionTo ? (
            <Button asChild><Link to={actionTo}>{actionLabel}</Link></Button>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      )}
    </div>
  );
}
