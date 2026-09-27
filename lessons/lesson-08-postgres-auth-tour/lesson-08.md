# Lesson 8 — Conceptual Tour: Postgres Migration + the Auth Flow

**Phase:** 3 · **Time:** 90 min (conceptual, not hands-on) · **Grounded
in:** `db/prisma/schema.prisma`, `backend/src/lib/auth/session.ts`,
`backend/src/app/api/auth/login/route.ts`, `backend/src/lib/cors.ts`,
`frontend/src/lib/auth/current-user.ts`

## Recap

Lesson 7 got the whole stack running and taught you to recognize failure.
This final lesson is about *understanding* what's running, not operating
it further: how data moved from `localStorage` to Postgres, and how a
request proves who's making it. This lesson does not use a hand-rolled
password-and-cookie auth system built with a library like NextAuth —
everything below is built from a `User` table, `bcrypt`, and Node's own
`crypto` module, deliberately, so the mechanics stay visible instead of
disappearing into a library.

## Objective

By the end of this lesson you can describe, in plain terms, how data moved
from `localStorage` to Postgres, and where auth fits into a request.

## Main activity

### From one JSON blob to real tables

Lesson 4 showed `LocalStorageRepository` storing everything as one JSON
object under one `localStorage` key — notes, folders, tags, settings, all
crammed into a single string, with a note's `tagIds: string[]` field
holding tag references directly.

`db/prisma/schema.prisma` is the Postgres equivalent, and it's worth
reading as five separate tables rather than one blob:

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  notes    Note[]
  folders  Folder[]
  tags     Tag[]
  settings Settings?
}
```

Every other model (`Note`, `Folder`, `Tag`, `Settings`) has a `userId`
field and a `user` relation back to `User` — this is new; nothing in
`localStorage` needed a concept of "whose data is this," because
`localStorage` is already private to one browser. Postgres is shared, so
every table has to say explicitly which `User` owns each row.

**The one real structural change, not just a storage swap:** `tagIds:
string[]` (Phase 1–2) becomes a `NoteTag` join table:

```prisma
model NoteTag {
  noteId String
  tagId  String
  note Note @relation(fields: [noteId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([noteId, tagId])
}
```

Relational databases don't have a native "array of foreign keys" column —
representing a many-to-many relationship (one Note can have many Tags,
one Tag can apply to many Notes) requires a table in between holding one
row per pairing. This is a standard relational-modeling pattern, not
something specific to this app, and it's worth recognizing on sight in any
other schema you read later.

**Also worth noticing:** `onDelete: Cascade` vs. `onDelete: SetNull`.
Deleting a `Tag` cascades — its `NoteTag` rows vanish too, same as
`LocalStorageRepository.deleteTag` filtering `tagIds` by hand. Deleting a
`Folder` instead sets `Note.folderId` to `null` (`SetNull`) rather than
deleting the notes — same rule Lesson 4's cascading-delete tests documented
for `localStorage`, now enforced by the database itself instead of
application code remembering to do it.

### Where auth fits into a request

Two apps, two ports, one browser. `frontend` (port 3000) renders pages;
`backend` (port 4000) is the only thing that talks to Postgres. A request
proving "who's making it" has to survive that boundary. Follow a login,
then a page load, in order:

**1. Login** (`backend/src/app/api/auth/login/route.ts`): looks up the
`User` row by email, `bcrypt.compare`s the submitted password against the
stored `passwordHash` (bcrypt hashes are one-way — the plain password is
never stored, and comparing is done by re-hashing the input and checking
the result matches, not by decrypting anything), then sets a cookie:

```ts
response.cookies.set(SESSION_COOKIE_NAME, createSessionCookieValue(user.id), {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
});
```

`createSessionCookieValue` (`backend/src/lib/auth/session.ts`) builds the
cookie's actual content: `userId.expiresAt.signature`, where `signature`
is an HMAC (via Node's built-in `crypto`, no JWT library) over
`userId.expiresAt` using a server-only secret (`SESSION_SECRET`). Anyone
can *read* this cookie's contents, but only the server can produce a
signature that `verifySessionCookieValue` will accept — tampering with
`userId` invalidates the signature, so a forged cookie is detectable, not
just obscured.

**2. Every backend route** (e.g. `backend/src/app/api/notes/route.ts`)
calls a shared `requireUser()` helper that runs `verifySessionCookieValue`,
then looks the `userId` up in Postgres via Prisma — the literal "querying
the database directly" alternative to a session store. No session table,
no Redis — the cookie carries everything needed to re-derive identity, and
the one database round-trip confirms the user still exists.

**3. A frontend page load** (`frontend/src/app/page.tsx`) needs to know if
you're logged in *before* rendering, so it calls
`frontend/src/lib/auth/current-user.ts`:

```ts
const cookieStore = await cookies();
const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
  headers: { Cookie: cookieStore.toString() },
  cache: "no-store",
});
```

This is a **server-to-server** fetch — it runs on the frontend's own
server (inside its container, or inside `next dev`'s Node process), not in
the browser. It manually forwards the browser's `Cookie` header, because a
server-side fetch doesn't automatically carry the cookies the *browser*
holds — that's `next/headers`' `cookies()` reading the incoming request,
and the fetch call re-attaching them by hand for the outgoing one.

**4. The browser's own requests** (e.g. `frontend/src/lib/repository/api-repository.ts`'s
`fetch(...)` calls, made directly from client-side JS to `backend:4000`)
need two more things layered on: `credentials: "include"` on the fetch
call itself (tells the browser "send cookies with this cross-origin
request"), and CORS headers from `backend/src/lib/cors.ts` explicitly
allowlisting the frontend's origin with `Access-Control-Allow-Credentials:
true`. Without both sides opted in, the browser silently refuses to send
or accept the cookie cross-origin — this is a deliberate browser security
default, not a bug to work around casually.

**Footnote — `sameSite: "lax"`:** frontend and backend are different
*ports* on the same *host* (`localhost:3000` vs. `localhost:4000`).
Browsers treat that as cross-origin (for CORS purposes) but still
same-site (for cookie purposes — the "site" in `SameSite` is based on
registrable domain, not port). That's why `sameSite: "lax"` is sufficient
here and the cookie flows to both apps without needing `sameSite: "none"`
(which would additionally require `secure: true`, i.e. HTTPS, everywhere —
overkill for local dev, though real production hosting on genuinely
different domains would need to revisit this).

### Mention-only, not part of this plan's scope

An accessibility audit, a standalone design-system documentation site, and
a portfolio write-up of this project are all reasonable next steps for this
app, but they're deliberately outside what these 8 lessons cover.

## Check-your-understanding

1. If a note lost all its tags after a "cleanup" migration, and you
   suspected the `NoteTag` table, what would you check first?
2. A teammate asks "where does auth actually get checked?" — name the two
   different places (frontend and backend) it happens, and explain why
   both are necessary rather than redundant.
3. Why can't the frontend's browser-side `fetch` calls to backend rely on
   cookies being sent automatically, the way a same-origin request would?

## Best-practices pointer

See [`phase-3-notes.md`](../phase-3-notes.md) for this phase's
error-handling, secrets, and git/PR-hygiene conventions — the last of the
three best-practices references.

---

This is the last lesson. If you've worked through all 8, you've read real
scaffolding, tokens, components, a repository seam, a real diff, a real
regression test, localized and fixed a real bug with a debugger, run a
real containerized stack, and traced a real request across two apps and a
database. That's the support-lead code literacy this plan set out to reach.
