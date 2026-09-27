# Structure

## Top-level layout (current)

```
CLAUDE.md                 — project description, working mode, pointers
CONTEXT.md                — project glossary (filled in as terms resolve)
steering/
  product.md              — goals, scope, non-goals
  tech.md                 — stack, runtime, testing notes
  structure.md             — this file
  learning-plan.md         — app scope, stack, 3-phase build plan, learner context
  lessons-plan.md          — lesson-by-lesson breakdown, objectives, format
  lessons/                 — per-phase best-practices notes (written once each phase exists)
    phase-1-notes.md
    phase-2-notes.md
    phase-3-notes.md
```

## App layout (added as Lesson 1 scaffolds the project)

Standard Next.js App Router shape — `app/` for routes, a components
directory for the design system + screen components, a `lib/` or `server/`
layer for data access (localStorage in Phases 1–2, Prisma client in Phase
3). Update this section with the real paths once scaffolding lands, rather
than guessing ahead of the code.

## Reference copy

A sibling folder (or separate clone) holding the always-correct, fully
working version of the app — see "Answer key" in `steering/lessons-plan.md`.
Not part of this repo's own directory tree.

## Naming conventions

- Lesson notes: `steering/lessons/phase-[n]-notes.md`
- Everything else follows standard Next.js / TypeScript convention
  (kebab-case routes, PascalCase components) once code exists
