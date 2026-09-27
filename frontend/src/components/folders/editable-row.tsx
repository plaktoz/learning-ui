"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Muted } from "@/components/ui/typography";

interface EditableRowProps {
  item: { id: string; name: string };
  noteCount: number;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  describeImpact: (noteCount: number) => string;
}

function EditableRow({
  item,
  noteCount,
  onRename,
  onDelete,
  describeImpact,
}: EditableRowProps) {
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(item.name);

  function handleSave() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== item.name) onRename(item.id, trimmed);
    setEditing(false);
  }

  function handleCancel() {
    setName(item.name);
    setEditing(false);
  }

  if (editing) {
    return (
      <form
        className="flex items-center gap-2 py-1.5"
        onSubmit={(event) => {
          event.preventDefault();
          handleSave();
        }}
      >
        <Input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit" size="sm">
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-foreground">{item.name}</span>
      <div className="flex items-center gap-3">
        <Muted className="text-xs">
          {noteCount} {noteCount === 1 ? "note" : "notes"}
        </Muted>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          Rename
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm(describeImpact(noteCount))) onDelete(item.id);
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export { EditableRow };
