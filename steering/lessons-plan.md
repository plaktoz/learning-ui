# Lessons Plan: Support-Lead Code Literacy

Companion to `steering/learning-plan.md`. This file defines the lesson-by-lesson
breakdown for the learner described in that file's "Learner Context" section.

---

## Objective

Reach **support-lead code literacy** on the note-taking app — not developer
proficiency. Concretely, by the end of this plan the learner can:

- Read and trace code: given a bug report, follow it to the component/file
  most likely responsible
- Recognize common patterns on sight (a component, a hook, an API route, a
  Prisma query) without needing to study each one from scratch
- Read a diff/PR and follow the intent, even without being able to write it
- Hold enough vocabulary (state, props, hydration, route, migration, token)
  to follow an engineer's explanation without translating in their head
- Reproduce and localize a bug using a debugger, before escalating
- Make small, safe fixes themselves
- Read an existing unit test to see what behavior it documents, run the test
  suite, and read a failing test's output as part of verifying a fix

**Explicitly out of scope:** architecting new features, performance tuning,
infra/deploy ownership beyond "run it and confirm it worked," writing unit
tests from scratch, the mathematics of design-token derivation, full
accessibility-audit methodology, writing the standalone design-system
documentation site, and the portfolio write-up. These are built by the agent
so the shipped app stays presentable, but they get a one-line mention, not a
lesson.

---

## Constraints

- **1 month total**, hard cap
- **12 hours total** hands-on learner time — not per week
- Self-paced, in **90-minute lessons**, scheduled around work availability;
  little to no hands-on time expected during working hours
- The app is built via agent + copy-paste for speed — full original scope
  (3 phases, 5 screens, design system, backend migration, deploy) stays
  intact regardless of learner pace
- Lessons 5–6 (the debugging deep-dive) should be done close together —
  same day or within a day or two — since resuming mid-breakpoint after a
  long gap is costly in a way resuming a walkthrough isn't
- A parallel reference copy of the finished, correct app is maintained
  alongside the working copy for on-demand comparison (see "Answer key")

---

## Lesson format (template)

Applies to Lessons 1–4, 7, 8. Lessons 5–6 are one continuous exercise and
vary slightly (see below).

| Step | Time | Content |
|---|---|---|
| Recap | 5 min | 2–3 lines: what happened last lesson, why it matters now — makes an arbitrary gap before this lesson survivable |
| Objective | 1 sentence | "By the end of this lesson you can ___," phrased against the competency list above |
| Main activity | ~65 min | Agent builds/pastes the code; learner reads alongside with live "why this, not that" narration |
| Check-your-understanding | 10 min | 2–3 questions answered in the learner's own words (e.g. "where would you look first if a user reported X") — not multiple choice |
| Best-practices pointer | no time cost | 1 line pointing to that phase's best-practices reference (see below) |

---

## Lesson map

8 lessons × 90 min = 12 hours.

| # | Duration | Phase | Objective | Activity |
|---|---|---|---|---|
| 1 | 90 min | 1 | Read a TypeScript function signature, an `async`/`await` block, and common array methods (`.map`/`.filter`/`.find`) without stopping to look them up | Agent scaffolds the project; walk through real generated files, narrating types/async/array methods as they appear |
| 2 | 90 min | 1 | Identify a component, its props, its state, and read a Tailwind `className` without translating it in your head first | Agent builds foundational components; walk through props/state/routing/layouts; read Tailwind utility classes live off real code |
| 3 | 90 min | 1→2 | Look at any of the 5 screens and know what you're looking at; recognize a shadcn primitive vs. a custom component; explain why tokens exist instead of hardcoded colors | Tour the 5-screen structure + component library; identify shadcn Button/Input/Card usage; semantic-token-naming concept, tied to the dark-mode-bug scenario. Mention-only aside: color-scale/type-scale derivation math (agent already did this) |
| 4 | 90 min | 2 | Trace how a piece of state moves from a screen into `localStorage` and back; read a diff that touches this pattern; read an existing unit test to see what behavior it documents | Trace the dashboard's load pattern, folders/tags relations, settings save — the same pattern Lessons 5–6 use, so this primes the debugging exercise. Read a real diff/PR-style change, and the existing unit test covering the flow just traced |
| 5–6 | 180 min | 2 | Reproduce a reported bug locally, use VS Code breakpoints/step-through to localize the root cause, fix it, and verify the fix with the existing test suite | Agent plants a realistic bug in the note editor's save/load path (e.g. a stale-closure or key-mismatch bug) while persistence is still plain `localStorage` (before Phase 3's DB migration adds complexity). Learner reproduces the symptom, sets breakpoints, steps through, inspects state/call stack, localizes root cause, applies the fix. Runs the existing test suite before and after — reading the failing test's output as part of localizing the bug, and confirming the fix by seeing it pass. Reference copy available on demand — try ~20–30 min first, not enforced |
| 7 | 90 min | 3 | Build and run the full stack locally via Podman Compose, verify it's actually up and working, and recognize what a *failed* container build/start looks like | Learner runs the build script and `podman-compose up` themselves (app + Postgres containers), smoke-tests the running app. Agent also deliberately breaks one container (e.g. bad env var, Postgres not ready) so the learner sees a failure case, not just the happy path |
| 8 | 90 min | 3 | Describe, in plain terms, how data moved from `localStorage` to Postgres, and where auth fits into a request | Conceptual (not hands-on) tour of the Prisma/Postgres migration (now containerized) and NextAuth flow; final review across all lessons. Mention-only asides: a11y audit, doc site, portfolio write-up |

---

## Best-practices references

Delivered as **separate reads, zero lesson-hours** — self-paced, read
whenever/if ever wanted. One file per phase, written against that phase's
*actual generated code* (so it can't be authored until the phase exists):

- `steering/lessons/phase-1-notes.md`
- `steering/lessons/phase-2-notes.md`
- `steering/lessons/phase-3-notes.md`

Each covers: code scaffolding/project-structure conventions, exception and
error-handling patterns (try/catch, error boundaries, loading/error/empty
states), idiomatic-vs-code-smell recognition, secrets/env-var handling, and
basic git/PR hygiene — grounded in the real files that phase produced.

---

## Answer key

A parallel reference copy of the app — a sibling folder or separate clone,
not a git tag/branch — kept **always in the correct, fully-working state**
and updated in sync at each lesson checkpoint. This includes Lessons 5–6:
the reference copy holds the bug already fixed, never the planted-bug
version. Available for side-by-side comparison at any time, no git commands
required.
