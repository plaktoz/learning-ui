# Lessons 5–6 — Debugging Deep-Dive: Reproduce, Localize, Fix, Verify

**Phase:** 2 · **Time:** 180 min (one continuous session — see the note in
`steering/lessons-plan.md` about doing these close together) · **Grounded
in commits:** `0d0594f` (the bug) and `913a6be` (the fix)

This lesson pair doesn't follow the standard template — it's one continuous
exercise. Read the whole thing before touching a debugger.

## Recap

Lesson 4 traced how `NoteEditor` autosaves: type into the title/body inputs,
a `setTimeout` debounce fires 800ms after the last keystroke, and it calls
`updateNote` from `useAppData()`. That trace is the entire mental model you
need for this bug — it lives exactly in that debounce effect.

## Objective

By the end of this lesson pair you can reproduce a reported bug locally, use
VS Code breakpoints/step-through to localize the root cause, fix it, and
verify the fix with the existing test suite.

## The bug report

*(This is the framing to read as if a real user filed it — don't jump to
the diff yet.)*

> "I opened a note, typed a new title, waited a few seconds, then kept
> typing more. When I came back later, only my first few words were saved —
> everything I typed after that was gone, even though I definitely waited
> long enough for autosave."

## Step 1 — Reproduce it yourself (attempt this before reading further)

Check out the planted-bug state: `git checkout 0d0594f -- src/components/notes/note-editor.tsx`
(or, in the restructured repo, checkout that path under `frontend/`). Run
the dev server, open a note, and try to reproduce the report exactly: type
something, wait ~1 second, type more. Reload the page. Is the second batch
of text there?

If you want to try it under real conditions first, don't read Step 2 yet —
the point of a debugger is finding this without already knowing the answer.
Give yourself 20–30 minutes. The answer key (`../final-app/`) already has
the *fixed* version if you want to compare behavior side-by-side, but
resist opening its source until after you've tried localizing this
yourself.

## Step 2 — Read the failing test's output first

Before reaching for breakpoints, run the test suite — this is often the
fastest way to localize a bug, and it's explicitly part of the objective.
`0d0594f` added `frontend/src/components/notes/note-editor.test.tsx`
alongside the bug (this is realistic: the regression test usually lands as
part of the same investigation, not before it). Run:

```
npm test -- note-editor
```

Read the failure output top to bottom: it types `"First edit"`, waits for
the repository to hold `"First edit"` — passes — then types `" plus more"`
and asserts the repository ends up holding `"First edit plus more"`. **That
second assertion is where it fails.** This alone tells you a lot: the
*first* save works, so autosave isn't fundamentally broken. Something stops
it from saving *again* after the first save. That's your working hypothesis
going into the debugger.

## Step 3 — Set breakpoints and step through

Open `.vscode/launch.json` — added in this same commit — and use "Next.js:
debug server-side" (or "debug full stack" if you want the browser attached
too). Set a breakpoint inside the `setTimeout` callback in
`note-editor.tsx`'s debounce `useEffect`, and another one right at the top
of the `useEffect` itself (the one that calls `setTimeout`).

Reproduce the bug under the debugger: type, wait, type again. Watch how
many times the *outer* `useEffect` body runs (it should log/hit the
breakpoint once per keystroke, if it's working correctly) versus how many
times the `setTimeout` *callback* actually fires and calls `updateNote`.
Inspect the callback's closure — in the debugger's variables pane, check
what `title`/`body` actually equal at the moment it fires, versus what's
currently in the input on screen.

## Step 4 — Read the diff and localize the exact line

Now read the actual change: `git show 0d0594f -- src/components/notes/note-editor.tsx`
(or the frontend-relative path). The relevant hunk:

```diff
+  const saveNote = React.useCallback(() => {
+    updateNote(noteId, { title, body });
+  }, [noteId, updateNote]);
+
   React.useEffect(() => {
     if (loadedNoteId.current !== noteId) return;
-    const timeoutId = setTimeout(() => {
-      updateNote(noteId, { title, body });
-    }, AUTOSAVE_DELAY_MS);
+    const timeoutId = setTimeout(saveNote, AUTOSAVE_DELAY_MS);
     return () => clearTimeout(timeoutId);
-  }, [title, body, noteId, updateNote]);
+  }, [noteId, saveNote]);
```

Here's the mechanism, in plain terms: `saveNote` is created once via
`useCallback`, and its dependency array is `[noteId, updateNote]` — neither
of which changes as you type. So `saveNote` itself is a **frozen snapshot**:
the `title`/`body` it closes over are whatever they were the *first* time
this component rendered with this `noteId`, not whatever's currently on
screen. That's a **stale closure** — a function that captured old values and
never lets go of them.

The `useEffect` below only reschedules its timer when something in its own
dependency array changes. Its array is now `[noteId, saveNote]` — and since
`saveNote`'s identity never changes either (same reasoning), the effect
runs exactly once, on mount, schedules exactly one save, and never runs
again as you keep typing. The original code depended on `[title, body,
noteId, updateNote]` — every keystroke changed `title` or `body`, which
re-ran the effect, canceled the pending timer (`clearTimeout` in the
cleanup function), and scheduled a fresh one closing over the *current*
`title`/`body`. Dropping `title`/`body` from the dependency array didn't
just silence a lint warning — it broke the entire rescheduling mechanism
the debounce depends on.

**Worth noticing on your own, if you haven't already:** ESLint's
`react-hooks/exhaustive-deps` rule would have flagged this dependency array
as incomplete. This is exactly the kind of warning it's tempting to
silence or ignore — this bug is what "ignore it" costs.

## Step 5 — Apply the fix

`913a6be` is a pure revert of the hunk above: delete the `saveNote`
`useCallback`, put the `setTimeout` body back inline inside the `useEffect`,
and restore `[title, body, noteId, updateNote]` as its dependency array.
Make that exact change yourself rather than just checking out the commit —
typing it is part of the exercise.

## Step 6 — Verify

Run `npm test -- note-editor` again. Both assertions should now pass. Then
re-run the manual reproduction from Step 1 by hand: type, wait, type more,
reload — the full text should now be there.

## Check-your-understanding

1. In your own words, what is a "stale closure," and why did wrapping
   `saveNote` in `useCallback` create one here?
2. The bug report said "only my first few words were saved" — why did the
   *first* save work at all, if the bug broke autosave?
3. If `react-hooks/exhaustive-deps` had been configured as an error instead
   of a warning, would this bug have shipped? What does that suggest about
   how your team should treat that specific lint rule?

## Best-practices pointer

See [`phase-2-notes.md`](../phase-2-notes.md) for more on `useEffect`
dependency-array conventions and why this codebase prefers a plain
`useEffect` over memoized callbacks for anything timer-based.
