# SoundXpand v2 — Build Plan

Phase 1 (landing) is already done. This plan covers everything else.

## Stack reality (important)

The spec lists Next.js 15 + Express + Prisma + AWS S3. This project is **TanStack Start + React 19 + Tailwind v4 + Lovable Cloud (Supabase)**. We will not switch stacks — that would throw away everything working. The mapping:

- Next.js → TanStack Start (already in place, equivalent SSR)
- Express + Prisma + Postgres → Lovable Cloud (Supabase Postgres + RLS + auto-generated REST)
- JWT/refresh tokens → Supabase Auth (handles both)
- AWS S3 → Supabase Storage (S3-compatible, signed URLs, same model)
- Email verification → Supabase Auth built-in

If you specifically need AWS S3 or a separate Express backend, tell me and I'll add it — otherwise Cloud is the right call and ships faster.

## Phase 2 — Foundation reset + Auth + Roles + Approval

1. Wipe AssetWise: delete `routes/{ai-chat,employees,settings,reset-password,assets.*,index}.tsx`, components `app-layout`, `asset-*`, `assets-list-view`, `dashboard-view`, `employees-list-view`, `settings-view`, `landing-demo-dashboard`, `login-page`, `ai-chat` edge function, `csv-utils`, hooks/types tied to assets.
2. Drop AssetWise tables (`assets`, `asset_assignments`, `asset_categories`, `employees`). Keep `user_roles` + `has_role` (extend enum).
3. New migration:
   - `app_role` enum → `artist | manager | viewer | administrator` (+ keep `user` for back-compat or drop).
   - `account_status` enum → `pending_email | pending_approval | approved | rejected | suspended`.
   - `profiles` (user_id PK→auth.users, full_name, artist_name, username `SX###` unique, mobile unique, country, status, rejection_reason, approved_by, approved_at).
   - Sequence + trigger to mint `SX001, SX002…` on profile insert.
   - `handle_new_user` trigger inserts profile (status `pending_approval` after email verify) + assigns default `artist` role.
   - RLS: users read/update own profile; admins read/update all (via `has_role`).
   - `activity_logs`, `support_tickets`, `support_messages`, `notify_waitlist` (for "Coming Soon" tools).
4. Routes:
   - Public: `/`, `/auth/login`, `/auth/register`, `/auth/forgot`, `/auth/reset-password`, `/auth/verify`, `/auth/pending`, `/auth/rejected`.
   - `_authenticated/route.tsx` (integration-managed) gates the dashboard. Add an inner guard component that checks `profile.status === 'approved'` and otherwise redirects to `/auth/pending` or `/auth/rejected`.
   - Admin-only: `_authenticated/_admin/route.tsx` gate via `has_role('administrator')`.
5. Configure Supabase auth (email confirm ON, signups ON, HIBP ON) + Google OAuth via `lovable.auth`.
6. Auth pages: split-screen dark UI, back/home buttons, Zod validation, success/error toasts, uniqueness checks for username/email/mobile.

## Phase 3 — Dashboard shell + Catalog + Upload Wizard

Sidebar nav: Dashboard, Catalog, New Release, Analytics, Royalties, Users (admin), Reports (admin), Tools, Settings, Support, Logout.

Tables:
- `releases` (title, version, type, primary_genre, secondary_genre, language, release_date, original_release_date, copyright_year, label, upc, catalog_number, parental_advisory, artwork_path, status `draft|pending|approved|rejected|live|archived`, store_selection jsonb, owner_id, rejection_reason).
- `release_tracks` (release_id, track_number, title, version, language, explicit, isrc, composer, lyricist, producer, featured_artist, contributors, publishing_info, copyright_owner, audio_path, duration_seconds, file_size_bytes).
- `release_drafts` (autosave wizard state jsonb).
- Storage buckets `artwork` (public read) + `audio` (private, signed URLs).
- RLS: owner full CRUD on own releases; manager can act on assigned artists (later); admin all.

Wizard `routes/_authenticated/releases.new.tsx`: 6 steps (Release Details → Artwork → Tracks → Audio → Stores → Review). Client-side artwork validation (3000×3000 RGB, ≤10MB), audio metadata extraction (web-audio-api decodeAudioData for duration; basic MP3 bitrate check), drag-drop + progress bars, waveform via `wavesurfer.js`, autosave to `release_drafts` every 10s.

AI artwork generator: server fn → AI Gateway `openai/gpt-image-2` streaming, saves to `artwork` bucket. Gradient artwork generator: client-side canvas → 3000×3000 PNG.

Catalog: TanStack Table with search/filter/sort/status tabs, row actions (edit/duplicate/archive), bulk select.

## Phase 4 — Analytics, Royalties, Users, Reports, Tools, Support, Settings

- `analytics_rows` (release_id, track_id, platform, country, date, streams, revenue). Admin CSV/Excel upload via `papaparse` + `xlsx`, server fn bulk insert. Charts via Recharts (already a dep).
- `royalty_statements` (period, artist_id, total, breakdown jsonb, pdf_path). PDF via `@react-pdf/renderer`, Excel via `xlsx`.
- Users page (admin): approve/reject/suspend, role assignment via `user_roles`, activity log table.
- Reports: filterable reads + PDF/Excel/CSV export.
- Tools: 3 "Coming Soon" cards with notify-me form writing to `notify_waitlist`.
- Support: tickets + threaded messages, FAQ accordion, knowledge base markdown pages, contact form.
- Settings: profile edit, password change, 2FA enroll (supabase.auth.mfa), notification prefs (`profiles.notification_prefs jsonb`), theme toggle (already wired).

## Phase 5 — Polish

Framer Motion page transitions, skeleton loaders, empty states, full mobile responsiveness, light-mode QA on every surface, SEO `head()` per public route, security scan + lint pass.

## Technical notes

- All colors via CSS tokens already set in Phase 1 — no hardcoded hex in components.
- Server fns under `src/lib/*.functions.ts` with `requireSupabaseAuth`; admin ops verify role inside handler then `await import('@/integrations/supabase/client.server')`.
- No Edge Functions for app-internal logic.
- Demo accounts seeded via migration (1 admin, 1 approved artist, 1 pending).
- New deps: `wavesurfer.js`, `papaparse`, `xlsx`, `@react-pdf/renderer`, `react-dropzone`, `zod` (already), `@tanstack/react-table`.

## Open questions before I start

1. **Stack swap?** Confirm sticking with TanStack Start + Lovable Cloud (recommended), or you really want Next.js + Express + Prisma + AWS S3 (full rewrite, much longer).
2. **Phase size:** ship Phase 2 first and review before 3–5, or fire all phases in sequence without checkpoints?
