# Lesson 4 — Tracing State → Storage, Reading a Diff, Reading a Test

**Phase:** 2 · **Time:** 90 min · **Grounded in commits:** `52e60e5`, `87d26ee`

## Recap

Lesson 3 was a tour of the finished screens and where their visual language
comes from. This lesson goes underneath the screens: where does the data
they show actually live, and how does a change in the UI end up saved?
This is the exact pattern Lessons 5–6's debugging exercise depends on, so
take the trace seriously.

## Objective

By the end of this lesson you can trace how a piece of state moves from a
screen into storage and back, read a diff that touches this pattern, and
read an existing unit test to see what behavior it documents.

## Main activity

### The seam: `Repository`

Run `git show 52e60e5 --stat`. This one commit adds the `Repository`
interface, its `localStorage`-backed implementation, an `AppDataProvider`
context wrapping it, and all 5 Phase 2 screens at once — it's the biggest
single commit in the project's history, and it's worth reading as one
connected idea rather than 18 separate files.

`frontend/src/lib/repository/types.ts` defines the contract:

```ts
export interface Repository {
  listNotes(): Promise<Note[]>;
  createNote(input: NoteInput): Promise<Note>;
  updateNote(id: string, input: Partial<NoteInput>): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  // ...folders, tags, settings, same shape
}
```

Nothing in this interface says *how* a note gets stored — no mention of
`localStorage`, no mention of a database. That's the point: it's a seam.
`frontend/src/lib/repository/local-storage-repository.ts` is *one*
implementation of it:

```ts
async updateNote(id: string, input: Partial<NoteInput>): Promise<Note> {
  const state = readState();
  const note = state.notes.find((n) => n.id === id);
  if (!note) throw new Error(`Note not found: ${id}`);
  Object.assign(note, input, { updatedAt: new Date().toISOString() });
  writeState(state);
  return note;
}
```

`readState()`/`writeState()` (top of the same file) just JSON-parse/stringify
a single `localStorage` key. Nothing fancy — the entire "database" is one
string in the browser.

Now open `frontend/src/lib/repository/api-repository.ts` (built later, in
Phase 3) and look at its `updateNote`:

```ts
async updateNote(id: string, input: Partial<NoteInput>): Promise<Note> {
  const { note } = await request<{ note: Note }>(`/api/notes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return note;
}
```

Completely different implementation — one talks to `localStorage`, the
other makes an HTTP call to a separate backend — but identical shape:
same method name, same parameters, same return type. Every screen calls
`updateNote` through `useAppData()` and has *no idea* which implementation
is behind it. This is why the Phase 3 migration (Lesson 8) could swap
storage engines without touching a single screen component.

### Tracing one piece of state end to end

Follow "renaming a folder" all the way through, in this order:

1. **UI:** `frontend/src/components/folders/editable-row.tsx` — the input
   the user types into.
2. **Context call:** `frontend/src/lib/app-data/app-data-provider.tsx`'s
   `renameFolder`:
   ```ts
   const renameFolder = React.useCallback(
     async (id: string, name: string) => {
       const folder = await repository.renameFolder(id, name);
       setFolders((prev) => prev.map((f) => (f.id === id ? folder : f)));
       return folder;
     },
     [repository]
   );
   ```
3. **Repository call:** `local-storage-repository.ts`'s `renameFolder` —
   mutates the folder in place, writes the whole state object back to
   `localStorage`.
4. **Back up to the UI:** `setFolders((prev) => prev.map(...))` produces a
   *new* array (remember Lesson 1's `.map` — it never mutates `prev`) and
   hands it to React, which re-renders every component reading `folders`
   from `useAppData()` — the sidebar, the folders screen, anywhere else.

Notice step 2 does two things: call the repository, *and* update React
state with the result. If it only did the first, the UI would never
re-render — `localStorage` changing doesn't itself make React re-render
anything. This "write, then explicitly sync local state to match" pattern
repeats for every single action in `app-data-provider.tsx`. Once you've
traced `renameFolder`, you've effectively read all 13 of them.

### Reading the diff

`git show 52e60e5` (full, not `--stat`) shows the whole commit's diff. Look
specifically at the hunk in `src/app/page.tsx` — lines removed vs. added.
A `-` line is what existed before; a `+` line is what replaced it. Reading
a diff is reading "the delta," not "the final state" — you're watching one
decision get made (in this case, replacing a placeholder home page with the
real dashboard route file), not reading a whole file from scratch. This is
the skill you'll use constantly reviewing real PRs: skim the `-`/`+` pairs
first to see *what changed*, then read the surrounding unchanged context
only if the change itself doesn't make sense in isolation.

### Reading an existing test

`git show 87d26ee` adds `frontend/src/lib/repository/local-storage-repository.test.ts`.
Open the real file now and read this block:

```ts
it("persists across repository instances (survives reload)", async () => {
  const repo = createRepository();
  const note = await repo.createNote({ title: "Reload me", body: "" });

  const reloaded = createRepository();
  expect(await reloaded.getNote(note.id)).toEqual(note);
});
```

Read a test's *name* first (`it("...")`) — it's a sentence describing a
guarantee the code makes, in this case "if you create a `LocalStorageRepository`
instance and throw it away, a brand-new instance can still find what you
saved." The body proves it: two independent `repo`/`reloaded` objects,
same underlying `localStorage`. This test would fail immediately if
someone "optimized" the repository to cache notes in a JS variable instead
of always reading fresh from `localStorage` — which is exactly the kind of
regression a test suite exists to catch before a user does. Also open the
cascading-delete tests further down the same file (`deleteFolder` /
`deleteTag`) — they document a rule you might not otherwise notice just
reading the implementation: deleting a folder sets its notes' `folderId`
to `null` rather than deleting the notes themselves.

## Check-your-understanding

1. If a bug report said "renaming a tag doesn't update the sidebar until I
   refresh the page," which of the 4 steps above would you check first,
   and why?
2. Why does `updateNote` on `ApiRepository` and on `LocalStorageRepository`
   need to have the exact same method signature?
3. Pick one test name from `local-storage-repository.test.ts` you haven't
   read yet. Based on the name alone, guess what it verifies — then open it
   and check.

## Best-practices pointer

See [`phase-2-notes.md`](../phase-2-notes.md) for error-handling and
loading/empty-state conventions from this phase's screens.
