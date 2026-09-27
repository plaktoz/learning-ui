import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { NotesDashboard } from "@/components/notes/notes-dashboard";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell user={user}>
      <Suspense fallback={null}>
        <NotesDashboard />
      </Suspense>
    </AppShell>
  );
}
