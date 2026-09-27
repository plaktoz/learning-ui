# Phase 3 Best Practices — Backend, Postgres, Auth, Containers

Self-paced read, no lesson-hours attached. Grounded in commits `e6257e6`,
`9545d93`, `7b90bf5`, plus the Prisma-backed routes/`ApiRepository` cutover
and containerization work (see [Lessons 7–8](README.md) for the
walkthroughs of this same code).

## Project structure

`backend/` is a Next.js app with **no pages at all** — only
`src/app/api/**/route.ts`. That's a legitimate, supported use of the
framework: App Router doesn't require any UI routes to exist. `db/` is
deliberately its own package (own `package.json`, own `node_modules`), not
a subfolder of `backend/` — its generator output is pointed at
`../backend/generated/prisma` via a relative path, so `backend/` imports
the generated Prisma client without installing/versioning Prisma itself a
second time. If you're ever unsure why a given file lives in `db/` vs.
`backend/`: `db/` owns *schema and migrations*, `backend/` owns *runtime
behavior* — a route handler never contains raw SQL or a migration file.

## Error handling

Two shapes worth telling apart, one per side of the frontend/backend
boundary.

**Backend route handlers** validate input manually and return typed error
responses rather than throwing and relying on a framework-level error page
— a 400 for bad input is exactly as intentional as a 201 for success:

```ts
const body = await request.json().catch(() => null);
const title = typeof body?.title === "string" ? body.title : null;
if (title === null || noteBody === null) {
  return withCors(NextResponse.json({ error: "title and body are required" }, { status: 400 }));
}
```

`.catch(() => null)` on `request.json()` handles "the client sent
malformed JSON" without a try/catch block — a `.catch` on the promise
itself, rather than wrapping the `await` in `try { } catch { }`, is the
idiomatic shape when you only need to handle one specific failure inline.
`typeof body?.title === "string"` is manual runtime validation — TypeScript
types disappear at runtime (Lesson 1), so anything arriving from outside
the process (an HTTP body, in this case) has to be checked by hand; there's
no compiler safety net once the boundary is crossed. `requireUser()`
(`backend/src/lib/auth/require-user.ts`) centralizes the auth-check-and-401
pattern so every route calls one function instead of duplicating the
cookie-verification logic:

```ts
const { user, unauthorized } = await requireUser();
if (unauthorized) return unauthorized;
```

**`ApiRepository`** (frontend) is where a *real* network failure path
exists for the first time in this app — unlike `LocalStorageRepository`,
every method here can genuinely fail (backend down, 401, 500):

```ts
if (!response.ok) {
  const body = await response.json().catch(() => null);
  throw new Error(body?.error ?? `Request to ${path} failed with ${response.status}`);
}
```

`getNote` wraps its call in a real `try`/`catch` and turns a 404 into
`null` rather than an exception — because `NoteEditor`'s "this note doesn't
exist anymore" state (Phase 2) already expects `getNote` to return `null`
for a missing note, and that contract had to be preserved across the
storage-engine swap.

## Idiomatic patterns vs. code smells

**Idiomatic — hand-rolled auth, done carefully, not casually.** Rolling
your own session mechanism is usually a smell *unless* done exactly this
way: passwords hashed with a vetted algorithm (`bcryptjs`, chosen
specifically because it's pure JS — no native-module rebuild step inside
an Alpine container, unlike `bcrypt`) never stored in plaintext; the
session cookie is HMAC-signed (`crypto.createHmac`) so tampering is
detectable; signature comparison uses `crypto.timingSafeEqual`, not `===`
(a plain string comparison exits early on the first mismatched
character, leaking timing information an attacker could use to guess the
correct signature byte-by-byte); and the cookie is `httpOnly` (invisible to
any JS running on the page, including an injected XSS payload). Rolling
your own auth *without* those specific choices would be the smell — this
is the "done deliberately, with the right primitives" version.

**Idiomatic — CORS scoped to one exact origin.** `backend/src/lib/cors.ts`
allowlists `FRONTEND_ORIGIN` specifically, with `Access-Control-Allow-Credentials:
true`. A wildcard `Access-Control-Allow-Origin: "*"` would be the smell —
browsers actually forbid combining a wildcard origin with
`credentials: true` for exactly this reason (cookies + "any site can call
this" is a dangerous combination), so this codebase never had the option to
take the lazy path even by accident.

## Secrets / env-var handling

- **`.env.example` is committed; `.env` is not** (`.gitignore`:
  `.env*` then `!.env.example`) — the example file documents every variable
  a service reads without ever containing a real secret.
- **`SESSION_SECRET`** must be a long random value (`openssl rand -hex 32`)
  — it's the only thing standing between a valid session cookie and a
  forged one. Never reuse it across environments, and never let it end up
  in a log line or an error message.
- **`NEXT_PUBLIC_*` prefix means "baked into the browser bundle at build
  time, visible to anyone."** `NEXT_PUBLIC_BACKEND_URL` is fine to expose
  (it's just a URL) — but the prefix is a hard rule, not a suggestion:
  anything with that prefix must never be a secret, because Next.js embeds
  it directly into the JavaScript shipped to the browser during the build.
- **Host vs. container `DATABASE_URL`/`BACKEND_INTERNAL_URL` split**:
  `db/`'s own migrate/seed commands run on the host and need
  `localhost:5432`; `backend`'s container needs `db:5432` (the Compose
  service name, only resolvable *inside* the Compose network);
  `frontend`'s server-side auth check needs `BACKEND_INTERNAL_URL=http://backend:4000`
  (again, only resolvable inside the network) while the *browser* needs
  `NEXT_PUBLIC_BACKEND_URL=http://localhost:4000` (the host's published
  port). Three different URLs for what feels like "the same backend" is
  not redundancy — each one is correct for the specific network the caller
  is actually running in.

## Git / PR hygiene

`e6257e6` (the frontend/backend/db restructure) is a large commit by line
count, but read its diff and notice almost every line is a rename
(`package.json => frontend/package.json`), not a rewrite — `git`'s
similarity detection shows these as renames, not delete+add pairs, which is
exactly why a mechanical restructuring commit like this is safe to keep
large and undivided: splitting a pure move across multiple commits would
add no reviewable value. Contrast this with `9545d93`
("Scaffold backend/ Next.js app...") and `7b90bf5` ("Scaffold db/
package...") landing as two *separate* commits immediately after, even
though they were built in the same sitting — each stands alone as one
coherent concern, which is the opposite instinct from the restructure
commit and the right one for genuinely new code rather than a move. The
commit body for `e6257e6` also states verification was done
("Confirmed npm test/lint/build all still pass from frontend/'s new
location") — recording that you checked, not just what you changed, is
worth carrying into your own commit messages for any structural change.
