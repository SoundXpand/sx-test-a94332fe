// Canonical release status definitions used across the UI.
// DB still stores legacy values (`delivered`); we surface a uniform vocabulary.
export type ReleaseStatus =
  | "draft"
  | "pending"
  | "approved"
  | "live"
  | "rejected"
  | "takedown_requested"
  | "taken_down";

export const RELEASE_STATUS_META: Record<string, { label: string; description: string; badgeClass: string }> = {
  draft: {
    label: "Draft",
    description: "Saved by the owner — not yet submitted for moderation.",
    badgeClass: "bg-muted text-muted-foreground",
  },
  pending: {
    label: "Pending",
    description: "Submitted by the user and now pending moderation by the SoundXpand team.",
    badgeClass: "bg-amber-500/15 text-amber-500",
  },
  approved: {
    label: "Approved",
    description: "Cleared by moderation and ready for delivery to DSPs.",
    badgeClass: "bg-blue-500/15 text-blue-500",
  },
  live: {
    label: "Live",
    description: "Delivered to DSPs and available on streaming platforms.",
    badgeClass: "bg-success/15 text-success",
  },
  // `delivered` is folded into `live` everywhere in the UI.
  delivered: {
    label: "Live",
    description: "Delivered to DSPs and available on streaming platforms.",
    badgeClass: "bg-success/15 text-success",
  },
  rejected: {
    label: "Rejected",
    description: "Release was disapproved by moderation. See rejection reason for details.",
    badgeClass: "bg-destructive/15 text-destructive",
  },
  takedown_requested: {
    label: "Takedown requested",
    description: "Takedown requested by the user — pending action by the SoundXpand team.",
    badgeClass: "bg-orange-500/15 text-orange-500",
  },
  taken_down: {
    label: "Taken down",
    description: "Release has been taken down from DSPs.",
    badgeClass: "bg-muted text-muted-foreground",
  },
};

export function getStatusMeta(status: string | null | undefined) {
  if (!status) return RELEASE_STATUS_META.draft;
  return RELEASE_STATUS_META[status] ?? {
    label: status.replace(/_/g, " "),
    description: "",
    badgeClass: "bg-muted text-muted-foreground",
  };
}

// Editable canonical statuses for admin selectors (drops `delivered`).
export const EDITABLE_RELEASE_STATUSES: ReleaseStatus[] = [
  "draft", "pending", "approved", "live", "rejected", "takedown_requested", "taken_down",
];

// Is this release publicly Live (combining legacy `delivered`)?
export function isReleaseLive(status: string | null | undefined) {
  return status === "live" || status === "delivered";
}
