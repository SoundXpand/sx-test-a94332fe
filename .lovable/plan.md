## Goal
Restructure the new-release wizard, introduce a reusable Artists/Label section in Settings, expand registration onboarding, and surface that data in admin user review.

## 1. Database

New migration:
- `artists` table: `id`, `owner_id` (auth.users), `name` (req), `spotify_url`, `apple_music_url`, `youtube_music_url`, `is_primary` (bool), timestamps. RLS: owner CRUD, admin read; GRANTs.
- Extend `profiles` with onboarding columns: `role_type` (enum: artist/label/songwriter/publisher), `first_name`, `last_name`, `city`, `main_genre`, `current_distributor`, `tracks_released_bucket`, `private_link`, `spotify_monthly_listeners_bucket`, `social_instagram`, `social_facebook`, `social_tiktok`, `social_vk`, `social_youtube`, `privacy_accepted_at`, `label_name`.
- Extend `releases`: `artist_ids uuid[]` (selected artists for the release).
- Username uniqueness already enforced via `sx_username_seq` + unique index — keep as-is (atomic via sequence prevents race conditions).

## 2. Registration (`src/routes/auth.tsx`)
Expand RegisterForm into a 2-step flow:
- Step 1 (existing): email/password/full_name/artist_name/mobile/country.
- Step 2 (new, before submit): "You are" (radio), first/last name, city, your name (artist/band/label), main music genre (full list from spec), current distributor (full list), tracks released bucket, private link (optional), Spotify monthly listeners bucket, socials (optional), privacy checkbox (required).
- Save extras to `raw_user_meta_data`; update `handle_new_user_soundxpand()` to map them into `profiles`.

## 3. Settings (`src/routes/_authenticated/settings.tsx`)
Add two cards:
- **Label details** — edit `label_name` + label-level fields on profile.
- **Artists management** — list user's `artists`, "Add artist" dialog (name required; Spotify/Apple/YouTube Music URLs optional), edit/delete actions. Mark one as primary.

## 4. New Release wizard (`src/routes/_authenticated/releases.new.tsx`)
- **Release details step**: remove the Release date field.
- **Distribution step**: add Release date field here. Remove Artist name + Primary artist text fields. Add **multi-select Artists dropdown** populated from the current user's `artists` table, with an inline "Add new artist in Settings" link.
- **Tracks step**: same artist multi-select replaces the free-text featured/primary artist input on each track.
- Submit writes `artist_ids` to `releases` and per-track artist links.

## 5. Admin user review (`src/routes/_authenticated/users.tsx` + new `users.$username.tsx`)
- Make each row link to `/users/SX001`.
- New detail route shows all profile data (onboarding answers, socials, distributor, etc.), the user's artists list, and Approve / Reject (with reason) actions.

## Technical notes
- Artist multi-select: simple checkbox popover or `cmdk` combobox using existing shadcn primitives — no new deps.
- Race-safe usernames already covered by the Postgres sequence in `handle_new_user_soundxpand`.
- All new public-schema tables get GRANTs + RLS in the same migration.
- Privacy acceptance stored as timestamp (`privacy_accepted_at`) so we can audit.

## Out of scope
- Editing the auto-generated SX### username format.
- Migrating existing releases' free-text `artist_name`/`primary_artist` into the new `artist_ids` array (left as-is for back-compat; new submissions use artists).