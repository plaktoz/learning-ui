import * as React from "react";
import Link from "next/link";

function AppShell({
  sidebar,
  children,
}: {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
        <Link href="/" className="text-sm font-semibold text-foreground">
          Notes
        </Link>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {sidebar ? (
          <aside className="w-56 shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar px-3 py-4 text-sidebar-foreground">
            {sidebar}
          </aside>
        ) : null}
        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

export { AppShell };
