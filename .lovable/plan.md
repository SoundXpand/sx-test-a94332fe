## 1. Fix `/users/SX003` not rendering

`src/routes/_authenticated/users.tsx` is the listing page but has a sibling `users.$username.tsx`, which turns it into a parent layout. Without `<Outlet />` the detail route matches but nothing renders.

- Rename `src/routes/_authenticated/users.tsx` → `users.index.tsx` (keeps URL `/users`, same code).
- Create a new pathless layout `src/routes/_authenticated/users.route.tsx` (or `users.tsx` containing just `() => <Outlet />`) so `/users/$username` mounts.

## 2. New Release wizard — Release details (Step 1)

Restructure the first step. Final field order:

```
Release title *        |  Version (beside title)
Release type *         |  Catalog number * (auto: SXM0001, unique)
Select artists *       |  Label name * (from profile.label_name, editable; sub-labels dropdown)
Primary genre *        |  Sub genre        ← dropdown from GENRES (spec list)
Language *             |  ← dropdown from LANGUAGES (spec list)
Original release date *(req if UPC set)  |  UPC / Barcode (placeholder "8888888888")
P Year * | P Name *    |  C Year | C Name *
Parental advisory toggle
```

Removed from step 1: Description (deleted entirely), Copyright info, Producer info, separate Release date (moves to Distribution remains), the old "Select artists" that lived on Distribution moves here.

Rules:
- Catalog number auto-generates `SXM####` on mount when blank; check `releases.catalog_number` uniqueness on submit, regenerate if collision.
- ISRC field on tracks gets placeholder `e.g. USRC17607839`; UPC placeholder `8888888888`.
- Label name input is pre-filled from `profiles.label_name`; "Sub label" dropdown lists user's saved sub-labels (see §5).
- Genre + Sub genre + Language: replace text Inputs with `Select` populated from full spec lists, stored in `src/lib/release-options.ts` (LANGUAGES, GENRES, P_YEARS 1950–2027).
- `original_release_date` becomes required client-side when `upc` is non-empty.
- `release.role_type` shown as read-only badge taken from `profiles.role_type` (Artist/Label/Songwriter/Publisher).

## 3. Distribution (Step 5)

- Remove the "Select artists *" field (moved to Step 1).
- Keep Release date, stores, territory, pricing as-is.

## 4. Tracks (Step 3)

- Add a toggle near the Duplicate button: **"Single track release?"** — when ON: hide Add track / Duplicate buttons, force `tracks.length === 1`, and force `release.release_type = "single"`.
- When `release.release_type === "single"`: lock `tracks.length` to 1, hide Add/Duplicate, and prefill Track 1's `title`, `version`, `artist_ids`, `language`, `primary_genre` from the release-level values whenever those fields are still blank.
- Add **Version** input beside Title on each track (already exists — just re-layout).
- Track language + (new) Track genre: same `Select` dropdowns as release.
- ISRC placeholder added.

## 5. Settings — Label details enhancements

Extend the Label details card in `src/routes/_authenticated/settings.tsx`:

- `label_name` input (existing).
- New: **Sub labels** — list + "Add sub-label" inline editor. Stored as `profiles.sub_labels text[]` (new column).
- Surface this list in the wizard's "Sub label" dropdown.

## 6. Database migration

Single migration:

```sql
ALTER TABLE public.profiles    ADD COLUMN IF NOT EXISTS sub_labels text[] DEFAULT '{}';
ALTER TABLE public.releases    ADD COLUMN IF NOT EXISTS sub_label text;
ALTER TABLE public.releases    ADD COLUMN IF NOT EXISTS p_year int;
ALTER TABLE public.releases    ADD COLUMN IF NOT EXISTS p_name text;
ALTER TABLE public.releases    ADD COLUMN IF NOT EXISTS c_year int;
ALTER TABLE public.releases    ADD COLUMN IF NOT EXISTS c_name text;
ALTER TABLE public.release_tracks ADD COLUMN IF NOT EXISTS primary_genre text;
CREATE UNIQUE INDEX IF NOT EXISTS releases_catalog_number_key
  ON public.releases (catalog_number) WHERE catalog_number IS NOT NULL;
```

No new tables → no new GRANTs needed.

## 7. Submit payload

- Include `p_year`, `p_name`, `c_year`, `c_name`, `sub_label` in release insert/update.
- Per-track insert: include `primary_genre`.
- Drop `description`, `producer_info`, `copyright_info` from the form state and payload.

## 8. New constants file

`src/lib/release-options.ts` — exports `LANGUAGES`, `GENRES`, `P_YEARS` from the lists in the user message; imported by Step 1, Step 3, and the existing release detail/edit views.

## Out of scope

- Backfilling existing releases with new copyright fields.
- Reworking the Artwork, Audio, or Review steps.
- Admin-side changes (admin already sees these fields through the existing detail view once columns exist).
