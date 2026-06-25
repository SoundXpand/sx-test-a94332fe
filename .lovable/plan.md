## Scope

Five connected changes: (1) Admin Page Builder, (2) fix Smartlink visibility/access for delivered releases, (3) admin per-DSP status editor on the Delivered tab, (4) DSP delivery log visible to admin + owning artist, (5) wire it all into the existing releases/catalog UI.

---

## 1. Admin Page Builder (`/admin/pages`)

New DB tables (migration):
- `cms_pages` — `slug` (unique), `title`, `status` ('draft'|'published'), `seo_title`, `seo_description`, `og_image_path`, `published_at`, `created_by`.
- `cms_page_blocks` — `page_id` (FK), `position` (int), `type` ('hero'|'rich_text'|'image'|'cta'|'features'|'embed'), `data` (jsonb).

Both: RLS = staff full access; `anon`/`authenticated` SELECT only where `status='published'`. GRANTs per template rules.

UI:
- `/admin/pages` — table of pages (title, slug, status, updated_at, view/edit/delete actions). "New page" button.
- `/admin/pages/$id` — editor with:
  - SEO panel (title, description, OG image upload, slug, status toggle).
  - Block list with drag-reorder (dnd-kit, already present via shadcn), add-block menu, inline editor per block type, delete block.
  - Save + Publish buttons; "View live" opens `/p/{slug}` in new tab.
- Public route `/p/$slug` — SSR loader fetches published page via public server fn, renders blocks, full SEO head() with OG tags.

Sidebar entry under admin section: "Pages".

---

## 2. Smartlink visibility & access fix

Issue: smartlink button only shows when `row.status === 'live'`, but delivered releases use status `delivered` (or similar). Also `/l/$slug` may 404 for non-live.

Fix:
- `release-row-actions.tsx`: show smartlink button + menu items whenever `row.slug` exists AND `status ∈ {live, delivered, taken_down(read-only)}`. (Confirm exact status values via a quick query at build time.)
- `catalog.tsx` + `releases.index.tsx`: same condition for any inline smartlink column.
- `l.$slug.tsx` loader: allow any release with a slug that is not `draft`/`pending`/`rejected` — currently likely gated to `live` only.

---

## 3. Admin per-DSP status editor on Delivered tab

Current state: `releases.$id.tsx` "Delivery prefs" tab shows a read-only per-DSP grid for staff.

Add:
- New "DSP delivery" tab (staff-only) on delivered releases.
- Table rows = DSPs from `dsp_deliveries` for this release. Editable columns: status (pending/sent/live/rejected/takedown), DSP URL, note. Save per row → updates `dsp_deliveries` + writes `release_events` audit row.
- Reuse existing status enum + components from the artist delivery view for consistency.

---

## 4. DSP delivery log (admin + owning artist)

On `releases.$id.tsx`, add "Delivery log" tab visible to staff AND release owner:
- Query `dsp_deliveries` joined with DSP metadata: shows each DSP, current status, last updated, note, link.
- Below: timeline from `release_events` filtered to delivery-related types (`dsp_sent`, `dsp_live`, `dsp_rejected`, `status_*`), newest first, with actor name + timestamp.
- Artist sees same data read-only; admin sees inline edit (from #3).

---

## 5. Wiring

- Add migration creating `cms_pages`, `cms_page_blocks` with RLS + GRANTs.
- Add migration ensuring `dsp_deliveries` has `note`, `dsp_url`, `updated_at`, and an `updated_by` column if missing (verify first via read query — skip if present).
- Add public server fn `getPublishedPage(slug)` using server publishable client.
- Add staff server fn `updateDspDelivery({ id, status, note, url })` with `requireSupabaseAuth` + `is_staff` check; writes `release_events`.
- Sidebar: add "Pages" link under admin group in `app-sidebar.tsx`.

---

## Out of scope (call out)

- No public Page Builder theming options beyond the listed block types this round.
- No bulk DSP status update; per-row only.
- No notification fan-out when admin changes DSP status (can follow up).

## Technical notes

- Block editor uses existing shadcn primitives; reorder via `@dnd-kit/sortable` (add if missing).
- Public `/p/$slug` loader pattern mirrors `/l/$slug` SSR setup already in place.
- Status value for delivered releases will be confirmed against `releases.status` distinct values before changing the smartlink gate to avoid showing for wrong states.
