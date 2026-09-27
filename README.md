# Note-Taking App

A note-taking app built as the hands-on vehicle for a structured learning
plan — see `CLAUDE.md` and `steering/` for the full context, and `lessons/`
for the lesson-by-lesson breakdown.

## Stack

Two independent Next.js (App Router) + TypeScript apps talking over HTTP:

- `frontend/` — UI only (Tailwind CSS + shadcn, custom design system).
  Calls `backend/` via `fetch` (see `src/lib/repository/api-repository.ts`).
- `backend/` — Route Handlers only, no pages. Owns persistence (Postgres via
  Prisma) and hand-rolled auth (a `User` table, hashed passwords, a signed
  session cookie checked by querying that table directly — no NextAuth).
- `db/` — self-contained Prisma package: schema, migrations, seed script.

Containerized with Podman; `podman-compose.yml` at the repo root ties
`frontend` + `backend` + Postgres together.

## Dev commands

Each app has its own `package.json`/`node_modules`. From `frontend/` or
`backend/`:

```bash
npm install      # install dependencies
npm run dev      # start the dev server (frontend: :3000, backend: :4000)
npm run lint     # eslint
npm run build    # production build
npm test         # unit tests (frontend only — backend routes are verified
                 # via integration testing against a real Postgres instance,
                 # not a unit-test suite)
```

`db/` additionally has `npm run db:generate` / `db:migrate:deploy` / `db:seed`.

Running both apps against Postgres locally (outside containers) requires a
Postgres instance reachable at the `DATABASE_URL` in `db/.env` — copy
`db/.env.example`, and each app's `.env.example`, to `.env.local`/`.env` and
adjust as needed.

## Full stack via Podman

```bash
cp .env.example .env   # then set SESSION_SECRET (openssl rand -hex 32)
scripts/build-and-run.sh
```

This generates the Prisma client, builds the `frontend`/`backend` images,
brings up Postgres, waits for it to be healthy, runs migrations + the seed
script, then starts `backend` + `frontend`. Once up: frontend at
`http://localhost:3000`, backend at `http://localhost:4000`. Log in with the
seeded demo user (`SEED_USER_EMAIL`/`SEED_USER_PASSWORD` in `.env`).
