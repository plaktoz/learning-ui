"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppData } from "@/lib/app-data/app-data-provider";
import { cn } from "cn";
import { Muted } from "@/components/ui/typography";

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block truncate rounded-md px-2 py-1 text-sm",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      {children}
    </Link>
  );
}

function NavSidebar() {
  const { folders, tags } = useAppData();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFolderId = searchParams.get("folder");
  const activeTagId = searchParams.get("tag");

  return (
    <nav className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <NavLink
          href="/"
          active={pathname === "/" && !activeFolderId && !activeTagId}
        >
          All notes
        </NavLink>
        <NavLink href="/search" active={pathname === "/search"}>
          Search
        </NavLink>
      </div>

      <div className="flex flex-col gap-1">
        <Muted className="px-2 text-xs font-medium uppercase tracking-wide">
          Folders
        </Muted>
        {folders.length === 0 ? (
          <Muted className="px-2 text-xs">No folders yet</Muted>
        ) : (
          folders.map((folder) => (
            <NavLink
              key={folder.id}
              href={`/?folder=${folder.id}`}
              active={pathname === "/" && activeFolderId === folder.id}
            >
              {folder.name}
            </NavLink>
          ))
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Muted className="px-2 text-xs font-medium uppercase tracking-wide">
          Tags
        </Muted>
        {tags.length === 0 ? (
          <Muted className="px-2 text-xs">No tags yet</Muted>
        ) : (
          tags.map((tag) => (
            <NavLink
              key={tag.id}
              href={`/?tag=${tag.id}`}
              active={pathname === "/" && activeTagId === tag.id}
            >
              #{tag.name}
            </NavLink>
          ))
        )}
      </div>

      <div className="flex flex-col gap-1 border-t border-sidebar-border pt-3">
        <NavLink href="/folders" active={pathname === "/folders"}>
          Folders &amp; tags
        </NavLink>
        <NavLink href="/settings" active={pathname === "/settings"}>
          Settings
        </NavLink>
      </div>
    </nav>
  );
}

export { NavSidebar };
