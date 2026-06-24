# Admin overhaul & artist dashboard upgrade

## 1. Database migration

New enum value + tables (single migration):

- `ALTER TYPE app_role ADD VALUE 'sx_manager'`.
- `analytics_uploads` — id, uploaded_by, filename, period_label, row_count, status, created_at. RLS: admin/sx_manager full; artists/labels SELECT rows scoped through analytics_rows.
- Extend `analytics_rows` with columns from the user's header list (username, sale_type, censor_catalogue_number, recording_title, artists, isrc, licensee_catalogue_number, source, period_begins, period_ends, country, right_type_group, use_type, outlet, collection_share, quantity, licensor_revenue, source_currency, licensor_currency, conversion_rate, release_title, release_ean, commercial_model, product, upload_id FK). Keep existing streams/revenue for back-compat.
- `release_deliveries` — id, release_id, delivered_at, authorized_by (uuid → profiles), dsp_status jsonb (per-DSP `sent|rejected` + note), notes, excel_path. RLS: admin/sx_manager write; release owner read.
- `releases`: add `delivered_at timestamptz`, `delivery_note text`. Status enum already supports `delivered`/`takedown_requested`/`taken_down` — confirm and extend if missing.
- `profiles`: nothing new (payout fields already exist).
- Update `has_role` use sites; add helper `is_staff(uuid)` returning `has_role(_, 'administrator') OR has_role(_, 'sx_manager')`.
- RLS additions:
  - `profiles`: admin can UPDATE role/delete; sx_manager can UPDATE status (approve/reject) but NOT delete.
  - `releases`: staff can UPDATE status; only admin can DELETE.
  - `support_tickets/messages`: sx_manager same as admin (respond/resolve).
  - `user_roles`: admin manages all; sx_manager read-only.
- GRANTs for all new tables to authenticated + service_role.

## 2. Roles & access plumbing

- `src/hooks/use-current-user.ts`: add `sx_manager` to `AppRole` union and primaryRole resolution (admin > sx_manager > manager > viewer > artist).
- `src/components/dashboard/app-sidebar.tsx`:
  - **Administrator nav** trimmed to: Dashboard, Releases (Approval/Delivery), Users, Accounting, Approval queue (kept as alias inside Releases tabs), Tickets, Platform settings, Settings. Remove: New release, Catalog, Analytics, Royalties, Reports, Tools, Support.
  - **SX Manager nav** = admin nav minus Platform settings, minus user-delete UI.
  - Footer: add `Terms` + `Privacy` links (new routes `/legal/terms`, `/legal/privacy` — simple static pages).

## 3. Admin Releases page (`/releases`)

Replace current admin releases.index.tsx with a tabbed page:

- **Tab "Approval queue"** — pending submissions table (title links to `/releases/$id`), Approve / Reject / Mark draft / Takedown buttons. Same data as existing approval-queue.tsx, reused via shared component.
- **Tab "Delivery"** — table of `status='live'` (approved) releases not yet delivered. Each row: per-DSP send checklist (Spotify, Apple Music, YouTube Music, Amazon, Deezer, JioSaavn, etc. — list from `src/lib/release-options.ts`), per-DSP status select (sent/rejected) + note field, "Download Excel" button generating the metadata template in attached format (121 cols from Sheet1), and "Mark delivered" button → writes `release_deliveries` row, stamps `releases.delivered_at`, sets `status='delivered'`, records authorized_by = current user.
- **Tab "Delivered"** — history with timeline (delivered_at, authorized_by username, DSP statuses, notes).
- **Tab "Takedowns"** — current takedown_requested queue.
- Excel generation client-side via `xlsx` (already used pattern: openpyxl-style) — add `bun add xlsx` and a helper `src/lib/release-metadata-export.ts` that maps release+tracks to the 121-column header row.

## 4. Accounting (admin/sx_manager)

New route `/_authenticated/accounting.tsx`:

- Upload card: file input (.xlsx/.csv), period label input, "Download template" button (writes header row from the user's spec).
- Parser reads file in browser with `xlsx`, validates headers, batch-inserts into `analytics_rows` with `upload_id` + maps `username` → `owner_id` via profiles lookup.
- Realtime table below: lists `analytics_uploads` rows (uploader, period, row count, status, created_at) via supabase realtime channel.
- Artists/labels see corresponding data on their existing `/analytics` page (already reads analytics_rows) — no UI change required there besides surfacing new columns optionally.

## 5. Admin Dashboard (`/dashboard`)

Branch by role:

- If `administrator|sx_manager`: render `<AdminOverview />` — KPI cards (total users, pending approvals, releases pending review, releases delivered last 30d, revenue uploaded last period, open tickets), charts (uploads per month, deliveries per month), recent activity list (uses `activity_logs`).
- Else: existing artist dashboard.

## 6. Artist/Label dashboard upgrade

Extend artist branch with extra cards:

- **Music distribution** (primary CTA).
- **Video distribution — coming soon** (disabled card).
- **Charts (last 30 days delivered)** — animated card listing public delivered releases (title, artist, release date, smartlink button → `/l/$slug`). Server fn using publishable client + narrow SELECT policy on releases where `status='delivered' AND delivered_at > now()-30d`.
- **Social promotion** card.
- **Collaboration card** with mailto `mca@soundxpand.com`.
- **Inspiration quote** cards (static rotation).

## 7. `/users` (admin) enhancements

- `/users/index.tsx`: add "Change role" dropdown (admin only), "Delete user" button (admin only — calls protected server fn invoking `supabase.auth.admin.deleteUser` via `supabaseAdmin`), "Add user" dialog (admin only — creates auth user via admin API).
- `/users/$username.tsx`:
  - Show payout method + details card (admin/sx_manager view-only).
  - Show role + (admin) inline role editor.
  - Already shows releases + artists; add support tickets list.

## 8. Settings cleanup for staff

In `settings.tsx`, hide for `administrator|sx_manager`: Label details, Artists management, Payment & withdrawal preference. Keep: profile basics, password, theme.

## 9. Support tickets

`/admin/tickets`: grant sx_manager same access (RLS handles it). Already links to `/users/$username`.

## 10. Server functions (new, under `src/lib/`)

- `admin-users.functions.ts`: `deleteUserFn`, `createUserFn`, `setUserRoleFn` — all `requireSupabaseAuth` + role check (admin only for delete/role; sx_manager allowed for status only).
- `delivery.functions.ts`: `markDeliveredFn`, `updateDspStatusFn`.
- `accounting.functions.ts`: `recordUploadFn` (creates analytics_uploads row), `ingestAnalyticsRowsFn` (batch insert with username→owner_id resolution).

## 11. Footer legal links

Create `src/routes/legal.terms.tsx` and `src/routes/legal.privacy.tsx` with placeholder copy (public routes, own head() meta).

## Out of scope

- Real email sending for collaboration card (mailto only).
- Actual DSP API integration; delivery status is manual entry per row.
- Migration of existing analytics_rows data — new optional columns nullable.

## Open question

Excel parsing in the browser uses the `xlsx` (SheetJS) package (~400KB). Confirm OK to add, or prefer server-side parse via a server function?
