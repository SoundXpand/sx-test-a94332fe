# Releases, delivery timeline & support

## 1. Release wizard `/releases/new` — completion pass

Refactor the existing 6-step wizard into a **tabbed stepper** (clickable tab strip + Next/Back) with strict per-step validation using `zod`. Tab is locked until prior steps validate.

**Tabs & required fields**
1. **Album details** — title*, primary artist*, release type (single/EP/album), primary genre*, language*, release date* (≥ today + 7d for new), copyright year, label, UPC (13-digit or auto), catalog #, parental advisory toggle, description.
2. **Artwork** — drag-drop upload to `artwork` bucket. Client-side check: JPG/PNG, ≥ 3000×3000, square, ≤ 10 MB. Live preview, replace, AI-generate (existing endpoint).
3. **Tracks** — upload audio files (WAV/FLAC/MP3 320, ≤ 200 MB) to `audio` bucket. **After each file resolves, expand a per-track form**: title*, version, ISRC (auto or manual, validated `^[A-Z]{2}[A-Z0-9]{3}\d{7}$`), explicit toggle, language, featured artist, composer*, lyricist*, producer, copyright owner*, publishing info. Reorderable list, auto track #, duration auto-read.
4. **Distribution** — territory (worldwide / pick countries via multi-select with search), release date confirm, pricing tier, DSP checkboxes (Spotify, Apple Music, Amazon, YouTube Music, Tidal, Deezer, TikTok, Instagram/Facebook, Boomplay, JioSaavn, Wynk, Gaana, Pandora, Anghami — select all/none).
5. **Review & submit** — read-only summary cards (artwork thumb, metadata, tracklist with durations, selected stores, territories), rights confirmation checkbox*, **Submit** → `releases.status='pending'` + seeds one `dsp_deliveries` row per selected store with status `queued`, writes a `release_events` row `submitted`.

Draft autosaves on every change (debounced 800 ms) into `release_drafts.payload`.

## 2. Release detail page `/releases/$id`

New route (also linked from Catalog "View" action). Layout: header (artwork, title, status badge, action buttons) + tabs:
- **Overview** — metadata, smartlink button (if `live`), download artwork.
- **Tracklist** — table of tracks with ISRC, duration, explicit.
- **Delivery** — table of `dsp_deliveries` per platform showing status (`queued | in_delivery | delivered | live | rejected | takedown`), last update, external URL, retry button (admin). Status pills color-coded.
- **Timeline** — vertical timeline from `release_events` (submitted, approved, rejected w/ reason, delivery_started, delivered, live, takedown_requested, taken_down, edited). Each event shows actor, timestamp, optional note.

## 3. DSP delivery + webhooks

New tables (migration):
- `dsp_deliveries` (release_id, platform, status, external_id, external_url, last_event_at, error). RLS: owner read; service_role write.
- `release_events` (release_id, type, actor_id, note, payload jsonb, created_at). RLS: owner read; service_role write; admin write via has_role.
- Trigger on `releases.status` UPDATE → insert matching `release_events` row.

Public webhook route `src/routes/api/public/dsp-webhook/$platform.ts` (POST). Verifies `x-webhook-secret` header against `DSP_WEBHOOK_SECRET` (generated via `generate_secret`), looks up delivery by `external_id` or `(release_id, platform)`, updates status, inserts a `release_events` row. Returns 200/401. Includes an admin "Simulate webhook" button on the Delivery tab that calls the same handler with valid secret for demoing the full lifecycle.

Approval-queue admin actions now also flip `dsp_deliveries.status` to `in_delivery` on approve.

## 4. Support ticket system

Tables already exist (`support_tickets`, `support_messages`). Rebuild `/support` with tabs:
- **My tickets** — table (subject, priority, status, updated). Row click → drawer with full message thread + reply box (writes `support_messages`).
- **New ticket** — form: subject*, category (billing/technical/release/other), priority (low/normal/high), message*, optional release link. Validates with zod, inserts ticket + first message, toast confirms.
- **FAQ** — keep current accordion.

Admin route `/admin/tickets` (gated by `has_role('admin')` via current `_authenticated` layout + in-component check; sidebar item visible only to admins):
- Table of ALL tickets with filters (status, priority, search).
- Open ticket → drawer with thread, status select (open/in_progress/waiting_user/resolved/closed), priority select, internal reply.
- Counter badge in sidebar for `open + in_progress` tickets assigned to admins.

## 5. Admin enhancements for submissions

Extend existing `/approval-queue`:
- Submission row → "Review" opens the new `/releases/$id` page in admin mode (extra actions: Approve, Reject w/ reason, Mark live, Force takedown, Resend to DSPs).
- New "Activity" tab on approval queue showing recent `release_events` system-wide (last 50).
- Sample seed: backfill `dsp_deliveries` + `release_events` rows for the "Lost Trails" demo release across 4 DSPs with realistic timeline.

## Technical details

- **Validation:** single `src/lib/release-schemas.ts` exporting zod schemas per step; wizard uses `safeParse` and surfaces errors inline.
- **Storage:** signed-URL reads in detail page; uploads keep current `artwork`/`audio` buckets.
- **Routes added:** `src/routes/_authenticated/releases.$id.tsx`, `src/routes/_authenticated/admin.tickets.tsx`, `src/routes/api/public/dsp-webhook/$platform.ts`.
- **Server fns added:** `src/lib/releases.functions.ts` (`submitRelease`, `simulateDspEvent`, `adminUpdateDelivery`), `src/lib/support.functions.ts` (`createTicket`, `replyTicket`, `adminUpdateTicket`).
- **Secret:** `DSP_WEBHOOK_SECRET` via `generate_secret`.
- **Sidebar:** add "Admin → Tickets" group (admin-only) and badge counts on Approval queue + Tickets.

## Out of scope

Real DSP delivery API integration (we simulate via the webhook), file ingestion/transcoding, ticket email notifications, ticket attachments.
