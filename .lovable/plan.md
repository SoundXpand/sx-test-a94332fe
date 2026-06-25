# Plan: Split username + public handle, fix landing/mobile overflow

## 1. Username model — two columns

Right now `profiles.username` is doing double duty: it's both the internal handle (auto-assigned `SX002`, `SX0010`…) AND the public URL slug the user wants to customize. That's why editing it on /profile feels destructive. Split them:

- `profiles.username` → **internal, immutable, system-assigned**. Format `SX000001`, `SX000002`, … (zero-padded to 6 digits). Used by admin lists, support, internal references. Never user-editable.
- `profiles.public_handle` → **public URL slug**, optional, user-editable. Unique (case-insensitive). Falls back to `username` when empty. This is what powers `/{role}/{handle}`.

### DB changes (one migration)
- Add column `public_handle citext UNIQUE` (nullable).
- Backfill: copy current `username` into `public_handle` for every existing row so existing public URLs keep working.
- Reset `sx_username_seq` to start at `1` with new 6-digit format. Update `next_sx_username()` → always `SX` + `LPAD(n, 6, '0')`. Existing users keep their current `SX002` etc.; only new sign-ups get the `SX000001+` format.
- Update `public_profiles` view to expose `public_handle` (and keep `username` for display fallback).
- Public lookup resolves by `public_handle` first, then `username`.

### App changes
- `/profile` "Public URL" section: input edits `public_handle` only (with the live availability check already built). The `SX0…` internal username is shown read-only above it as "Account ID".
- `/{role}/{username}` route: server fn queries `public_handle ilike $1 OR username ilike $1`.
- Admin lists keep showing `username` as the Account ID column.

## 2. Landing + mobile overflow

Cause from screenshot: `Distribute your music everywhere at once.` — the word `everywhere` overflows on 390px because the hero uses a very large `text-7xl`/`text-8xl` clamp without `break-words` and the gradient span has `whitespace-nowrap`-like behavior from `inline-block`.

Fixes (presentation only, no copy changes):
- Hero `h1`: add `break-words [overflow-wrap:anywhere] hyphens-auto`, drop one step on the smallest breakpoint (e.g. `text-5xl sm:text-6xl lg:text-7xl` instead of `text-6xl` base).
- Wrap the gradient word in a `<span class="inline">` (not `inline-block`) so it can wrap mid-line if needed.
- Audit other landing sections (`landing-hero`, `landing-features`, `landing-stats`, `landing-pricing`, `landing-cta`, `landing-footer`) for the same pattern: any `text-6xl+` heading gets `break-words` + a smaller mobile step.
- Sticky landing nav: verify the right-side buttons collapse on <380px (hide "Sign in" text, keep "Start free" pill).

Other pages to sweep for the same overflow class:
- `/{role}/{username}` hero (`text-6xl` name).
- `/auth` heading.
- `/l/{slug}` smartlink title.
- Dashboard topbar page titles.

Single shared utility added to `styles.css`: `@utility display-balance { text-wrap: balance; overflow-wrap: anywhere; }` applied to every display heading.

## 3. What I'll ship in this turn

1. Migration: add `public_handle`, backfill, update sequence + `next_sx_username()`, update `public_profiles` view.
2. Update `/profile` form: read-only Account ID + editable Public handle (availability check stays).
3. Update `/{role}/{username}` loader to resolve via `public_handle` then `username`.
4. Add `display-balance` utility + apply to landing hero + audited headings; fix nav collapse.

## Suggestions (optional, not building unless you say so)

- **Reserve handles**: block `admin`, `support`, `api`, `app`, `auth`, `release`, `releases`, `login`, `signup`, role names, etc. so users can't claim them.
- **Handle history**: keep a `public_handle_history` table so old URLs 301 to the new one when someone changes their handle (good for SEO / shared links).
- **Min length 4** for `public_handle` so they don't collide with the `SX0…` namespace.

Say the word and I'll fold any of those into the migration before I run it.
