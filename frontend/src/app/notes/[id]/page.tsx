import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { NoteEditor } from "@/components/notes/note-editor";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function NotePage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell user={user}>
      <NoteEditor noteId={id} />
    </AppShell>
  );
}
