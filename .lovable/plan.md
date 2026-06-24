# Plan

Scope-limited changes across catalog, release wizard, settings, support, sidebar, and auth.

## 1. Catalog drafts (`src/routes/_authenticated/catalog.tsx`)
- "Continue where you left off" card: slice `drafts` to last 2 (already ordered by `updated_at` desc).
- Add a small trash icon button next to each draft → confirm dialog → `delete from release_drafts where id = ?` → reload.
- Add a "View all drafts" link if `drafts.length > 2`.
- "All your releases in one place" table: merge in drafts as synthetic rows with `status = 'draft'` so the existing tab filter (`draft`) shows them. Clicking a draft row opens `/releases/new?draft=<id>` instead of `/releases/$id`. Distinguish with a "Draft" subtle pill.

## 2. Release wizard (`src/routes/_authenticated/releases.new.tsx`)
- **Single track toggle behavior**:
  - Auto-enable toggle when `release_type === "single"`; auto-disable + allow add when other types.
  - When toggle is OFF, derive `release_type` from track count: `1 → single`, `2 → ep` (per user's wording "1+ track EP" — clarify wording: treat 2–6 as `ep`, 7+ as `album`). Use: `length === 1 → single`, `length >= 2 && length < 7 → ep`, `length >= 7 → album`. Set on track add/remove.
  - When toggle ON, force tracks to length 1, lock add/duplicate (existing behavior).
- **C Year / P Year defaults**: default to current year (`new Date().getFullYear()` = 2026). Dropdown options: extend `P_YEARS` to include next year dynamically (`currentYear + 1`). Update `src/lib/release-options.ts` to compute years 1950..currentYear+1.
- **Dropdown scroll fix**: Year/Language/Genre selects use shadcn `<Select>`. Wrap long `SelectContent` with `max-h-[300px] overflow-y-auto` on the content (shadcn already provides scroll buttons; ensure wheel scroll works by adding `className="max-h-72"` on `SelectContent`). Audit all three dropdowns in Step 1 and any track-level genre dropdown.

## 3. Settings — Payout preferences (`src/routes/_authenticated/settings.tsx`)
New card "Payment & withdrawals":
- Method dropdown: UPI / Bank transfer / PayPal.
- Conditional fields:
  - UPI → `upi_id`
  - Bank transfer → `account_holder`, `account_number`, `ifsc_or_routing`, `bank_name`, `swift` (optional)
  - PayPal → `paypal_email`
- Persist to `profiles` via new columns: `payout_method`, `payout_details jsonb`. Migration required.

## 4. Sidebar (`src/components/dashboard/app-sidebar.tsx`)
Remove "DSP lookup" entries from artist, manager, administrator nav arrays. Keep the route file intact (still reachable by URL).

## 5. Support tickets visibility
- **User side (`support.tsx`)**: already scoped via RLS to creator — verify it lists only `user_id = auth.uid()` tickets. No code change unless leak found.
- **Admin tickets (`admin.tickets.tsx`)**: Add user profile link. Fetch `profiles(username, full_name)` joined via `support_tickets.user_id`. Show "Opened by @SX003" in the row and sheet header → link to `/users/$username`.

## 6. User catalog access for admin (`src/routes/_authenticated/users.$username.tsx`)
Add a "Releases" section listing all releases owned by that user with link to `/releases/$id`. Admin only (RLS already permits administrators to read all releases via existing policy — verify; otherwise add an admin select policy).

## 7. Auth hash routing (`src/routes/auth.tsx`)
- Read `window.location.hash` on mount: `#login` → show login, `#register` → show register step 1.
- Update tab/toggle clicks to push `history.replaceState(null, '', '#login'|'#register')`.
- Default (no hash) stays on current default.

## Database migration
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payout_method text,
  ADD COLUMN IF NOT EXISTS payout_details jsonb DEFAULT '{}'::jsonb;
```
No new tables, no RLS changes (profiles already user-scoped). If admin can't read other users' releases, add:
```sql
CREATE POLICY "Admins read all releases" ON public.releases FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'administrator'));
```
(only if missing — will verify first).

## Out of scope
- No changes to wizard steps 2/4/6, no changes to release submission payload beyond release_type derivation, no payout processing logic (storage only), no support RLS rewrite if already correct.

Confirm and I'll implement.