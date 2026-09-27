# Lesson 7 — Podman Compose: Build, Run, and What Failure Looks Like

**Phase:** 3 · **Time:** 90 min · **Grounded in:** `podman-compose.yml`,
`backend/Dockerfile`, `frontend/Dockerfile`, `scripts/build-and-run.sh`

## Recap

Lessons 1–6 lived entirely inside `frontend/`, storing data in the
browser's `localStorage`. Between Lesson 6 and now, the app was restructured
into `frontend/` + `backend/` + `db/` (commit `e6257e6` onward) and the
data moved to a real Postgres database. This lesson is about the
infrastructure that runs all of that together — you're not writing app code
today, you're operating it.

## Objective

By the end of this lesson you can build and run the full stack locally via
Podman Compose, verify it's actually up and working, and recognize what a
*failed* container build/start looks like.

## Main activity

### The shape of the stack

Open `podman-compose.yml` at the repo root. Three services:

- `db` — plain Postgres 16 image, no custom Dockerfile. Has a `healthcheck`
  (`pg_isready`) — this matters in a minute.
- `backend` — built from `backend/Dockerfile`, published on `4000`,
  `depends_on: db: condition: service_healthy` (won't start until
  Postgres's healthcheck passes, not just until the container exists).
- `frontend` — built from `frontend/Dockerfile`, published on `3000`,
  depends on `backend` (existing, not healthy — frontend has no way to
  probe backend's health here).

Run `scripts/build-and-run.sh` yourself and read it top to bottom before
running it — it: generates the Prisma client on the host (needed because
`backend/Dockerfile` doesn't run `prisma generate` itself — see the comment
at the top of that Dockerfile), builds both app images, starts `db` alone,
polls until Postgres reports healthy, runs migrations + the seed script
against `localhost:5432` (the host's view of the port `db` publishes), then
finally starts `backend` + `frontend`.

Once it prints `Stack is up`, confirm for yourself rather than trusting the
message:

```
podman ps                                   # all three containers, "Up"
curl -i http://localhost:4000/api/auth/me   # backend: expect 401 (no cookie yet — that's correct)
curl -i http://localhost:3000/              # frontend: expect a 307 redirect to /login
```

Log in through the browser at `http://localhost:3000` with the seeded demo
user (`SEED_USER_EMAIL`/`SEED_USER_PASSWORD` from your `.env` — defaults
`demo@example.com` / `demo-password`), create a note, then restart the
`backend` and `db` containers (`podman-compose restart backend db`) and
confirm the note is still there after they come back up. If it survives a
restart, the data is genuinely in Postgres, not held in some process's
memory.

### What a real failure looked like here

This isn't hypothetical — it's the exact bug found and fixed while building
this stack. `backend/Dockerfile` sets:

```dockerfile
ENV PORT=4000
```

Without that line, Next.js's standalone server (`server.js`, produced by
`next build` with `output: "standalone"`) binds to `process.env.PORT || 3000`
— always 3000 unless told otherwise. `EXPOSE 4000` in the Dockerfile and
`"4000:4000"` in `podman-compose.yml` are both just *routing/documentation*
statements — neither one changes what port the process inside the
container actually listens on. With `ENV PORT=4000` missing, the container
would start successfully (`podman ps` shows "Up"!), but `curl
http://localhost:4000` would hang and then fail with "Empty reply from
server" — because podman-compose is faithfully forwarding port 4000 to a
container where nothing is listening on port 4000; the app is listening on
3000 instead, unreachable from outside.

**Try reproducing this yourself:** comment out the `ENV PORT=4000` line in
`backend/Dockerfile`, rebuild just that service (`podman-compose build
backend`), and force a full recreate — `podman-compose up -d --force-recreate backend`
(plain `up -d backend` on an already-running container is not reliable for
picking up a rebuilt image; `--force-recreate`, or a full `down` + `up -d`,
is the sure way). Confirm the broken behavior with `curl -i
http://localhost:4000/api/auth/me` (it'll hang/fail, unlike the 401 you got
above), then check `podman logs <backend-container>` — the log line
announcing `Local: http://...:3000` inside a container you *expect* to be
serving port 4000 is the actual tell. Put the `ENV` line back and rebuild
to restore the working state before moving on.

### Other failure shapes worth recognizing

- **`depends_on: condition: service_healthy` violated:** if you start
  `backend` without waiting for `db`'s healthcheck (e.g. `podman-compose up
  -d` for everything at once, right after a fresh `podman-compose down -v`),
  `backend` will crash-loop on startup trying to reach a Postgres that
  isn't accepting connections yet. `podman ps` will show it restarting
  repeatedly rather than steady "Up" — that oscillation is itself the
  symptom.
- **Missing `.env`:** `build-and-run.sh` checks for `.env` and exits with a
  clear message before doing anything else. Try deleting your `.env` and
  running the script to see a *good* failure mode — fails fast, tells you
  exactly what's missing, wastes no time building images first.
- **`podman-compose` has no `rm` subcommand** (unlike Docker Compose) — if
  you ever need to force a single container's full recreation and
  `--force-recreate` isn't available in your podman-compose version, the
  reliable fallback is `podman-compose down` (without `-v`, which would
  also delete the named Postgres volume and your data) followed by
  `podman-compose up -d`.

## Check-your-understanding

1. `podman ps` shows all three containers as "Up." A teammate says the app
   is broken. What's the first command you'd run to check whether it's a
   real problem or a false alarm, and why doesn't "Up" alone prove the app
   works?
2. Why does `EXPOSE 4000` in a Dockerfile not guarantee the process inside
   actually listens on port 4000?
3. Why does `build-and-run.sh` run migrations/seed against `localhost:5432`
   from the host, while `backend`'s own `DATABASE_URL` (in
   `podman-compose.yml`) points at `db:5432`?

## Best-practices pointer

See [`phase-3-notes.md`](../phase-3-notes.md) for secrets/env-var handling
conventions (`.env.example` vs. `.env`, what never gets committed) used
across `backend/`, `db/`, and the repo root.
