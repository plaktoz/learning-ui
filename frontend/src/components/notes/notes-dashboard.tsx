"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppData } from "@/lib/app-data/app-data-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H1, Muted } from "@/components/ui/typography";

function NotesDashboard() {
  const { notes, folders, tags, loading, createNote } = useAppData();
  const searchParams = useSearchParams();
  const router = useRouter();

  const folderId = searchParams.get("folder");
  const tagId = searchParams.get("tag");
  const activeFolder = folders.find((f) => f.id === folderId);
  const activeTag = tags.find((t) => t.id === tagId);

  const visibleNotes = notes.filter((note) => {
    if (folderId && note.folderId !== folderId) return false;
    if (tagId && !note.tagIds.includes(tagId)) return false;
    return true;
  });

  const title = activeFolder
    ? activeFolder.name
    : activeTag
      ? `#${activeTag.name}`
      : "All notes";

  async function handleNewNote() {
    const note = await createNote({
      title: "Untitled",
      body: "",
      folderId: folderId ?? null,
      tagIds: tagId ? [tagId] : [],
    });
    router.push(`/notes/${note.id}`);
  }

  if (loading) {
    return <Muted>Loading…</Muted>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <H1>{title}</H1>
        <Button onClick={handleNewNote}>New note</Button>
      </div>

      {visibleNotes.length === 0 ? (
        <Muted>No notes here yet.</Muted>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleNotes.map((note) => {
            const noteTags = tags.filter((tag) =>
              note.tagIds.includes(tag.id)
            );
            return (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle>{note.title || "Untitled"}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Muted className="line-clamp-3">
                      {note.body || "No content yet."}
                    </Muted>
                    {noteTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {noteTags.map((tag) => (
                          <Badge key={tag.id} variant="secondary">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { NotesDashboard };
