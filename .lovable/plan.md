This is a large batch of changes spanning DB, wizard, public pages, admin tools, and notifications. Grouping into clear workstreams. Please confirm before I execute.

## 1. Accounting / analytics_rows

- Migration: rename/align `analytics_rows` columns to match the Accounting Excel template exactly (the 121-col template you uploaded earlier — same headers as `ACCOUNTING_HEADERS`). Add any missing columns; keep existing ones if already present.
- Date parsing in `parseAccountingFile`: accept `YYYY-MM-DD`, `DD/MM/YYYY`, Excel serial numbers, and ISO; normalize to `YYYY-MM-DD` text — no SQL cast errors.
- Owner match: after parse, look up `profiles` by `username` (case-insensitive) and stamp `owner_id`. Rows with no match still ingest but flagged `owner_id = null` with a `unmatched_username` count surfaced in toast.
- Upload history: add row-level **Delete** action that deletes the upload row AND cascades `analytics_rows WHERE upload_id = X` (add FK `ON DELETE CASCADE` in migration). Admin-only.

## 2. Username generation overflow

- Migration: replace `sx_username_seq` logic in `handle_new_user_soundxpand` — after `SX999`, switch to `SX00001`, `SX00002`, … using `LPAD(nextval, 5, '0')` when value > 999. Add unique constraint check.

## 3. User Logbook on `/users/SX003`

- New table `user_activity_log` (id, user_id, kind: 'login'|'action'|..., summary, meta jsonb, created_at). RLS: user reads own; staff reads all.
- Hook into auth state change in `src/integrations/supabase/client.ts` consumer (`use-current-user` or a top-level effect) to record `login` events.
- Add Logbook card to `users.$username.tsx` showing latest 50 entries.

## 4. Topbar search → tabs/pages/settings/support

- Replace the current releases/tracks/profiles search with a static index of routes (Dashboard, Catalog, Releases, Analytics, Royalties, Users, Accounting, Settings sections, Support, Legal). Long queries (>15 chars) also search `support_tickets` subjects.

## 5. Profile + Public artist page

- Update `/profile`: add fields — bio (long text), `is_public` toggle, social links (instagram, youtube, spotify, apple, tiktok, soundcloud, website), display name, role-derived path prefix.
- Add "Copy link" + "Visit" buttons.
- New public route `src/routes/$roleType.$username.tsx` (paths like `/artist/sx003`, `/label/sx003`, `/publisher/sx003`) → cover, bio, socials, discography (live releases), smartlinks.
- Migration: add `is_public boolean`, `bio text`, `social_*` columns (extend existing socials), `display_name` to `profiles`.
- Landing footer: add Cookie, Privacy, Terms, More links (route exists or stub).

## 6. Release wizard `/releases/new`

- **Catalog number**: dynamic mask `SX[A-Z]{1,4}\d{4,10}`; auto-generate next free.
- **ISRC autogen** when UPC empty: pattern `INV2I{YY}{NNNNN}` starting at `00001` for current year, increment from max existing for that year. Show generated value read-only with regenerate button.
- **AI Artwork Studio**: change generation size to 3000×3000 (gen at max 1920 and upscale OR use premium with 1920 then bicubic to 3000 client-side via canvas — note: true 3000 requires upscale; will document limit).
- **Tracks language gating**: if `language ∈ {No human vocals, No linguistic content}` → hide Lyricist + lyrics textarea; else require Composer, Lyricist, Producer. Convert these to tag-style multi-author inputs (chips).
- **Publisher**: dropdown checklist of SoundXpand / SoundXpand PRO / SoundXpand Publishing — all checked by default.
- Remove "Copyright owner" input.
- **Territory**: multi-level checklist tree (Worldwide top, then India, then continents → countries). Use a new `<TerritoryPicker />` component fed by a static dataset.

## 7. Distribution DSP list (step 5)

Replace `DSPS` list with the full ordered list you provided, each with a medium logo (use `lucide` placeholder + `src/assets/dsp/<slug>.png` slots; I'll add transparent placeholder logos generated via `imagegen` only if you want — otherwise text-only with monogram squares for now to keep this change small).

## 8. Sidebar / topbar tweaks

- Remove "Approval queue" from sidebar.
- Admin topbar "+ New release" → `/releases`.
- Dashboard "Review queue" button → `/releases`.

## 9. Realtime notifications

- New table `notifications` (id, user_id nullable for broadcast, kind, title, body, link, created_at, read_at). RLS: user reads own + broadcasts (user_id null).
- Topbar bell: realtime subscription, shows last 6 + "View all" → `/notifications`.
- New admin page `/admin/broadcast` to send promo notifications (insert with user_id null or specific user list).
- Auto-create notifications on: release status change (trigger), ticket reply (trigger).

## 10. Royalties module

- New table `royalty_statements_files` (id, owner_username, owner_id, period, summary, amount, currency, pdf_path, uploaded_by, created_at). Storage bucket `statements` (private).
- Admin `/royalties` upload form (username, period, amount, summary, PDF). Match username→owner_id.
- User `/royalties` lists their own; admin sees all.

## Open questions

1. **DSP logos** — generate real PNG logos for all ~35 platforms (slow + costly), use letter monograms, or leave placeholder slots for you to upload?
2. **AI Artwork 3000×3000** — image models cap at 1920. OK to generate 1920 then upscale to 3000 in-browser (lossy)?
3. **Public profile URL** — confirm `/artist/<username>` etc. is OK (vs `/u/<username>`). Multi-role users: pick primary role for path?
4. Username overflow at SX999→SX00001 (5 digits). Should existing SX001–SX999 remain unchanged? (yes assumed.)

Reply with answers + "go" and I'll execute in roughly the order above.