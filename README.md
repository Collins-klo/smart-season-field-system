# 🌿 SmartSeason Field Monitoring System

A role-based, full-stack web application for monitoring agricultural field agents and their crop fields through a seasonal lifecycle. Built with **Next.js 16**, **Prisma**, **NextAuth v5**, and deployed against a **Neon PostgreSQL** database.

---

## Overview

SmartSeason is a field monitoring dashboard designed for agricultural supervisors and their field agents. Admins can create and manage fields, assign agents, and invite new agents via email. Field agents can view their assigned fields, log crop stage updates, and track activity over time.

---

## Features

### Admin Role
- **Dashboard** — overview stats (total fields, agents, at-risk fields, harvested) and a stage breakdown chart
- **Field Management** — create new fields, view all fields with live status computation, update any field's crop stage
- **Agent Management** — view all agents, invite new agents via email (Resend), create agents manually, and manage pending invites
- **Activity Dashboard** — charts (area, bar, pie) showing field update activity over time, plus smart insights and attention summaries

### Field Agent Role
- **Dashboard** — see only their own assigned fields, relevant stats, and a stage breakdown chart
- **Field Detail** — view full update timeline for a specific field and submit new crop stage updates
- **Activity** — personal activity timeline and charts for their own logged updates

### Shared
- **Authentication** — credentials login via NextAuth v5 with JWT sessions
- **Invite Flow** — agents receive a secure, single-use, 7-day expiry token link; they click it to create their account
- **Dynamic Greetings** — topbar displays time-aware greeting (Good Morning / Afternoon / Evening)
- **Collapsible Sidebar** — role-aware navigation with expand/collapse and a floating topbar that adjusts its width
- **Field Status Engine** — automated at-risk detection using overdue stage duration and time-since-last-update rules

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Styling | Tailwind CSS v4 + custom CSS variables |
| Charts | [Recharts](https://recharts.org/) |
| Auth | [NextAuth v5 (beta)](https://authjs.dev/) — Credentials provider |
| ORM | [Prisma 6](https://www.prisma.io/) |
| Database | [Neon PostgreSQL](https://neon.tech/) (serverless) |
| Email | [Resend](https://resend.com/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Package Manager | [pnpm](https://pnpm.io/) |

---

## Setup & Installation

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 — install with `npm install -g pnpm`
- A **Neon** PostgreSQL database (free tier works) — [neon.tech](https://neon.tech/)
- A **Resend** account for email invites — [resend.com](https://resend.com/)

### 1. Clone the repository

```bash
git clone https://github.com/Collins-klo/smart-season-field-system.git
cd smart-season-field-system
```

### 2. Install dependencies

```bash
pnpm install
```

---

## Database Setup

### Run migrations

Apply the database schema to your Neon instance:

```bash
pnpm prisma migrate deploy
```

For local development using `prisma migrate dev`:

```bash
pnpm prisma migrate dev
```

### Generate Prisma Client

The build script runs this automatically, but you can run it manually:

```bash
pnpm prisma generate
```

---

## Running the Application

### Development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The root `/` redirects to `/dashboard`, which redirects unauthenticated users to `/login`.

### Production build

```bash
pnpm build
pnpm start
```

> `pnpm build` automatically runs `prisma generate` before the Next.js build.

---

## Seeding Demo Data

The seed script creates two field agents and one admin with pre-populated fields and update history to demonstrate the dashboard features:

```bash
pnpm prisma db seed
```

This runs `prisma/seed.ts` via `tsx`.

---

## Default Credentials

After seeding, log in with:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@smartseason.com` | `admin123` |
| Field Agent | `james@smartseason.com` | `agent123` |
| Field Agent | `grace@smartseason.com` | `agent123` |

---

## Design Decisions

### 1. Role-based routing via layout guards
Authentication and role checks are performed in the `(dashboard)/layout.tsx` Server Component using the `auth()` helper from NextAuth. Unauthenticated users are redirected to `/login` server-side, avoiding any client-side flash. The role (`ADMIN` vs `FIELD_AGENT`) is embedded in the JWT and surfaced via the session, so dashboards can render the correct view without additional DB calls.

### 2. Field status computed at read-time, not stored
The `active / at_risk / completed` status of a field is computed dynamically by `lib/field-status.ts` rather than being stored in the database. This keeps the schema simple and ensures the status is always current. The rules are:
- `HARVESTED` stage → **completed**
- Days since planting exceeds 130% of the cumulative expected stage duration → **at_risk**
- No field update logged in the last 7 days → **at_risk**
- Otherwise → **active**

### 3. Agent invite flow with secure single-use tokens
Admin can invite agents via email rather than creating accounts on their behalf. A cryptographically random token is stored in the `AgentInvite` table with a 7-day expiry. The invite link embeds the token; when the agent visits it, they set their own name and password. This avoids the admin ever handling plaintext passwords.

### 4. Enums stored as strings in the database
Prisma `enum` types are replaced by plain `String` fields in the schema to maintain compatibility across both the SQLite dev database and the Neon PostgreSQL production database during development. The enum values (`ADMIN`, `FIELD_AGENT`, `PLANTED`, `GROWING`, `READY`, `HARVESTED`) are centralised in `types/index.ts` and used throughout the codebase to prevent magic strings.

### 5. Client/Server Component split
Data fetching exclusively happens in Server Components (page files and layout). Interactive UI elements (forms, modals, charts, tabs) are marked `"use client"`. The `AgentsClient.tsx` pattern is the primary example: the page fetches agents server-side and passes them as props to the client component that handles invite sending, agent creation, and table interactions without additional round-trips.

### 6. Neon serverless adapter for Prisma
The `@prisma/adapter-neon` and `@neondatabase/serverless` packages allow Prisma to run over WebSockets in Neon's serverless environment, which is important for avoiding connection exhaustion in a Next.js serverless deployment where each request may spin up a fresh Lambda.

### 7. Dark-first theme via CSS custom properties
The entire colour palette is defined as CSS variables in `globals.css` under `:root`. Components reference these variables (e.g., `var(--color-background)`, `var(--color-primary)`) rather than hardcoded hex values. This makes theme changes a single-file operation and allows for future light-mode support by swapping the variable values under a `[data-theme="light"]` selector.

### 8. Floating topbar and collapsible sidebar
The sidebar uses a CSS `width` transition. The topbar's width and `left` position are derived from the sidebar state via inline style calculations in Tailwind to create a "floating card" effect where the topbar does not overlap the sidebar and adapts dynamically.

---

## Assumptions

1. **Single organisation** — the system assumes one agricultural organisation is using the platform. There is no multi-tenancy; all admins can see all agents and all fields.

2. **Email delivery for invites** — it is assumed that agents being onboarded have an accessible email address. A manual creation fallback (where the admin sets a temporary password) is included in the agent management UI for agents without email access.

3. **Field ownership is one-to-one** — each field is assigned to at most one agent (`agentId` on the `Field` model is nullable but non-array). Reassigning a field to a different agent is possible via the admin interface.

4. **Crop stage is linear and forward-only** — the stage progression `PLANTED → GROWING → READY → HARVESTED` is assumed to move forward. The system does not prevent a stage from being set to an earlier value but the status engine and timeline display treat the latest update as authoritative.

5. **No real-time updates** — the dashboard refreshes on full page navigation. There is no WebSocket or polling; for a production system with live field monitoring, implementing server-sent events or SWR/React Query polling would be a natural next step.

6. **Resend free tier domain** — the invite email is sent from `onboarding@resend.dev`, which is Resend's shared domain available on the free tier. For production, a verified custom domain should replace this.

7. **Avatar images from robohash.org** — agent avatars are generated dynamically using the robohash.org service keyed on the user's email. This is a development convenience; production would use an upload/storage service.
