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

`.env.local` controls SMTP, Google Form fallbacks, and the database connection:

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
```

Without SMTP creds the Nodemailer transport falls back to Ethereal and logs preview URLs.

## Testing + linting

```
pnpm lint
pnpm typecheck
```

Feel free to adapt seeding, translations, or UI copy via the JSON locale files.
