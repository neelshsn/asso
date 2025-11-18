# N'GO Match MVP

Next.js 15 + React 19 MVP that orchestrates multilingual volunteer <> association matching with Tailwind, shadcn/ui, Prisma (PostgreSQL), next-intl i18n, node-cron, and Nodemailer (Ethereal in dev) plus a public ops dashboard.

## Tech stack

- Next.js 15 App Router, React 19, TypeScript
- Tailwind CSS, shadcn/ui, lucide-react icons
- next-intl for `/en|fr|es` routing + translations
- Prisma ORM (PostgreSQL database, e.g. via Prisma Accelerate or a managed Postgres) with seed data
- Public `/dashboard` to monitor stats + trigger matching without auth
- Nodemailer transport (SMTP via `.env` or auto Ethereal)
- node-cron daily widening job

## Getting started

```bash
pnpm install
cp .env.example .env.local # adjust secrets + SMTP
pnpm prisma migrate dev --name init
pnpm prisma db seed
pnpm dev
```

Visit `http://localhost:3000/en` (or `/fr`, `/es`). The operations dashboard is available at `http://localhost:3000/dashboard` with the same stats and actions as the former admin area, but no login is required.

## Key scripts

- `pnpm dev` � start Next
- `pnpm lint` / `pnpm typecheck` / `pnpm format`
- `pnpm prisma:migrate` � run migrations
- `pnpm prisma:seed` � reseed demo data

## Project highlights

- Landing hero + sections + FAQ using lucide + framer-motion accents
- Volunteer & Association forms with react-hook-form + zod validation, Google Form toggles, toast feedback, email confirmations, PostgreSQL persistence
- Matching engine (`lib/match.ts`) with weighted scoring, synonym boost, threshold tuning, and cron-triggered widening
- Nodemailer proposals + acceptance emails with magic links handled by `/match/confirm`
- Dashboard with stats overview, manual matching reruns & notifications (open access)
- Full next-intl locale-aware routing + JSON copy in `locales/{en,fr,es}`

## Environment

`.env.local` controls SMTP, Google Form fallbacks, Supabase, and the database/admin credentials:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
PLATFORM_FROM="N'GO <noreply@ngo.local>"
PLATFORM_CC="match@ngo.local"
SITE_URL=http://localhost:3000
GOOGLE_FORM_VOLUNTEER=
GOOGLE_FORM_ASSOC=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_HOST=
POSTGRES_DATABASE=
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_PRISMA_URL=
DIRECT_DATABASE_URL=
SHADOW_DATABASE_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Without SMTP creds the Nodemailer transport falls back to Ethereal and logs preview URLs.

After setting `ADMIN_EMAIL` / `ADMIN_PASSWORD`, run `pnpm admin:create` once so Prisma stores the admin user (hashing uses the shared bcrypt helper).

> Prisma CLI now picks up its schema + seed command from `prisma.config.ts`, so you no longer need the deprecated `package.json#prisma` block.
> `DIRECT_DATABASE_URL` should point to the non-pooled Supabase port (`5432`).  
> `SHADOW_DATABASE_URL` must be distinct from `DATABASE_URL` (append `?schema=shadow`), otherwise Prisma refuses to run migrations.

## Deployment (Vercel + Supabase)

1. In the Vercel dashboard (or via `vercel env`), add every variable shown in `.env.example` — especially the Supabase URLs/keys and the `ADMIN_*` pair so serverless functions share the same Postgres cluster.
2. Pull them locally when needed with `vercel env pull .env.production`, then point `DATABASE_URL` at the Supabase pooler (already provided).
3. After deploying, run `pnpm prisma migrate deploy && pnpm admin:create` against the live database (locally with the production `DATABASE_URL` loaded) to ensure the schema and admin user exist.
4. Volunteer/association forms already return a `credentials` object; the success page surfaces these login/password pairs instantly after each submission so both Vercel and local builds behave the same.

## Testing + linting

```
pnpm lint
pnpm typecheck
```

Feel free to adapt seeding, translations, or UI copy via the JSON locale files.
