# Product

## What this is

A note-taking app, built as the hands-on vehicle for a support-lead code
literacy program. See `steering/learning-plan.md` for full scope and
`steering/lessons-plan.md` for the learner-facing lesson plan.

## Goals

- Real product shape: 5 screens, a design system built from scratch, a
  backend migration — not a toy/tutorial app
- Every phase produces something a learner can read real, working code
  against — no scaffolding-only or mocked-out steps
- Fast to build (agent + copy-paste) so lesson time goes to comprehension,
  not typing

## Non-goals

- Not aiming for production users or a real audience — it's a learning
  artifact
- Not teaching the learner to write production code solo — see "Explicitly
  out of scope" in `steering/lessons-plan.md`
- No multi-role review/approval process for this build — see `CLAUDE.md`

## Success criteria

The learner can, in 12 hours across 1 month: read and trace the app's code,
recognize its component/hook/API-route/query patterns, read a diff against
it, reproduce and localize a planted bug with a debugger, and make small
safe fixes — without having written most of the app themselves.
