# Backend migration brief (for page-conversion agents)

The app used a fake client-side localStorage "store". It now has a REAL backend:
Supabase Postgres + Storage, accessed ONLY through Next.js API routes that enforce roles and rules.
Your job: convert the pages you own to the new API so every read and write is real. Keep the current
visual design exactly (classes, layout); only change logic and add loading, error and empty states in
the same design language (`.frame` cards, `.tag`, `.btn`, `text-alert` for errors).

## Read these first
- src/lib/store.ts: the client API. `loadStore()` is a sync cache of the server state and `useStore()` is a hook that re-renders on refresh.
  All writes are ASYNC functions that throw `Error(message)` on failure and auto-refresh the cache.
- src/lib/context/AuthContext.tsx: `useAuth()` gives { loading, currentUser, currentProfile, currentRegistration,
  currentTicket, role (null when signed out), isAuthenticated, permissions, login(email,password) => Promise,
  logout() => Promise, sendPasswordReset(email), refreshAuth() }. `quickSwitchRole` NO LONGER EXISTS (it was a security hole).
- src/lib/server/actions.ts and src/lib/server/registration.ts: the server rules (read them so the UI matches).
- supabase/migrations/20260929000000_init.sql: the schema plus trigger rules.

## Rules the UI must reflect
- Registration: one multipart POST (`registerParticipant(FormData)`) with details, password, UTR (12 digits) and a payment
  screenshot file field named "proof" (PNG/JPG/WEBP/PDF ≤5MB). The result is PENDING (not confirmed). No ticket until an admin
  or coordinator with REGISTRATION_VERIFY approves. After a successful register, call `login(email, password)` and send the user to /dashboard.
- Payment states: pending → "Payment under verification"; success + confirmed → ticket and QR shown; failed → show the
  rejection_reason and a "Resubmit payment" form (`resubmitPayment(FormData)` with utr + proof).
- Tickets/QR exist only for approved registrations. The QR payload is `ticket.qr_token` (already "ticket_id=REG&k=token").
- Check-in: `processCheckIn(query)` → {status: verified|already_checked_in|invalid, message, participant}. Unpaid = invalid.
- Teams: only confirmed participants; one team per person; max size from eventConfig; `createTeam(name)`,
  `joinTeam(code)`, `leaveTeam()`. The leader leaves last (that deletes the team). Locked after submission.
- Submissions: `saveProjectSubmission({... , status: "draft" | "submitted"})`. A deadline applies
  (eventConfig.submission_deadline_at); evaluated submissions are locked; the final submit needs a GitHub or demo link.
- Certificates: issued only by the admin via `issueCertificates()` → {issued, skipped[{registration, reason}]}. Eligibility =
  payment verified + checked in + after eventConfig.event_end_at (merit for rank 1/2). Show the skipped list with reasons.
  Participants see their certificates from `loadStore().certificates`; public verification uses `verifyCertificate(id)`.
- Roles: area layouts must guard access. /dashboard needs role "user"; /coordinator needs "coordinator" or "admin";
  /admin needs "admin". While `loading`, show a small skeleton; when unauthorized, redirect to /login?next=<path>
  (use next/navigation useRouter). Coordinators without a permission should not see actions they can't perform
  (`permissions` from useAuth; admins have everything).
- No mock data, no hard-coded demo credentials, and no demo "switch role" UI anywhere. Remove seeded fake numbers
  (e.g. "80 checked in") and compute everything from the store.
- CSV exports: `generateCsvData(type)` and `triggerDownload()` still work from the cache (admin has full data).
- Every async action: disable the button while running (`aria-busy`), show a success message or the error text from the thrown Error.

## Constraints
- Next.js 16 / React 19 / Tailwind v4. Keep "use client". Do not edit files outside your list, except that you may read anything.
- Don't touch src/lib/** or src/app/api/** (tell the lead if you need an API change; describe it in your report).
- Run `npx tsc --noEmit -p .` until your files are clean (ignore errors in files you don't own).
- Don't start or stop servers. There's no database connected yet, so you can't run the flows; make the code correct by reading the API.
