
# SoundXpand — Full Replacement Plan

A complete pivot from AssetWise to **SoundXpand**, a premium music distribution platform. The attached HTML is the visual north star for the landing page (Syne + DM Sans, deep violet/pink/cyan on near-black, noise overlay, glass nav, animated network/stats). The rest of the app extends this aesthetic into a Vercel/Linear-style SaaS dashboard.

This is a large build. I'll deliver it in **5 sequential phases**, each shippable on its own. After each phase you can preview, give feedback, and approve the next.

---

## Phase 1 — Foundation + Landing

**Design system**
- Replace `src/styles.css` tokens with the SoundXpand palette (bg `#060608`, text `#f0eeff`, accent `#a78bfa`/`#7c3aed`, pink `#f472b6`, cyan `#22d3ee`, green `#34d399`, orange `#fb923c`) plus a mirrored light theme.
- Add **Syne** (display) + **DM Sans** (body) via `@fontsource` packages, referenced from `@theme` in `src/styles.css`.
- Add reusable primitives: noise overlay, glass card, gradient border, glow button, animated gradient text.
- Theme toggle (next-themes-style, class on `<html>`, persisted), exposed in nav and dashboard.

**Landing route** (`src/routes/index.tsx` — replaces current AssetWise landing)
- Sticky glass nav (logo, links, theme toggle, Sign in, Start free).
- Hero: animated headline "Distribute Your Music Everywhere", subhead, dual CTAs, animated SVG distribution-network graphic (central node → 12 platform logos with pulsing connections), live-counter stat strip (Artists, Tracks, Countries, Royalties).
- Features grid: Global Distribution (logo wall: Spotify, Apple, Amazon, YouTube, TikTok, Instagram, Facebook, Deezer, Tidal, Boomplay, JioSaavn, Wynk), Fast Delivery, Royalty Collection, Analytics.
- Artist Success showcase (horizontal scroll of release cards with cover art + stream counts).
- Pricing: 3 cards (Starter ₹999, Pro ₹2999, Label ₹4999) with comparison table beneath.
- FAQ accordion (shadcn Accordion).
- Footer (company, legal, support, social).

All sections live in `src/components/landing/` (Hero, Features, Network, Stats, Pricing, FAQ, Footer).

---

## Phase 2 — Auth

- Wipe AssetWise routes (`assets.*`, `employees.tsx`, `ai-chat.tsx`, `settings.tsx`, related components).
- Drop AssetWise tables (`assets`, `asset_assignments`, `asset_categories`, `employees`) via migration; **keep** `user_roles`, `has_role`, `handle_new_user_role`.
- New tables: `profiles` (full_name, artist_name, mobile, country, avatar_url) with auto-insert trigger on signup; appropriate GRANTs + RLS (`auth.uid() = id`).
- `/auth` route — split-screen layout, branded left panel (animated gradient + tagline), right panel toggles Login ↔ Register.
- Email/password + Google OAuth (via `lovable.auth.signInWithOAuth`); enable Google provider in same turn.
- "Use demo account" button (auto-fills `demo@soundxpand.com` / `Demo@123`); demo user seeded via migration.
- `/reset-password` route.
- Move all dashboard routes under `src/routes/_authenticated/` (integration-managed gate).

---

## Phase 3 — Dashboard shell + Catalog + Upload Wizard

**Shell** (`_authenticated/route.tsx` child layout)
- Linear/Vercel-inspired: collapsible left sidebar (Dashboard, Catalog, Upload, Analytics, Royalties, Team, Support), top bar (search, theme, user menu).

**Dashboard home** (`/dashboard`)
- Stat widgets (Total Releases, Monthly Streams, Revenue, Active Artists), Recharts area/bar/pie for Revenue trend, Stream analytics, Platform breakdown, Recent activity list.

**Catalog** (`/catalog`)
- Table of releases (cover, title, type, status, release date, streams), filters, row actions (view, edit metadata, archive).

**Upload Wizard** (`/upload`) — 6 steps with progress rail, draft auto-save:
1. Release info (title, version, type Single/EP/Album, genres, language, copyright year)
2. Artwork upload (validates JPG/PNG ≥3000×3000, preview)
3. Audio upload (WAV/FLAC drag-drop, progress, in-browser preview, basic QC: file type, sample rate, channels)
4. Per-track metadata (title, ISRC, UPC, explicit, composer, lyricist, producer, features, contributors, copyright, publishing)
5. Distribution (multi-select stores, release date)
6. Review + submit (validation checklist, submit → `status: pending`)

**Backend**
- Tables: `releases`, `release_tracks`, `release_distributions`, `release_drafts`.
- Storage buckets: `artwork` (public), `audio` (private, signed URLs).
- RLS scoped to owning user; service-role grants for future admin tooling.

---

## Phase 4 — Analytics, Royalties, Team, Support

- **Analytics**: streams over time, revenue, top countries (choropleth-ish bar), platform split, audience demographics — all backed by seeded mock aggregates (`stream_stats`, `revenue_stats` tables) so the UI is real and live-queried.
- **Royalties**: monthly earnings table, downloadable statements (client-side CSV), revenue splits config per release.
- **Team**: invite by email, role assignment (admin/manager/artist) via `user_roles` extension, permissions matrix.
- **Support**: ticket system (`support_tickets`, `support_messages` tables) with thread view; knowledge base as static MDX-style content; live chat stub (UI only, marked "coming soon").

---

## Phase 5 — Polish

- Scroll animations (Framer Motion `whileInView`), page transitions, hover micro-interactions.
- Empty states + skeletons everywhere.
- Light-mode pass across dashboard.
- Mobile responsive sweep (sidebar → drawer, tables → cards).
- SEO meta in every route `head()`.
- Final security/lint pass.

---

## Technical Notes

- Stack stays as-is: TanStack Start + React 19 + Tailwind v4 + TanStack Query + shadcn + Recharts. No Next.js/Express despite the reference doc — those don't apply to this template.
- Animations: Framer Motion (already implied by direction). Add via `bun add framer-motion`.
- Payments (Razorpay/Stripe from the spec) deferred — pricing page CTAs route to a "Contact sales / coming soon" state until you explicitly enable a provider.
- All custom colors go through CSS tokens in `src/styles.css` (`@theme`), never hardcoded.
- Demo account + seed data via migration so the app is immediately explorable.

---

## What I need from you to start

Approve this plan, and I'll begin with **Phase 1 (Foundation + Landing)**. After you see it live, we move to Phase 2.

If you'd rather compress phases (e.g. land Phase 1+2 together) or reorder, say so before approving.
