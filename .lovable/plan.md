# Catalog actions, analytics charts, smartlinks, DSP lookup

Builds out the release lifecycle (takedown, edit-and-resubmit, delete drafts), finishes the Catalog row actions, ships a public smartlink page, charts the analytics view, and adds a DSP search panel that queries Spotify, YouTube, and Deezer by UPC or artist+title.

## 1. Release lifecycle + schema

Migration:
- `releases.status` enum widened to: `draft, pending, approved, live, rejected, takedown_requested, taken_down`.
- New columns on `releases`: `slug text unique`, `rejection_reason text`, `taken_down_at timestamptz`, `published_url text`.
- New table `release_links (release_id, platform, url, external_id)` — stores Spotify/YouTube/Deezer links discovered via DSP lookup or pasted by admin. GRANTs + RLS (owner read/write, admin all, anon select by `release_id` joined to `live` releases through the smartlink RPC).
- `release_drafts`: add `source_release_id uuid null` so editing an existing release creates an edit-draft tied back to the original; on submit the original gets overwritten and re-set to `pending`.
- Trigger: when `releases.status` becomes `live` and `slug is null`, generate a 6-char base36 slug.

## 2. Catalog row actions

`/catalog` and `/_authenticated/releases` (admin) — replace plain rows with an actions dropdown per row:
- **Draft** → Resume edit, Delete draft (hard delete), Duplicate.
- **Pending** → View, Withdraw (back to draft).
- **Live** → View, Copy smartlink, Open smartlink (new tab), Request takedown.
- **Rejected** → View reason, Edit & resubmit (opens wizard with prefilled data).
- **Takedown requested** → View (admin sees approve/reject in approval queue).
- **Taken down** → View, Restore request (re-submits as pending).

Smartlink button: copies `https://<host>/l/<slug>` and shows a toast. Disabled until status=live.

## 3. Approval queue (admin)

`/approval-queue` already exists — extend it with two tabs: **New submissions** (status=pending) and **Takedown requests** (status=takedown_requested). Approve/Reject on each, with a reason textarea on reject. Approve on a takedown sets status=taken_down + `taken_down_at=now()`.

## 4. Edit & resubmit flow

`/releases/new` accepts `?edit=<releaseId>`:
- Loads the release + tracks, copies them into a new `release_drafts` row with `source_release_id` set, and runs the wizard.
- Step 6 Submit: when `source_release_id` is set, updates the original release + tracks (replacing all tracks) and sets status back to `pending`, clears `rejection_reason`. Otherwise inserts new.

## 5. Public smartlink page

New public route `src/routes/l.$slug.tsx` (SSR on, no auth gate):
- Loader calls a public server fn that uses the publishable Supabase client + a `TO anon` SELECT policy on a `public_releases` view (slug, title, artist, artwork_path, release_date) joined with `release_links` filtered to `live` releases only.
- Renders artwork hero, title, artist, release date, and a stacked list of DSP buttons (Spotify, Apple, YouTube, Deezer, etc.) from `release_links`. Each button is `target=_blank rel=noopener`.
- `head()` sets title/description/og:image from artwork; this is the shareable card.
- Bottom: subtle "Powered by SoundXpand" with link to `/`.
- Settings slot in `/platform-settings` for future provider swap (Feature.fm/Linkfire) — store provider + token in `platform_settings.smartlink` jsonb.

Wizard step 6: after successful submit, shows the smartlink + "Copy" + QR (use `qrcode` npm) once the admin approves to live.

## 6. Analytics charts

`/analytics` — replace the single bar list with a real dashboard using `recharts` (already common in shadcn). Sections:
- KPI strip: total streams, total revenue, active releases, top platform.
- Line chart: streams over time (group analytics_rows by `period` month).
- Stacked bar: streams by platform per month.
- Donut: revenue share by platform.
- Table: top tracks (release_tracks joined to analytics_rows, sortable, top 10).
- Filters: date range (last 30d / 90d / 12m / all), release dropdown, platform multi-select.
Skeletons during load; reuse `<EmptyState />` when no data.

## 7. DSP lookup (Spotify, YouTube, Deezer)

New page `/_authenticated/tools/dsp-lookup` (also embedded as a panel in release detail):
- Inputs: UPC (preferred), or artist + title.
- "Search" calls a server fn that fans out to:
  - **Spotify**: `client_credentials` token, then `/v1/search?q=upc:<UPC>&type=album` or `q=artist:.. track:..&type=track`. Needs `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET` — request via `add_secret`.
  - **YouTube Data API v3**: `/youtube/v3/search?q=<title artist>&type=video`. Needs `YOUTUBE_API_KEY` — request via `add_secret`. No UPC support — fall back to artist+title.
  - **Deezer**: keyless `https://api.deezer.com/album/upc:<UPC>` or `/search?q=...`. No secret.
- Returns normalized `{ platform, title, artist, url, externalId, artwork }`. UI shows a card grid; admin can click "Attach to release" → writes into `release_links`.
- Cache hits in a `dsp_lookup_cache (query_hash, platform, payload, fetched_at)` table for 24h to avoid quota burn.

## 8. Sample data

Seed `release_links` for the demo "Lost Trails" release so the public smartlink page has buttons immediately. Seed analytics across 6 months so charts have shape.

## Out of scope this turn

Feature.fm/Linkfire API integration (UI slot only), Apple Music API (iTunes Search keyless is fine as a stretch but not promised), DSP delivery automation, real payout processing.

## Secrets to request after plan approval

- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` (Spotify Developer Dashboard → Create app → Client credentials).
- `YOUTUBE_API_KEY` (Google Cloud Console → APIs & Services → Credentials → API key with YouTube Data API v3 enabled).

Deezer needs no key.

## Technical notes

- New deps: `recharts`, `qrcode`.
- New tables: `release_links`, `dsp_lookup_cache`. View: `public_releases`. Trigger: slug generator.
- New routes: `src/routes/l.$slug.tsx` (public), `src/routes/_authenticated/tools/dsp-lookup.tsx`.
- New server fns: `lookup-dsp.functions.ts` (auth-required, fans out + caches), `public-smartlink.functions.ts` (public, publishable key), release lifecycle fns (`takedown-request`, `withdraw`, `delete-draft`, `start-edit`, `approve`, `reject`, `approve-takedown`).
- Wizard reads `?edit=` and `?draft=` search params; submit branches on `source_release_id`.
