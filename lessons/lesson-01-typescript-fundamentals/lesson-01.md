# Lesson 1 — TypeScript Fundamentals

**Phase:** 1 · **Time:** 90 min · **Grounded in commit:** `2256fe4`

## Recap

There's no prior lesson — this is the beginning. The app doesn't exist yet;
this lesson is the moment it's scaffolded into existence, so you're reading
the first commit's files exactly as they were generated.

## Objective

By the end of this lesson you can read a TypeScript function signature, an
`async`/`await` block, and the common array methods (`.map`/`.filter`/`.find`)
without stopping to look them up.

## Main activity

Run `git show 2256fe4 --stat` yourself to see the full file list — this is
the scaffold: Next.js 16 (App Router, `src/` dir), Tailwind v4, shadcn
(Base UI primitives), Jest + React Testing Library. 14,000 of those inserted
lines are `package-lock.json`; ignore it. The files worth reading are small
and few, which is exactly why this is the right lesson to start on them.

### Types: the thing Java already prepared you for

`src/lib/utils.ts` (one line) and `src/components/ui/button.tsx` are your
first look. TypeScript's types are structurally the same idea as Java's —
a `string` is a `string`, an interface describes a shape — just with
different syntax and, crucially, **erased at runtime**: TypeScript compiles
to plain JavaScript, and none of the types exist anymore once your code
runs. They only ever protect you at compile/edit time.

Compare this against the final `Repository` interface — it doesn't exist
yet in this commit, but you'll meet it in Lesson 4
(`frontend/src/lib/repository/types.ts`):

```ts
export interface Note {
  id: string;
  title: string;
  body: string;
  folderId: string | null;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

Read this like a Java field list: `id: string` is "a field called `id`,
of type `string`" — same shape as `private String id;`, just no visibility
modifier and no semicolon-per-declaration. The one new thing:
`folderId: string | null`. That `|` is a **union type** — "this value is
either a `string` or literally `null`, and the compiler will make you
prove which one you're holding before you use it as a string." Java has no
direct equivalent (its `null` can silently hide inside *any* reference type);
TypeScript makes the possibility of `null` part of the type itself, so
forgetting to check for it is a compile error, not a 2am `NullPointerException`.

`tagIds: string[]` — an array of strings. Same square-bracket syntax Java
uses for array *types*, though in practice you'll see `Array<string>` far
less often than the shorthand `string[]`.

### `async`/`await`: promises, not threads

Open `src/app/page.tsx` from this commit (`git show 2256fe4:src/app/page.tsx`
if you want the exact original, since it's since been rewritten). It's a
plain function component — no `async` yet at this point in the scaffold. For
`async`/`await` grounded in this app's real code, jump ahead to
`frontend/src/lib/repository/local-storage-repository.ts` (built in Lesson 4,
but fine to peek at now):

```ts
async createNote(input: NoteInput): Promise<Note> {
  const state = readState();
  const now = new Date().toISOString();
  const note: Note = { id: crypto.randomUUID(), ...input, createdAt: now, updatedAt: now };
  state.notes.push(note);
  writeState(state);
  return note;
}
```

`async` in front of a function means "this function returns a `Promise`,
even though the `return note;` line looks like it returns a plain `Note`."
A `Promise<Note>` is a box that will eventually contain a `Note` — the
JavaScript equivalent of Java's `Future<Note>`, but far more central to how
the language is used day-to-day (almost anything involving the network,
disk, or timers returns a Promise). `await` is how you open that box and
get the real value out — but only inside another `async` function.

Crucially: **this is not multithreading.** JavaScript runs on a single
thread. `async`/`await` doesn't create parallelism; it's a way of pausing
one piece of code without blocking everything else, more like Java's
`CompletableFuture` chaining than like spawning a `Thread`. That's why you'll
never see a `synchronized` keyword or a mutex anywhere in this codebase —
there's no shared-memory race to guard against in the way there is in Java.

### Array methods: no more for-loops

You'll see `.map`, `.filter`, and `.find` constantly. All three take a
function as an argument and run it against every element — this pattern
(passing a function as a value) is called a **callback**, and it's used far
more pervasively in JS/TS than in Java, where you'd more often reach for an
explicit loop or a stream pipeline. Grounded example, from
`frontend/src/components/notes/notes-dashboard.tsx` (built in Lesson 4):

```ts
const visibleNotes = notes.filter((note) => {
  if (folderId && note.folderId !== folderId) return false;
  if (tagId && !note.tagIds.includes(tagId)) return false;
  return true;
});
```

Read `.filter` as "give me a new array containing only the elements where
this function returns `true`." It's the direct analogue of Java's
`stream().filter(...)`. `.map` is "give me a new array with each element
transformed"; `.find` is "give me the first element where this function
returns `true`, or `undefined` if none match." None of them mutate the
original array — `notes` is untouched; `visibleNotes` is a new one. That
immutability habit matters a lot in React, which you'll see in Lesson 2.

## Check-your-understanding

1. In `folderId: string | null`, what would the TypeScript compiler
   complain about if you wrote `folderId.length` without checking for
   `null` first?
2. What's the actual difference between `async function foo() { return 5; }`
   calling it and getting `5` back directly?
3. Given `notes.find((n) => n.id === "abc")`, in your own words: what does
   this line do, and what's returned if no note has that id?

## Best-practices pointer

See [`phase-1-notes.md`](../phase-1-notes.md) for scaffolding/project-structure
conventions from this same commit.
