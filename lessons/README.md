# Lessons — Support-Lead Code Literacy

Companion lessons for the note-taking app built in this repo. See
`steering/learning-plan.md` (app scope, stack, learner context) and
`steering/lessons-plan.md` (objectives, format, constraints) for the full
brief this content is built against.

**Goal:** support-lead code literacy, not developer proficiency. By Lesson 8
you should be able to read a bug report, find the file responsible, read a
diff and follow its intent, hold enough vocabulary to follow an engineer's
explanation unaided, and localize + fix a small bug yourself with a
debugger — not architect new features from scratch.

**You:** comfortable with programming fundamentals from Java/HTML/CSS, new
to TypeScript/React/Next.js specifically. 8 lessons × 90 minutes, self-paced,
one month. Every lesson is grounded in this repo's *actual* commits — you're
reading real diffs and real files, not toy examples.

## Lesson map

| # | Phase | Topic |
|---|---|---|
| [1](lesson-01-typescript-fundamentals/lesson-01.md) | 1 | TypeScript fundamentals: types, `async`/`await`, array methods |
| [2](lesson-02-components-props-state/lesson-02.md) | 1 | Components, props, state, Tailwind |
| [3](lesson-03-screens-tour-design-tokens/lesson-03.md) | 1→2 | The 5-screen tour, shadcn vs. custom, design tokens |
| [4](lesson-04-state-to-storage-tracing/lesson-04.md) | 2 | Tracing state → storage, reading a diff, reading a test |
| [5–6](lesson-05-06-debugging-deep-dive/lesson-05-06.md) | 2 | Debugging deep-dive: reproduce, breakpoint, localize, fix, verify |
| [7](lesson-07-podman-compose/lesson-07.md) | 3 | Podman Compose: build, run, and what failure looks like |
| [8](lesson-08-postgres-auth-tour/lesson-08.md) | 3 | Conceptual tour: Postgres migration + the auth flow |

Best-practices references (separate reads, no lesson-hours):
[Phase 1](phase-1-notes.md) · [Phase 2](phase-2-notes.md) · [Phase 3](phase-3-notes.md)

## Answer key

A finished, always-correct copy of the app lives at `../final-app/`
(sibling to this repo) — no git commands needed, just open it side-by-side
whenever you want to compare. For Lessons 5–6 specifically, it already has
the bug fixed; try localizing the bug yourself for 20–30 minutes before
peeking.

## Real commits referenced across these lessons

```
2256fe4  Scaffold Next.js app (TS, Tailwind v4, shadcn/Base UI, Jest+RTL)
1d561fc  Add design tokens: brand ramp, type scale, light/dark themes
5298c46  Add core component library: primitives, typography, layout shell
52e60e5  Add repository seam and Phase 2 screens (localStorage-backed)
87d26ee  Add repository-layer unit tests
0d0594f  Plant a stale-closure bug in note editor autosave (Lesson 5-6 start)
913a6be  Fix stale-closure autosave bug (Lesson 5-6 fix)
e6257e6  Restructure into frontend/backend/db layout
9545d93  Scaffold backend/ Next.js app with CORS helper and health route
7b90bf5  Scaffold db/ package: Prisma schema, migration, and seed script
```

Run `git show <hash>` yourself at any point — the lessons tell you when.
