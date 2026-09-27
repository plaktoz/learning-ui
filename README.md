# Note-Taking App

A note-taking app built as the hands-on vehicle for a structured learning
plan — see `CLAUDE.md` and `steering/` for the full context.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn, a custom design
system, localStorage persistence migrating to Postgres via Prisma, NextAuth,
containerized with Podman.

## Dev commands

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:3000
npm run lint     # eslint
npm run build    # production build
npm test         # unit tests
```

Phase 3 also uses `scripts/build-and-run.sh` to bring up the app + Postgres
via `podman-compose`.
