# Phase 2 Best Practices — Repository Seam, Screens, Testing, Debugging

Self-paced read, no lesson-hours attached. Grounded in commits `52e60e5`,
`87d26ee`, `0d0594f`, `913a6be` (see [Lessons 4–6](README.md) for the
walkthroughs of this same code).

## Project structure

Nothing new structurally beyond Phase 1's conventions, but Phase 2 is where
the payoff shows up: because every screen goes through the same
`Repository` interface (`src/lib/repository/types.ts`), there was exactly
one place to add a new storage backend later (Phase 3's `ApiRepository`)
and zero screen components needed to change. This is the concrete argument
for introducing a seam even in a "just localStorage for now" app — the
seam costs a small amount of indirection up front and pays for the whole
migration later.

## Error / loading / empty states

Every screen in this phase follows the same three-state pattern. From
`notes-dashboard.tsx`:

```tsx
if (loading) {
  return <Muted>Loading…</Muted>;
}
// ...
{visibleNotes.length === 0 ? (
  <Muted>No notes here yet.</Muted>
) : (
  /* the actual grid */
)}
```

**Loading** is checked and returned *before* anything else renders — you
won't find a screen in this app that renders a half-populated grid while
data is still in flight. **Empty** is a real, deliberate branch (`No notes
here yet.` / `No folders yet` / `No tags yet` in `nav-sidebar.tsx`), not an
accidental blank space — an empty state that isn't handled explicitly tends
to render as a confusing gap rather than a clear "there's nothing here yet"
message.

**Error** is thinner in this phase than loading/empty — `LocalStorageRepository`
methods mostly only throw on a genuine programmer error (`updateNote` on a
non-existent id: ``throw new Error(`Note not found: ${id}`)``), since
`localStorage` itself basically can't fail under normal use. `NoteEditor`
does handle one real "the thing I'm looking at doesn't exist" case
explicitly:

```tsx
if (!note) {
  return (
    <div className="flex flex-col gap-3">
      <Muted>This note doesn&apos;t exist anymore.</Muted>
      <Button variant="outline" onClick={() => router.push("/")}>Back to all notes</Button>
    </div>
  );
}
```

Compare this to Phase 3's `ApiRepository`, where every method genuinely can
fail (network down, 401, 500) — that's where a *real* try/catch-shaped
error path becomes necessary (see `phase-3-notes.md`).

## Idiomatic patterns vs. code smells — the stale closure, in general terms

Lessons 5–6 walked through one specific bug in detail. The generalizable
lesson: **`useCallback`/`useMemo` don't make a function's logic safer or
more correct — they only control how often its *identity* changes.** Adding
one is a tool for controlling downstream re-renders/effect-reruns, not a
default "wrap things for performance" habit. The planted bug
(`0d0594f`) is the canonical shape of the mistake: memoizing a function
with a dependency array that's *missing* something the function's body
actually reads (`title`/`body`) produces a function that silently keeps
using old values forever, instead of erroring — which is exactly why it's
dangerous. ESLint's `react-hooks/exhaustive-deps` exists specifically to
catch this category of mistake; treat its warnings as close to
non-negotiable, not stylistic noise.

## Testing conventions

`local-storage-repository.test.ts` and `note-editor.test.tsx` establish two
different testing levels worth telling apart:

- **Repository tests** call the `Repository` interface directly, with no
  React involved at all — pure logic tests against a real (jsdom-backed)
  `localStorage`.
- **Component tests** (`note-editor.test.tsx`) render the actual component
  tree via React Testing Library and drive it with simulated user input
  (`userEvent.type`), then assert against the *repository* the component
  is wired to — not against the DOM. This is deliberate: it tests the same
  observable behavior a real user/bug-report would care about ("did my
  typing get saved") rather than implementation details.

Test names in this codebase are written as full sentences describing a
guarantee (`"persists what the user actually typed, not a stale snapshot
from when the autosave timer was created"`) — written, in fact, as if
anticipating the exact bug that would be planted next. Naming a test after
the *guarantee*, not the *method under test*, is what makes a failing
test's output useful on its own, without opening the test file.

## Secrets / env vars

Still none — `localStorage` remains the only persistence layer through the
end of Phase 2.

## Git / PR hygiene — the plant/fix pair, and why it's an exception

```
0d0594f Plant a stale-closure bug in note editor autosave (Lesson 5-6 start)
913a6be Fix stale-closure autosave bug (Lesson 5-6 fix)
```

**This pair is a deliberate lesson artifact, not a model for real work.**
In a real PR history, you would never see a commit that knowingly
introduces a bug followed by a separate commit fixing it — that's only
here because Lessons 5–6 need a concrete "before" state to debug against.
What *is* worth modeling from these two commits: each one's message states
its mechanism precisely (`0d0594f`'s body names the exact dependency-array
change and predicts its exact consequence, before the bug was ever
"discovered") — that level of precision is what a good bug-fix commit
message looks like even outside a teaching context: not just "fix bug" but
what the bug actually was and why the fix addresses it.
