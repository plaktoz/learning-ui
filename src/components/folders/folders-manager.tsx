"use client";

import * as React from "react";
import { useAppData } from "@/lib/app-data/app-data-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { H1, Muted } from "@/components/ui/typography";
import { EditableRow } from "@/components/folders/editable-row";

function FoldersManager() {
  const {
    folders,
    tags,
    notes,
    loading,
    createFolder,
    renameFolder,
    deleteFolder,
    createTag,
    renameTag,
    deleteTag,
  } = useAppData();

  const [newFolderName, setNewFolderName] = React.useState("");
  const [newTagName, setNewTagName] = React.useState("");

  function folderNoteCount(folderId: string) {
    return notes.filter((note) => note.folderId === folderId).length;
  }

  function tagNoteCount(tagId: string) {
    return notes.filter((note) => note.tagIds.includes(tagId)).length;
  }

  async function handleCreateFolder(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    await createFolder(trimmed);
    setNewFolderName("");
  }

  async function handleCreateTag(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    await createTag(trimmed);
    setNewTagName("");
  }

  if (loading) {
    return <Muted>Loading…</Muted>;
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <H1>Folders &amp; tags</H1>

      <Card>
        <CardHeader>
          <CardTitle>Folders</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {folders.length === 0 ? (
            <Muted>No folders yet.</Muted>
          ) : (
            folders.map((folder) => (
              <EditableRow
                key={folder.id}
                item={folder}
                noteCount={folderNoteCount(folder.id)}
                onRename={renameFolder}
                onDelete={deleteFolder}
                describeImpact={(count) =>
                  count > 0
                    ? `Delete "${folder.name}"? ${count} ${
                        count === 1 ? "note" : "notes"
                      } in it will become unfiled.`
                    : `Delete "${folder.name}"?`
                }
              />
            ))
          )}
          <form
            onSubmit={handleCreateFolder}
            className="mt-3 flex items-center gap-2"
          >
            <Input
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              placeholder="New folder name"
            />
            <Button type="submit" size="sm">
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {tags.length === 0 ? (
            <Muted>No tags yet.</Muted>
          ) : (
            tags.map((tag) => (
              <EditableRow
                key={tag.id}
                item={tag}
                noteCount={tagNoteCount(tag.id)}
                onRename={renameTag}
                onDelete={deleteTag}
                describeImpact={(count) =>
                  count > 0
                    ? `Delete "${tag.name}"? It will be removed from ${count} ${
                        count === 1 ? "note" : "notes"
                      }.`
                    : `Delete "${tag.name}"?`
                }
              />
            ))
          )}
          <form
            onSubmit={handleCreateTag}
            className="mt-3 flex items-center gap-2"
          >
            <Input
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="New tag name"
            />
            <Button type="submit" size="sm">
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export { FoldersManager };
