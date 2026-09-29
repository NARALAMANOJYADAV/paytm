# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Participants:** NBKRIST students (and students from other colleges) who register for the one-day "Prompt to Production" workshop. They register and pay, keep a QR ticket on their phone, show it at the gate, follow the schedule, form teams of up to 4, submit their AI Build Challenge project, and download certificates. They mostly use phones, on campus.
- **Coordinators:** student and faculty volunteers at the Seminar Hall entrance on event day. They scan QR tickets with a phone or laptop camera, handle duplicate entries, look up participants and answer support queries. They work fast, standing, in a crowd.
- **Administrators:** department faculty who configure the event and pricing, manage coordinator permissions, judge submissions against a 100-point rubric, issue certificates, broadcast announcements and export CSVs.

## Product Purpose
This is the main, live event site for "Prompt to Production – Paytm AI Workshop". It runs registration, ticketing, check-in and the post-event build challenge for one real event. Success means seats fill, check-in at the gate is fast and error-free, and every participant leaves with a submission and a verifiable certificate.

## Positioning
This is the official home of one specific event: a Paytm-conducted AI workshop at NBKRIST, run with ISTE, capacity 100. It is not a generic event SaaS. The site should feel like it belongs to this event and this campus.

## Operating Context
- The event is on 30 September 2026, 9:00 AM – 4:00 PM, in the Seminar Hall, New CSE Block, NBKRIST campus, Vidyanagar. Day 2 is 1 October 2026, 10:00 AM – 12:30 PM.
- Speakers (virtual masterclasses): Mr. Suman Mandal, Program Lead, Paytm; Mr. Shivam Behl, SDE-II, Microsoft.
- Leadership: Sri. N. Ramkumar (Correspondent), Dr. M. Sreenivasulu (Principal i/c), Dr. A. Narayana Rao (HOD, IT and AI&DS), Mr. M. Sivapratap Reddy (Program Coordinator).
- Fees: ₹50 for ISTE members, ₹100 for everyone else. Payments go through Razorpay.
- Gate check-in uses a live camera QR scanner with audio feedback.

## Capabilities and Constraints
- Next.js 16 App Router, React 19, Tailwind CSS v4, lucide-react icons.
- State currently lives in a client-side mock store (`src/lib/store.ts`, `src/lib/data/mockStore.ts`); `schema.sql` defines the Supabase/Postgres target.
- Roles: user (`/dashboard/*`), coordinator (`/coordinator/*`), admin (`/admin/*`). Public routes: `/`, `/login`, `/register`, `/leaderboard`, `/verify/[id]`.
- API routes: `.ics` calendar, wallet pass, Razorpay order and verify.
- All existing functionality, routes and flows must keep working through any redesign.

## Brand Commitments
- Paytm branding must be present; Paytm conducts the workshop and is the industry partner.
- NBKRIST, the Department of IT & AI&DS, and ISTE must remain prominent.
- The official poster (`public/images/poster.jpg`) stays on the landing page, unaltered.
- Event details (date, time, venue, speakers, fees, capacity) and the registration flow are required content.

## Evidence on Hand
- The official poster: `public/images/poster.jpg`.
- Speaker portraits: `public/images/suman_mandal.jpg`, `public/images/shivam_behl.jpg`.
- There are no testimonials, past-event photos, or attendance figures from previous editions. Do not invent any.

## Product Principles
1. The event facts come first: when, where, who, how much, and how to register must be clear within seconds.
2. The gate must never wait: check-in and ticket screens favour speed and legibility over decoration.
3. The site belongs to this event. It represents the college, ISTE and Paytm, so it must look official and trustworthy, never like a template.
4. Every role finishes its job without confusion: participant, coordinator and admin each get a clear path.

## Accessibility & Inclusion
Heavy use on mid-range Android phones, outdoors and in bright halls. Text must stay high-contrast and legible, and tap targets must be generous.
