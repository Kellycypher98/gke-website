# Copilot Instructions for AI Coding Agents

## Project Overview
This is a Next.js 13+ monorepo for Global Kontakt Empire Ltd, focused on Afrocentric event hosting and business empowerment. The codebase is structured for modularity, scalability, and integration with Stripe, Supabase, and custom admin workflows.

## Architecture & Key Directories
- `src/app/` — Next.js app directory (pages, API routes, layouts)
- `src/components/` — Modular React components (UI, events, emails)
- `src/lib/` — Utility modules (Stripe, Supabase, email, storage)
- `src/types/` — TypeScript type definitions
- `public/` — Static assets and images
- `supabase/migrations/` — SQL migration scripts for database schema
- `scripts/` — Node/TS scripts for admin, migrations, and Supabase sync

## Developer Workflows
- **Start Dev Server:** `npm run dev`
- **Database Migrations:** Use scripts in `scripts/` and SQL in `supabase/migrations/`. Custom migration logic may be present in `scripts/apply-migration.js` and related files.
- **Environment Setup:** Copy `.env.local.example` (if present) and fill secrets for DB, Stripe, email, etc.
- **Stripe Integration:** See `src/lib/stripe.ts` and `STRIPE-INTEGRATION.md` for payment, webhook, and ticket logic.
- **Supabase Integration:** See `src/lib/supabaseClient.ts`, `src/lib/supabaseServer.ts`, and migration scripts.
- **Admin Workflows:** Use scripts in `scripts/` for user management, password resets, and RLS policy checks.

## Project-Specific Patterns
- **TypeScript-first:** All business logic, API routes, and components use TypeScript.
- **Tailwind CSS:** Styling via utility classes, with custom colors/fonts in `tailwind.config.js`.
- **Event System:** Event/ticket logic is split between frontend (`src/app/events/`, `src/components/events/`) and backend (`src/lib/events.ts`, Supabase migrations).
- **Email Delivery:** Email logic in `src/lib/email.ts` and `src/components/emails/`.
- **RLS Policies:** Row-level security for Supabase is managed via SQL migrations and checked via scripts.
- **Custom Scripts:** Use `scripts/` for admin, migration, and Supabase tasks. Many scripts have both JS and TS versions.

## Integration Points
- **Stripe:** Payment, webhook, and ticketing logic. See `STRIPE-INTEGRATION.md` and `src/lib/stripe.ts`.
- **Supabase:** Auth, storage, and database. See `src/lib/supabaseClient.ts`, `src/lib/supabaseServer.ts`, and migration scripts.
- **Email:** SMTP config in `.env.local`, logic in `src/lib/email.ts`.

## Conventions & Tips
- **Component Structure:** Prefer modular, reusable components. See `src/components/` for examples.
- **API Routes:** Use Next.js API routes in `src/app/api/` for backend logic.
- **Type Safety:** Use types from `src/types/` for all DB, Stripe, and Supabase interactions.
- **Scripts:** Run scripts from `scripts/` for admin and migration tasks. Check for both JS and TS versions.
- **Testing:** No formal test suite detected; validate changes by running locally and using scripts.

## Example: Adding a New Event
1. Update Supabase schema via migration in `supabase/migrations/`
2. Add event logic in `src/lib/events.ts`
3. Create UI in `src/app/events/` and `src/components/events/`
4. Update types in `src/types/`
5. Test locally with `npm run dev` and relevant scripts

---
For unclear workflows or missing documentation, check `README.md`, `STRIPE-INTEGRATION.md`, and scripts in `scripts/`.
