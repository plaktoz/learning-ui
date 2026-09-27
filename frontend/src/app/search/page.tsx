import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SearchView } from "@/components/notes/search-view";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function SearchPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell user={user}>
      <SearchView />
    </AppShell>
  );
}
