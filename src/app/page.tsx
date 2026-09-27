import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { NotesDashboard } from "@/components/notes/notes-dashboard";

export default function Home() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <NotesDashboard />
      </Suspense>
    </AppShell>
  );
}
