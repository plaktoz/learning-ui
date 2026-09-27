import { AppShell } from "@/components/layout/app-shell";
import { FoldersManager } from "@/components/folders/folders-manager";

export default function FoldersPage() {
  return (
    <AppShell>
      <FoldersManager />
    </AppShell>
  );
}
