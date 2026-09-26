# Learning Plan: Frontend Development with React + Design System

## Project

**App:** Note-taking app, designed as a real product for a broader audience.

**Purpose:** Learn frontend development with React, TypeScript, Next.js, and shadcn — and build a design language system from scratch.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI primitives | shadcn |
| Styling | Tailwind CSS |
| Font | Inter |
| Hosting | Vercel (Phase 3) |

---

## App Scope

**5 screens:**
1. Notes list / dashboard
2. Note editor
3. Folders + tags
4. Search
5. Settings

---

## Design System Decisions

- Tokens designed from scratch (not shadcn defaults)
- Brand color derived as the first design exercise — full 50–900 scale
- Semantic token naming (e.g. `--color-background`, not `--color-white`)
- Typography scale built on Inter
- Light + dark mode supported from day one
- Spacing scale defined before first component

---

## Data + Auth

| Phase | Persistence | Auth |
|---|---|---|
| 1–2 | localStorage | None |
| 3 | Postgres via Prisma + Supabase | NextAuth or Supabase Auth |

---

## 3-Phase Plan

### Phase 1 — Month 1: Foundations + Design System

**Goal:** Understand the stack and build the design system before touching the app.

| Week | Focus |
|---|---|
| 1 | JavaScript + TypeScript fundamentals (types, functions, async/await, array methods) |
| 2 | React fundamentals + Next.js App Router (components, props, state, routing, layouts) |
| 3 | Design tokens: color scale, type scale, spacing scale — Tailwind config + shadcn wired to tokens |
| 4 | Core component library: Button, Input, Card, Badge, Typography, Layout |

**Deliverable:** A living design system with documented tokens and reusable components.

---

### Phase 2 — Month 2: Build the App

**Goal:** Build all 5 screens using the design system, wired together with localStorage.

| Week | Focus |
|---|---|
| 1 | Notes list / dashboard + note editor |
| 2 | Folders + tags screen |
| 3 | Search screen |
| 4 | Settings screen + end-to-end wiring + dark mode QA |

**Deliverable:** Fully functional note-taking app running locally, data in localStorage.

---

### Phase 3 — Month 3: Polish + Ship

**Goal:** Production-ready app with a real backend and a public design system reference.

| Week | Focus |
|---|---|
| 1 | Accessibility audit + responsive design + empty/error/loading states |
| 2 | Database migration: Postgres via Prisma + Supabase; add auth |
| 3 | Design system documentation site (built with the same stack) |
| 4 | Deploy to Vercel; final QA and portfolio write-up |

**Deliverable:** Shipped product + public design system reference site.

---

## Learner Context

- Background: Python (backend), no prior JavaScript or TypeScript experience
- Learning mode: Agentic — agent handles scaffolding and boilerplate; learner directs, reviews, and understands decisions
- Pace: ~1 month per phase, with agentic acceleration
