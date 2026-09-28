# Prompt to Production – Paytm AI Workshop Event Platform 🚀

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat&logo=postgresql)](https://supabase.com/)

An enterprise-grade, role-based event platform built for **"Prompt to Production" – Paytm AI Workshop**, organized by the **Department of IT & AI&DS, N.B.K.R. Institute of Science & Technology** in association with **ISTE (Indian Society for Technical Education)**.

---

## 📅 Event Overview

- **Event**: Prompt to Production – Paytm AI Workshop
- **Organizers**: Department of IT & AI&DS, N.B.K.R. Institute of Science & Technology (NBKRIST)
- **Association**: ISTE Student Chapter
- **Industry Partner**: Paytm
- **Date**: 30 September 2026
- **Time**: 9:00 AM – 4:00 PM IST
- **Venue**: Seminar Hall, New CSE Block, NBKRIST Campus, Vidyanagar
- **Capacity**: 100 Students

---

## 🌟 Keynote Speakers

1. **Mr. Suman Mandal** – Program Lead, Paytm *(Virtual Masterclass – 1h 15m)*
   - *Topic*: Generative AI in Production, model fine-tuning, latency optimization & payment safety guardrails.
2. **Mr. Shivam Behl** – SDE-II, Microsoft *(Virtual Masterclass – 1h 15m)*
   - *Topic*: Scalable AI-Assisted Architecture, developer agentic tooling & rapid prototyping.

---

## 👥 Three-Tier Role-Based Architecture

| Role | Dashboard URL | Capabilities |
| :--- | :--- | :--- |
| **Participant (User)** | `/dashboard` | Digital holographic ticket with QR code, Profile, Interactive Schedule, Resources & Slides, Team Creation/Join with 6-char invite code, Hackathon Project Submission, Certificate of Participation/Merit, Support Desk. |
| **Coordinator** | `/coordinator` | Gate check-in verification station with live camera QR scanner, audio feedback chimes, duplicate entry alert, searchable participant directory, registration verification, support queue. |
| **Administrator** | `/admin` | Executive event statistics, event & pricing configuration, coordinator permission manager (RBAC), judging console with 100-point rubric, mass certificate issuance, broadcast announcements, CSV data exports. |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend**: Next.js Server Actions & API Routes.
- **Database**: PostgreSQL (Supabase schema with Row Level Security in `schema.sql`).
- **Payment Gateway**: Razorpay integration with server-side HMAC SHA-256 signature verification.
- **Digital Passes**:
  - RFC 5545 `.ics` Calendar file with **30-minute VALARM reminder** (`/api/calendar/[ticketId]`).
  - Apple/Google Wallet Pass JSON (`/api/wallet/[ticketId]`).
- **QR Code**: High error correction level QR generation and tamper-evident tokens (`ticket_id=P2P-2026-XXXXX`).

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Demo Persona Quick-Switch
Use the **Demo Role Switcher** in the top navigation bar or on the `/login` page:
- **Participant**: Manoj N (`student@nbkrist.org`)
- **Coordinator**: K. V. Chaitanya (`coordinator@nbkrist.org`)
- **Admin**: Dr. S. K. Rao (`admin@nbkrist.org`)

---

## 📁 Repository Structure

```text
├── schema.sql                 # PostgreSQL DDL script with tables, enums & RLS policies
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── calendar/[ticketId]/route.ts  # .ics generator with 30-min reminder
│   │   │   ├── wallet/[ticketId]/route.ts    # Wallet pass payload
│   │   │   ├── razorpay/order/route.ts       # Razorpay order creator
│   │   │   └── razorpay/verify/route.ts      # Server-side signature verification
│   │   ├── admin/             # Administrator console (12 management modules)
│   │   ├── coordinator/       # Coordinator gate check-in & scanner
│   │   ├── dashboard/         # Participant portal & digital ticket
│   │   ├── register/          # Multi-step registration & payment workflow
│   │   ├── login/             # Role-based login with 1-click demo switcher
│   │   ├── leaderboard/       # Live Build Challenge podium & standings
│   │   ├── verify/[id]/       # Public certificate verification portal
│   │   ├── layout.tsx         # Root layout with navigation & banner
│   │   └── page.tsx           # High-aesthetic dark/glassmorphic landing page
│   ├── components/
│   │   ├── Navbar.tsx         # Responsive navbar with demo role switcher
│   │   ├── Footer.tsx         # Institutional footer & campus contact
│   │   ├── TicketCard.tsx     # Holographic digital ticket with QR
│   │   └── BroadcastBanner.tsx# Real-time announcement ticker
│   └── lib/
│       ├── context/AuthContext.tsx  # Role-based authentication provider
│       ├── data/mockStore.ts  # Initial seed data (100 participants, 82 checked-in)
│       ├── store.ts           # State management & CSV export helpers
│       ├── types.ts           # Full TypeScript data contracts
│       ├── ics.ts             # RFC 5545 calendar generator
│       ├── wallet.ts          # Wallet pass generator
│       └── qr.ts              # QR code generator
└── public/
    └── images/                # Poster & speaker portrait assets
```

---

## 📜 License & Accreditation

Organized by the **Department of Information Technology & Artificial Intelligence & Data Science**,  
**N.B.K.R. Institute of Science & Technology**, Vidyanagar, Andhra Pradesh - 524413.  
In association with **Indian Society for Technical Education (ISTE)** & **Paytm**.
