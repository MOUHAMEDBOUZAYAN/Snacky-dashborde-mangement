# Snacky Admin

Frontend-only admin dashboard for the Snacky snack shop. Consumes the NestJS API — no database or business logic of its own.

## Stack

- Next.js App Router + TypeScript (strict)
- Tailwind CSS v4 + Snacky brand tokens
- shadcn/ui
- TanStack Query
- react-hook-form + zod
- Axios (`src/lib/api.ts`) with `{ success, data }` unwrap + Bearer auth

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Demo admin

- Email: `admin@snacky.local`
- Password: `AdminPass123!`

Non-admin accounts are rejected with “Access restricted to admins”.

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # TypeScript --noEmit
```
