"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/lib/app-data/app-data-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { badgeVariants } from "@/components/ui/badge";
import { Muted, Small } from "@/components/ui/typography";
import { cn } from "cn";

const AUTOSAVE_DELAY_MS = 800;

function NoteEditor({ noteId }: { noteId: string }) {
  const { notes, folders, tags, loading, updateNote, deleteNote } =
    useAppData();
  const router = useRouter();
  const note = notes.find((n) => n.id === noteId);

  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  // Tracks which note's content is currently loaded into title/body, so we
  // only reseed local state when the user navigates to a different note —
  // not on every re-render caused by unrelated app-data changes.
  const loadedNoteId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!note || loadedNoteId.current === note.id) return;
    loadedNoteId.current = note.id;
    setTitle(note.title);
    setBody(note.body);
  }, [note]);

  React.useEffect(() => {
    // Guards against saving before this note's content has been loaded, and
    // against saving into a note that no longer exists. Deliberately keyed
    // on noteId/updateNote (both stable) rather than the `note` object,
    // whose reference changes on every save — depending on it here would
    // restart the debounce timer on every save and never let it settle.
    if (loadedNoteId.current !== noteId) return;
    const timeoutId = setTimeout(() => {
      updateNote(noteId, { title, body });
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [title, body, noteId, updateNote]);

  function toggleTag(tagId: string) {
    if (!note) return;
    const nextTagIds = note.tagIds.includes(tagId)
      ? note.tagIds.filter((id) => id !== tagId)
      : [...note.tagIds, tagId];
    updateNote(noteId, { tagIds: nextTagIds });
  }

  async function handleDelete() {
    if (!window.confirm("Delete this note? This can't be undone.")) return;
    await deleteNote(noteId);
    router.push("/");
  }

  if (loading) {
    return <Muted>Loading…</Muted>;
  }

  if (!note) {
    return (
      <div className="flex flex-col gap-3">
        <Muted>This note doesn&apos;t exist anymore.</Muted>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to all notes
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Untitled"
          className="h-10 border-none px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
        />
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          Delete
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <Small className="text-muted-foreground">Folder</Small>
          <select
            value={note.folderId ?? ""}
            onChange={(event) =>
              updateNote(noteId, { folderId: event.target.value || null })
            }
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">No folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </label>

        {tags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <Small className="text-muted-foreground">Tags</Small>
            {tags.map((tag) => {
              const active = note.tagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    badgeVariants({ variant: active ? "default" : "outline" }),
                    "cursor-pointer"
                  )}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Start writing…"
        className="min-h-[60vh] border-none px-0 text-base shadow-none focus-visible:ring-0"
      />
    </div>
  );
}

export { NoteEditor };
