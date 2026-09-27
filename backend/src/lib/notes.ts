import type { Note, NoteTag } from "../../generated/prisma/client";

interface SerializedNote {
  id: string;
  title: string;
  body: string;
  folderId: string | null;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

function serializeNote(note: Note & { tags: NoteTag[] }): SerializedNote {
  return {
    id: note.id,
    title: note.title,
    body: note.body,
    folderId: note.folderId,
    tagIds: note.tags.map((tag) => tag.tagId),
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export type { SerializedNote };
export { serializeNote };
