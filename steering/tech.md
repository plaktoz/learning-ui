# Tech

Full detail lives in `steering/learning-plan.md` ("Stack", "Data + Auth").
This file tracks runtime/tooling specifics as the app gets built — update it
as each phase lands.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI primitives | shadcn |
| Styling | Tailwind CSS |
| Font | Inter |
| Persistence (Phase 1–2) | localStorage |
| Persistence (Phase 3) | Postgres via Prisma, containerized via Podman |
| Auth (Phase 3) | NextAuth |
| Hosting | Fully local — single `podman-compose.yml` + build script (app + Postgres containers) |

## Runtime

- Agent runtime: Claude Code CLI
- Shell: zsh (macOS)
- Node/npm: required once the app is scaffolded (Lesson 1)
- Podman + `podman-compose`: required from Phase 3 (Lesson 7) onward

## Testing

- Test suite is read and run, not authored from scratch — see
  `steering/lessons-plan.md` Objective list and Lessons 4–6
- Test runner/framework choice gets recorded here once Phase 1 scaffolds it

## Best-practices references

Per-phase notes on code scaffolding conventions, exception/error handling,
idiomatic-vs-code-smell recognition, secrets/env-var handling, and git/PR
hygiene — written against each phase's actual generated code:

- `steering/lessons/phase-1-notes.md`
- `steering/lessons/phase-2-notes.md`
- `steering/lessons/phase-3-notes.md`
