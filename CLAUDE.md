@AGENTS.md

# Note-Taking App — Learning Project

This repo builds a note-taking app (Next.js + TypeScript + shadcn + Tailwind,
custom design system, localStorage → Postgres/Prisma, NextAuth, Podman) as
the vehicle for a structured learning plan.

The two documents that define this project:

- `steering/learning-plan.md` — the app scope, stack, and 3-phase build plan
- `steering/lessons-plan.md` — the lesson-by-lesson breakdown, objectives,
  and format for the learner (see its "Learner Context" section in
  `learning-plan.md` for who this is for and why)

## Working mode

Code is written directly — scaffolded and pasted in by the agent for speed,
narrated live against the lessons plan. There is no multi-role pipeline, no
approval gates, and no `state.md`/`log.md` blackboard for this project: it's
a solo learning build, not a governed SDLC process.

`CONTEXT.md` holds the project's domain vocabulary (Note, Folder, Tag, etc.)
— consult it and keep it current as terms get resolved.

## Dev commands

- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Test: `npm test`
- Local Postgres + app stack: `scripts/build-and-run.sh` (wraps
  `podman-compose build && podman-compose up`)
