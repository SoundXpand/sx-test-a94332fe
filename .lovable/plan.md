# Dashboard UX & Release Workflow Overhaul

Rebuild the SoundXpand dashboard shell and release wizard to match Vercel/Linear/Stripe quality, with role-aware navigation, a full topbar, a 6-step wizard with live preview + AI artwork + waveform, and polished empty states across every page.

## 1. Dashboard shell (sidebar + topbar)

Replace `src/components/dashboard/dashboard-shell.tsx` with a two-part shell.

**Sidebar** (`src/components/dashboard/app-sidebar.tsx`)
- Collapsible: expanded (240px) ↔ icon-only (64px), persisted to `localStorage`, smooth width transition.
- Mobile: slide-in drawer (already partly there) with backdrop.
- Role-aware nav, computed from `user_roles` fetched once into a `useCurrentUser()` hook:
  - **artist**: Dashboard, My Releases, Create Release, Analytics, Royalties, Tools, Support, Settings
  - **manager**: Dashboard, Artists, Catalog, Create Release, Analytics, Royalties, Reports, Tools, Support, Settings
  - **viewer**: Dashboard, Catalog, Analytics, Reports, Tools, Support, Settings
  - **administrator**: Dashboard, Releases, Catalog, Users, Analytics, Royalties, Reports, Approval Queue, Tools, Platform Settings, Support, Settings
- Active highlight via pathname match; notification badge slot (count from `support_tickets` open / approval queue).
- Footer block: `© 2026 SoundXpand`, `v2.0.0`, `Production` chip. **No Logout in sidebar.**

**Topbar** (`src/components/dashboard/topbar.tsx`) — sticky, on every authenticated page
- Left: sidebar toggle, auto-generated breadcrumbs from the current route (`Dashboard / Releases / New release`).
- Center: global search (Cmd+K `<CommandDialog>`) over releases / tracks / artists (profiles) / users / reports — Supabase ilike queries, grouped results, keyboard navigation.
- Right: theme toggle, notifications bell (popover listing recent `activity_logs` + open tickets), quick-actions menu (New release, Invite user [admin], Upload analytics [admin]), user profile badge.
- **Profile badge**: avatar (initials fallback), name, role, `SX###` username; dropdown → Profile, Account settings, Notifications, Help center, **Logout**.

New routes to back the dropdown: `/profile`, `/help` (settings + notifications already exist).

## 2. New role-aware pages

Add routes so sidebar links resolve for every role:
- `/_authenticated/releases.tsx` (admin "Releases" — all releases table)
- `/_authenticated/artists.tsx` (manager — artists list from profiles)
- `/_authenticated/approval-queue.tsx` (admin — pending releases approve/reject)
- `/_authenticated/platform-settings.tsx` (admin — brand, logo, favicon, SMTP, email templates, storage, approval rules, DSP config, announcements, maintenance mode, audit logs from `activity_logs`, system health pings)
- `/_authenticated/profile.tsx`, `/_authenticated/help.tsx`

Gate admin-only routes with a `requireRole(['administrator'])` check in `beforeLoad` reading `user_roles`.

## 3. Release submission wizard

Rebuild `/_authenticated/releases/new` as a polished 6-step wizard with a 2-column layout: **wizard on the left, live preview card on the right** (sticky, updates as fields change — artwork thumb, title, artist, type, store count, status: Draft).

Top progress strip shows `Step N of 6` + step titles, clickable to jump back to completed steps. **Save draft** button persists to a new `release_drafts` table (jsonb wizard state, autosave every 10s + on step change) and a **Resume later** banner on `/catalog` lists drafts.

**Step 1 — Release details:** title, artist name, primary artist, release type (Single/EP/Album), label, genre + sub-genre, language, release date, original release date, UPC, catalog number, parental advisory toggle, copyright info, producer info, description.

**Step 2 — Artwork:** drag-drop uploader, client validation (decode image → assert 3000×3000, RGB via canvas pixel sample, JPG/PNG, ≤10MB). Show resolution, file size, color mode, pass/fail. Zoom-on-hover preview, Replace / Remove buttons.
- **AI Artwork Studio** panel: inputs (artist, album, genre, mood, color theme, style) → call new server route `/api/generate-image` (stream from `openai/gpt-image-2`), generate 4 concepts into a preview grid, click to attach.

**Step 3 — Tracks:** per-track card with title, version, language, explicit, ISRC, duration (auto from audio decode), composer, lyricist, producer, featured artist, copyright owner, publisher. Add / remove / duplicate, drag-and-drop reorder (`@dnd-kit/sortable`).

**Step 4 — Audio validation:** per-track audio upload. Use Web Audio API + `music-metadata-browser` to extract filename, duration, bitrate, channels, sample rate, file size. Pass = MP3 / 320kbps / 44.1kHz / stereo; else show ✕ with reason. `wavesurfer.js` waveform + play/pause preview.

**Step 5 — Distribution:** searchable store grid (Spotify, Apple Music, Amazon, YouTube Music, TikTok, Instagram, Facebook, Deezer, Tidal, Boomplay, JioSaavn, Wynk, Gaana) with Select all / Deselect all; territory selector (Worldwide vs custom country multi-select); pricing tier (Budget / Mid / Premium); rights ownership confirmation checkbox.

**Step 6 — Review & submit:** full summary (artwork, details, tracks, stores, validation), checklist (Metadata / Artwork / Audio / Rights), Submit (insert release + tracks, status `pending`, clears draft), Save draft, Return to edit.

## 4. Sample data & empty states

- Seed migration: insert demo release "Lost Trails" (Sahil Hansda, Album, 10 tracks, status `live`, release_date 2026-06-01) owned by the existing admin, plus `analytics_rows` for Spotify 68k / Apple 31k / YouTube Music 42k / JioSaavn 11k streams summing to 152,430, revenue ₹12,840.
- Dashboard widgets read real aggregates from `releases` + `analytics_rows` for the current user (or all releases for admin).
- Every list page (`catalog`, `releases`, `analytics`, `royalties`, `reports`, `users`, `support`, `approval-queue`) gets an `<EmptyState>` component: lucide icon illustration, headline, subcopy, primary CTA.

## 5. Polish

- Dark + light mode QA on every new component (use semantic tokens only).
- Mobile responsive: sidebar drawer, topbar collapses search into icon, wizard stacks preview below on `<lg`.
- Skeleton loaders on data tables.
- Framer Motion fade/slide for sidebar collapse + wizard step transitions.

## Technical notes

- New deps: `@dnd-kit/core`, `@dnd-kit/sortable`, `wavesurfer.js`, `music-metadata-browser`, `cmdk` (already via shadcn command), `framer-motion` (likely already).
- New table `release_drafts (id, owner_id, payload jsonb, updated_at)` with RLS owner-only; new server route `src/routes/api/generate-image.ts` streaming from Lovable AI Gateway.
- New helper hook `src/hooks/use-current-user.ts` returns `{ user, profile, roles, hasRole }` cached via TanStack Query.
- Topbar breadcrumbs derived from `useRouterState` + a route→label map.
- Global search uses one `Promise.all` of 5 small Supabase `ilike` queries with debounced input.

## Out of scope this turn

Real SMTP send, real DSP API integrations, real payout processing — Platform Settings exposes the UI + persists config to a `platform_settings` jsonb table; wiring to live providers is a later phase.
