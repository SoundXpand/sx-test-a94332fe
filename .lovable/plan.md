## Scope

Six grouped changes across status semantics, DSP delivery UX, smartlink artwork, public profile route, and brand logo.

---

### 1. Unify release status vocabulary

Canonical statuses + tooltip copy (used everywhere a badge or filter renders):

| Key | Label | Tooltip |
|---|---|---|
| `draft` | Draft | Work-in-progress release. Not yet submitted. |
| `pending` | Pending review | Submitted by user, awaiting moderation. |
| `approved` | Approved | Approved by moderation. Ready for delivery to DSPs. |
| `live` | Live | Delivered and live on DSPs. |
| `rejected` | Rejected | Disapproved by moderation. Edit and resubmit. |
| `takedown_requested` | Takedown requested | User requested removal. Awaiting admin. |
| `taken_down` | Taken down | Removed from DSPs. |

- Add `src/lib/release-status.ts` with `STATUS_META` (label, tooltip, badge classes, dot color). Replace ad-hoc badge maps in `release-row-actions.tsx`, `releases.$id.tsx`, `releases.tsx`, `catalog.tsx`, `approval-queue.tsx`, `admin-overview.tsx`, smartlink page, profile, and dashboards.
- Build a `<StatusBadge status=… />` component that wraps shadcn `Tooltip` with the description.
- Treat `delivered` as `live` for display + filtering (DB enum retained; UI maps `delivered → live`). Tabs: All / Approval queue / Delivery / Live / Takedowns / Archived.
- Add a broadcast/notification trigger: when status flips `pending → approved`, insert a `notifications` row to the owner: "Release '{title}' approved and ready for delivery. Congrats!" (migration: small DB trigger on `releases` AFTER UPDATE).

### 2. DSP delivery editor (replace standalone log)

- Remove the "DSP delivery log" section from `releases.$id.tsx`.
- Inside the **Delivery** tab, render the per-DSP table with columns: Platform · Status · Link · Note · Updated · Actions. Empty state: "No DSPs yet. Add platforms when marking delivered."
- Inline editors: status `Select` (Pending / In review / Live / Rejected / Taken down), URL `Input`, Note `Input`, Save button per row. Reuses existing `updateDspDeliveryFn`. Visible for staff on Delivery + Delivered (live) releases; read-only for owner.
- Mirrors the screenshot pattern from the "Mark delivered" flow.

### 3. Smartlink artwork

- `l.$slug.tsx` currently signs `artwork_path` for 1h. Confirmed the bucket signed-url path is correct; issue is the public view sometimes lacks artwork.
- Fix: when `artwork_path` missing on `public_releases`, fall back to first track's cover or release default; ensure `ArtworkImage` uses the signed URL not the storage path. Add `loading="eager"` on the hero artwork (above the fold) but keep `loading="lazy"` for any below-fold artwork on the page.

### 4. Public profile route `/{roleType}/{username}`

- Current route file `src/routes/$roleType.$username.tsx` already exists. Confirm:
  - `roleType` validated against `artist | band | publisher | songwriter` (currently likely only `artist`).
  - Loader uses a **public** server fn (publishable client, no `requireSupabaseAuth`) so unauthenticated users can view.
  - URL canonicalises to `/{roleType}/{username}/{display-slug}` (display name slugged). If only 2 segments, accept; if user shares 3-segment, route still resolves by username.
- Add `src/routes/$roleType.$username.$displaySlug.tsx` as an alias that loads same data by username and ignores slug (slug for SEO only).
- Ensure RLS: `public_profiles` view already exposes read to anon for `public_profile=true`; verify.

### 5. Brand logo (light + dark)

- Add uploaded SVGs to `src/assets/`:
  - `sx-logo-white.svg` → for dark backgrounds
  - `sx-logo-dark.svg` → for light backgrounds
- Build `<BrandLogo />` component that picks the variant from `useTheme()` (or CSS `dark:` swap via two `<img>` tags). Renders SVG only, no text, no music icon.
- Replace logo usage in: `app-sidebar.tsx`, `topbar.tsx`, `landing-nav.tsx`, `landing-footer.tsx`, smartlink `l.$slug.tsx` header, `p.$slug.tsx` header, `auth.tsx`, `pending.tsx`. Remove the `<Music />` + "SoundXpand" wordmark pairs.

---

## Technical details

- Migration: trigger `notify_owner_on_approved()` on `public.releases` AFTER UPDATE OF status WHEN old=pending and new=approved → insert into `public.notifications` (kind='release_approved', release_id, user_id=owner).
- No enum changes. `delivered` value stays in DB; UI normalises with `displayStatus(s) = s === 'delivered' ? 'live' : s`.
- New file: `src/lib/release-status.ts`, `src/components/catalog/status-badge.tsx`, `src/components/branding/brand-logo.tsx`.
- Edited files: row actions, release detail, releases list, catalog, approval queue, admin overview, smartlink, profile public route, sidebar, topbar, landing nav/footer, auth, pending.
- Public profile loader switches to publishable-key server client (no auth middleware) so unauthenticated visitors can view.

---

## Out of scope

- Renaming the DB enum value `delivered` → `live` (display-only normalisation).
- Page Builder additions.
- New notification delivery channels (in-app only).
