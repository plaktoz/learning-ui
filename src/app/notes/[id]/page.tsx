import { AppShell } from "@/components/layout/app-shell";
import { NoteEditor } from "@/components/notes/note-editor";

export default async function NotePage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;

  return (
    <AppShell>
      <NoteEditor noteId={id} />
    </AppShell>
  );
}
