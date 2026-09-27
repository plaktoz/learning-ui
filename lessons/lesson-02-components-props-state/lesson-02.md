# Lesson 2 — Components, Props, State, and Tailwind

**Phase:** 1 · **Time:** 90 min · **Grounded in commit:** `5298c46`

## Recap

Lesson 1 covered types, `async`/`await`, and array methods off the bare
scaffold. This lesson moves to the first real UI code: the component
library commit that gives every screen its building blocks.

## Objective

By the end of this lesson you can identify a component, its props, its
state, and read a Tailwind `className` without translating it in your head
first.

## Main activity

Run `git show 5298c46 --stat` — this commit adds shadcn/Base UI primitives
(`Input`, `Textarea`, `Card`, `Badge`, `Label`, `Separator`) next to the
existing `Button`, a from-scratch `Typography` module, and an `AppShell`
layout component.

### A component is a function that returns markup

Open `frontend/src/components/ui/typography.tsx`:

```tsx
function Muted({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
```

A React component is just a function. `Muted` takes one argument (an
object) and returns JSX — that HTML-looking syntax mixed into TypeScript.
There's no separate template file, no separate CSS file for this
component; markup, logic, and styling all live in the same function. This
will feel unfamiliar coming from HTML/CSS's file-per-concern habit, but
it's deliberate: the styling and the markup that uses it never drift out of
sync because they're never apart.

### Props: the function's parameters, nothing more

`{ className, ...props }: React.ComponentProps<"p">` is destructuring —
pulling `className` out by name, and gathering everything else into
`props`. `React.ComponentProps<"p">` means "whatever attributes a plain
HTML `<p>` tag accepts" (borrowed straight from `React.ComponentProps<"p">`'s
type definition — TypeScript already knows every valid `<p>` attribute).
**Props are just parameters.** When you use `<Muted>Loading…</Muted>`
somewhere, `Loading…` becomes `props.children` — implicit, but still just
a parameter.

Look at `Button` (`frontend/src/components/ui/button.tsx`) for props with
actual choices attached:

```tsx
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
```

`variant = "default"` is a default parameter value — same concept as a
Java overload with a sensible default, just inline. `variant` can be
`"default" | "outline" | "secondary" | "ghost" | "destructive" | "link"` —
defined a few lines up in the `cva(...)` call, which maps each variant name
to a string of Tailwind classes. Calling `<Button variant="destructive">`
picks the destructive class string; that's the entire mechanism — no CSS
classes to hunt down by hand, no `!important` wars.

### State: the thing that makes a component "remember"

Props flow in from a parent; **state** is a component's own memory,
declared with `React.useState`. Nothing in this commit has state yet — the
component library is stateless by design (a `Button` doesn't need to
remember anything). You'll meet real state in `frontend/src/components/notes/note-editor.tsx`
(built two commits later, previewed here since it's the clearest example):

```tsx
const [title, setTitle] = React.useState("");
```

Read this as: `title` is the current value; `setTitle` is the *only*
sanctioned way to change it. Calling `setTitle("new value")` doesn't just
mutate a variable — it tells React "re-render this component with the new
value." This is the single most important habit to unlearn from
imperative HTML/JS: you never manually reach into the DOM and change text
yourself (`document.getElementById(...).innerText = ...`); you change
state, and React updates the DOM for you. Fighting this (reaching around
React to mutate the DOM directly) is one of the most common sources of bugs
in React code — including, as you'll see in Lessons 5–6, a *closure* bug
that's really about state going stale, not the DOM.

### `AppShell`: composition over configuration

`frontend/src/components/layout/app-shell.tsx`'s job (as of this commit) is
a top bar + content area that later commits plug real navigation into.
This is **composition**: instead of `AppShell` taking twenty props to
configure every possible header button, it takes `children` — the caller
just puts whatever they want inside. You'll see the same pattern in
Lesson 3's tour of the 5 screens.

### Tailwind: reading `className` without translating it

Every class in a Tailwind `className` string is a single, fixed CSS rule.
`text-sm text-muted-foreground` is not one thing — it's two independent
utility classes: `text-sm` sets `font-size`/`line-height` per this app's
type scale (Lesson 3 covers where that scale comes from), `text-muted-foreground`
sets the text color to a *semantic* color token (also Lesson 3). Once you
know the handful of prefixes this codebase actually uses —
`flex`/`grid` (layout), `gap-*`/`px-*`/`py-*` (spacing), `text-*` (typography),
`bg-*`/`text-*`/`border-*` (color, always via a token name, never a raw hex),
`rounded-*` (corners), `hover:*`/`focus-visible:*`/`disabled:*` (state
variants) — you can read most `className` strings left to right as a list
of small, independent facts about that one element, rather than a
monolithic style block to decode.

## Check-your-understanding

1. In your own words: what's the difference between a prop and a piece of
   state? Which one can a parent component control directly?
2. If you saw `<Button variant="outline" size="sm">Cancel</Button>` in a
   file you'd never opened before, what would you expect it to look like
   without running the app?
3. Why does `AppShell` take `children` instead of, say, a `headerButtons`
   prop and a `sidebarContent` prop?

## Best-practices pointer

See [`phase-1-notes.md`](../phase-1-notes.md) for idiomatic-vs-code-smell
patterns and project structure from this phase.
