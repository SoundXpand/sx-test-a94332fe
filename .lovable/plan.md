## Goal
Move **all** binary files (release artwork, release audio, royalty statement PDFs) off Lovable Cloud storage onto your Cloudflare R2 bucket `sxstuff1`, served publicly from `https://pub-20a9d3b3d544440aafcac92ca3007881.r2.dev`. Existing files migrated in place. Cloud storage buckets become unused afterward (you can delete them manually once verified).

## Privacy heads-up on royalty PDFs
Royalty statements contain financial info per user. With a **public** R2 bucket, anyone with the URL can download a PDF. Mitigations baked in:
- File keys use `statements/<owner_id>/<random-uuid>-<filename>` — unguessable, not enumerable.
- The R2 bucket has list-objects disabled (default for `*.r2.dev`).
- DB row access still goes through RLS, so only the owner / staff sees the URL in the UI.
This is "private-by-obscurity" — fine for most setups, but say the word and I'll switch statements to **presigned GET URLs** (private bucket policy + 60s signed link) instead. Audio + artwork stay public either way.

## Credentials handling
You pasted the secret access key in chat. On approval I'll store all five via `set_secret` (server-side, never echoed back) and recommend rotating that key in the Cloudflare dashboard since chat messages aren't a secure channel.

Secrets stored:
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`
- Also `VITE_R2_PUBLIC_URL` mirrored in `.env` for client-side display fallback.

## Architecture
```
Browser ─PUT─► R2 (presigned URL, direct upload)
Browser ─GET─► R2 public URL (no signing, no Worker hop)
DB stores full public URL in artwork_path / audio_path / pdf_path
```
Server function mints presigned PUT URLs using `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` against the R2 S3 endpoint (`https://<account>.r2.cloudflarestorage.com`).

## Code changes

**New**
- `src/lib/r2.server.ts` — S3 client + presigner targeting R2.
- `src/lib/r2-upload.functions.ts` — `createR2UploadUrl({ kind: "artwork"|"audio"|"statement", filename, contentType, sizeBytes })`, `requireSupabaseAuth`-gated; statements additionally require staff role. Returns `{ uploadUrl, publicUrl, key }`. Enforces content-type allowlist and a max size per kind (artwork 10 MB, audio 200 MB, PDF 25 MB).
- `src/lib/r2-delete.functions.ts` — admin-only `deleteR2Object({ url })` used when releases/statements are deleted.
- `src/lib/storage-url.ts` — `resolveMediaUrl(stored)` returns URL as-is when it starts with `https://`, otherwise falls back to the legacy Supabase signed URL (back-compat during/after migration).

**Edit upload sites**
- `src/routes/_authenticated/releases.new.tsx` — replace `supabase.storage.from("artwork"/"audio").upload(...)` with `createR2UploadUrl` → `fetch(uploadUrl, { method:"PUT", body:file, headers:{ "Content-Type": ... } })`; persist `publicUrl` into DB.
- `src/routes/_authenticated/royalties.tsx` — same swap for the PDF upload; store `publicUrl` into `pdf_path`.

**Edit read sites**
- `src/routes/_authenticated/releases.$id.tsx`
- `src/routes/_authenticated/releases.index.tsx` (if it signs anything)
- `src/routes/l.$slug.tsx`
- `src/routes/$roleType.$username.tsx`
- `src/components/catalog/audio-play-button.tsx`
- `src/routes/_authenticated/royalties.tsx` (replace `createSignedUrl` → direct `window.open(pdf_path)` when URL)
- `src/lib/release-bundle.ts` — switch downloads from `supabase.storage.download` to `fetch(url)` for R2-hosted entries; keep storage fallback for un-migrated paths.

**Edit deletes**
- `src/lib/admin-actions.functions.ts` — on release deletion, call `deleteR2Object` for URL-style paths; keep `supabaseAdmin.storage.remove` fallback for legacy bucket-relative paths.

## One-off migration server fn (`migrateMediaToR2`)
Staff-gated. Pages through:
1. `releases` rows with `artwork_path NOT LIKE 'http%'` → download from Cloud `artwork` bucket → PutObject R2 `artwork/<owner_id>/<basename>` → update row.
2. `release_tracks` with `audio_path NOT LIKE 'http%'` → same pattern, R2 `audio/<owner_id>/<basename>`.
3. `royalty_statement_files` with `pdf_path NOT LIKE 'http%'` → R2 `statements/<owner_id>/<basename>`.
Batches of 25, idempotent, progress logged. Triggered from a new "Migrate media to R2" button on the Admin Tools page; you click it once and watch it complete.

## R2 setup you do once
1. **CORS** on bucket `sxstuff1` — allow `PUT/GET/HEAD` from your origins:
   ```json
   [{"AllowedOrigins":["https://sx-test.lovable.app","https://id-preview--210aa1ad-4d22-4a90-ad48-aea472d1fcbb.lovable.app","http://localhost:8080"],
     "AllowedMethods":["PUT","GET","HEAD"],
     "AllowedHeaders":["*"],"ExposeHeaders":["ETag"],"MaxAgeSeconds":3600}]
   ```
   I'll repaste this verbatim after build so you can copy it into Cloudflare → R2 → `sxstuff1` → Settings → CORS Policy.
2. Confirm public access is enabled (your `pub-...r2.dev` URL implies it already is).
3. **Rotate** the R2 secret access key you posted in chat once everything is working.

## Risks
- Public PDFs (see note above).
- Direct browser → R2 PUT requires the CORS step. Until that's in place, uploads will fail with a browser CORS error — that's the bucket, not the code.
- Migration depends on existing Cloud buckets still being available; do **not** delete `audio`/`artwork`/`statements` buckets until migration finishes and you've spot-checked.

## Out of scope (this turn)
- Switching statements to private-with-signed-GET (offer above; one extra later step if you want it).
- Deleting old Cloud buckets — manual after verification.
