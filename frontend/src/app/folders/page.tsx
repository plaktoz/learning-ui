import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { FoldersManager } from "@/components/folders/folders-manager";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function FoldersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell user={user}>
      <FoldersManager />
    </AppShell>
  );
}
