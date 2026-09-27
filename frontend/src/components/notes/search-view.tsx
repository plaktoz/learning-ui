"use client";

import * as React from "react";
import Link from "next/link";
import { useAppData } from "@/lib/app-data/app-data-provider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { H1, Muted } from "@/components/ui/typography";

function matchesQuery(query: string, title: string, body: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  return (
    title.toLowerCase().includes(needle) || body.toLowerCase().includes(needle)
  );
}

function SearchView() {
  const { notes, tags, loading } = useAppData();
  const [query, setQuery] = React.useState("");

  const results = query.trim()
    ? notes.filter((note) => matchesQuery(query, note.title, note.body))
    : [];

  if (loading) {
    return <Muted>Loading…</Muted>;
  }

  return (
    <div className="flex flex-col gap-6">
      <H1>Search</H1>
      <Input
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search notes by title or content…"
        className="max-w-md"
      />

      {!query.trim() ? (
        <Muted>Start typing to search your notes.</Muted>
      ) : results.length === 0 ? (
        <Muted>No notes match &quot;{query}&quot;.</Muted>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((note) => {
            const noteTags = tags.filter((tag) =>
              note.tagIds.includes(tag.id)
            );
            return (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle>{note.title || "Untitled"}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Muted className="line-clamp-3">
                      {note.body || "No content yet."}
                    </Muted>
                    {noteTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {noteTags.map((tag) => (
                          <Badge key={tag.id} variant="secondary">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { SearchView };
