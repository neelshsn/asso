# N'GO Match MVP

Next.js 15 + React 19 MVP that orchestrates multilingual volunteer <> association matching with Tailwind, shadcn/ui, Prisma (PostgreSQL), NextAuth credentials auth, next-intl i18n, node-cron, and Nodemailer (Ethereal in dev).

## Tech stack

- Next.js 15 App Router, React 19, TypeScript
- Tailwind CSS, shadcn/ui, lucide-react icons
- next-intl for `/en|fr|es` routing + translations
- Prisma ORM (PostgreSQL database, e.g. via Prisma Accelerate or a managed Postgres) with seed data
- NextAuth credentials (admin only) + bcryptjs hashes
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

Visit `http://localhost:3000/en` (or `/fr`, `/es`). Admin dashboard lives at `/en/admin` (login `/en/admin/login`). Default admin creds come from `.env` / seed (`admin@ngo.local` / `change-me`).

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
- Admin dashboard (credentials auth) with stats overview, tables, settings form, manual matching reruns & notifications
- Full next-intl locale-aware routing + JSON copy in `locales/{en,fr,es}`

## Environment

`.env.local` controls SMTP + admin creds + Google Form fallbacks (and the database connection):

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
PLATFORM_FROM="N'GO <noreply@ngo.local>"
PLATFORM_CC="match@ngo.local"
SITE_URL=http://localhost:3000
ADMIN_EMAIL=admin@ngo.local
ADMIN_PASSWORD=change-me
GOOGLE_FORM_VOLUNTEER=
GOOGLE_FORM_ASSOC=
```

Without SMTP creds the Nodemailer transport falls back to Ethereal and logs preview URLs.

## Testing + linting

```
pnpm lint
pnpm typecheck
```

Feel free to adapt seeding, translations, or UI copy via the JSON locale files.
