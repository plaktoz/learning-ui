import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { NavSidebar } from "@/components/layout/nav-sidebar";
import { SignOutButton } from "@/components/layout/sign-out-button";
import type { CurrentUser } from "@/lib/auth/current-user";

function AppShell({ children, user }: { children: React.ReactNode; user: CurrentUser }) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
        <Link href="/" className="text-sm font-semibold text-foreground">
          Notes
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar px-3 py-4 text-sidebar-foreground">
          <Suspense fallback={null}>
            <NavSidebar />
          </Suspense>
        </aside>
        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

export { AppShell };
