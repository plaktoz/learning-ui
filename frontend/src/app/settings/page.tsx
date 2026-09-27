import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsView } from "@/components/settings/settings-view";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell user={user}>
      <SettingsView />
    </AppShell>
  );
}
