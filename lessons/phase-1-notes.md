# Phase 1 Best Practices — Scaffold, Tokens, Component Library

Self-paced read, no lesson-hours attached. Grounded in commits `2256fe4`,
`1d561fc`, `5298c46` (see [Lessons 1–3](README.md) for the walkthroughs of
this same code).

## Project structure

Next.js's App Router convention drives most of the structure decisions
here, not a house style invented for this app:

- `src/app/` — routes only. A folder = a URL segment; `page.tsx` inside it
  is what renders at that URL. `[id]` folders are dynamic segments.
- `src/components/` — grouped by *feature*, not by type. `components/notes/`,
  `components/folders/`, `components/settings/` hold screen-specific
  components; `components/ui/` holds generic, reusable primitives with no
  knowledge of notes/folders/tags at all. `components/layout/` sits
  between the two — shared shell pieces used by every screen.
- `src/lib/` — non-component code: the `Repository` interface and its
  implementations, the `AppDataProvider` context, auth helpers. If a file
  doesn't return JSX, it likely belongs here, not in `components/`.

This split is worth internalizing because it tells you *where to look
first*: a visual bug on the notes screen means start in
`components/notes/`; a "my data disappeared" bug means start in `lib/`.

## Idiomatic patterns vs. code smells

**Idiomatic — the `cn()` utility.** Every styled component
(`button.tsx`, `typography.tsx`, `nav-sidebar.tsx`) merges classes through
`cn(...)` rather than string-concatenating `className`s directly. `cn` (a
thin wrapper around `clsx`/`tailwind-merge`) resolves conflicting Tailwind
classes correctly (e.g. a caller's `text-lg` overriding a component's
default `text-sm`) in a way plain string concatenation can't — string-
concatenating both classes would leave both `text-sm` and `text-lg` in the
final class list, and which one wins becomes a CSS specificity/order
accident rather than a deliberate override. If you see raw
`className={"a " + b}` string-building anywhere, that's a smell worth
flagging.

**Idiomatic — spreading `...props`.** `function Muted({ className,
...props }: React.ComponentProps<"p">)` forwards every prop the caller
didn't explicitly destructure straight onto the underlying element. This is
why you can pass `onClick`, `id`, `data-*` attributes, anything, to any of
these primitives without their author having anticipated it. A component
that instead lists out 15 explicit named props one-by-one, forwarding each
by hand, is usually a sign someone didn't reach for this pattern.

**Smell to watch for later (previewed, not present yet in Phase 1):**
memoizing something (`useCallback`/`useMemo`) "for performance" without a
measured reason. Lessons 5–6 cover a real bug that started exactly this
way — the fact that this smell doesn't show up until Phase 2 is itself
informative: it's not a scaffolding-time mistake, it's the kind of thing
that creeps in during a later "optimization" pass.

## Error/loading/empty states

Not yet applicable to most of Phase 1's code — the component library and
tokens commits don't fetch data or handle failure paths (that starts in
Phase 2). One partial exception: `Button`'s `disabled:pointer-events-none
disabled:opacity-50` classes are the *styling* half of a disabled-state
convention every interactive primitive in this app follows consistently.

## Secrets / env vars

None yet in Phase 1 — no `.env` file exists until the backend/auth work in
Phase 3. Worth noting now so its absence doesn't seem like an oversight
later: a pure-frontend, `localStorage`-only app genuinely has no secrets to
manage.

## Git / PR hygiene

Look at `git log --oneline` for these three commits' messages:

```
2256fe4 Scaffold Next.js app (TS, Tailwind v4, shadcn/Base UI, Jest+RTL)
1d561fc Add design tokens: brand ramp, type scale, light/dark themes
5298c46 Add core component library: primitives, typography, layout shell
```

Each is one self-contained concern (scaffold, *then* tokens, *then*
components — not all three squashed together), imperative mood ("Add
design tokens," not "Added" or "Adding"), and each commit's body (run `git
show <hash>` to see it) explains *why*, not just *what* — e.g. `1d561fc`'s
body says the brand ramp replaces "shadcn's grayscale defaults," giving a
future reader the reason without needing to ask. That's the bar to hold
your own commits to: if the diff alone doesn't explain why, the message
should.
