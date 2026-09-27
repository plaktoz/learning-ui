import { LocalStorageRepository } from "./local-storage-repository";
import type { Repository } from "./types";

function createRepository(): Repository {
  return new LocalStorageRepository();
}

beforeEach(() => {
  localStorage.clear();
});

describe("notes", () => {
  it("starts empty", async () => {
    const repo = createRepository();
    expect(await repo.listNotes()).toEqual([]);
  });

  it("creates a note and lists it back", async () => {
    const repo = createRepository();
    const note = await repo.createNote({
      title: "Groceries",
      body: "Milk, eggs",
      folderId: null,
      tagIds: [],
    });

    expect(note.id).toBeTruthy();
    expect(await repo.listNotes()).toEqual([note]);
  });

  it("persists across repository instances (survives reload)", async () => {
    const repo = createRepository();
    const note = await repo.createNote({ title: "Reload me", body: "" });

    const reloaded = createRepository();
    expect(await reloaded.getNote(note.id)).toEqual(note);
  });

  it("returns null for a note that doesn't exist", async () => {
    const repo = createRepository();
    expect(await repo.getNote("missing-id")).toBeNull();
  });

  it("updates a note's fields and bumps updatedAt", async () => {
    const repo = createRepository();
    const note = await repo.createNote({ title: "Draft", body: "" });

    const updated = await repo.updateNote(note.id, { title: "Final" });

    expect(updated.title).toBe("Final");
    expect(updated.id).toBe(note.id);
    expect(await repo.getNote(note.id)).toEqual(updated);
  });

  it("throws when updating a note that doesn't exist", async () => {
    const repo = createRepository();
    await expect(repo.updateNote("missing-id", { title: "x" })).rejects.toThrow();
  });

  it("deletes a note", async () => {
    const repo = createRepository();
    const note = await repo.createNote({ title: "Temporary", body: "" });

    await repo.deleteNote(note.id);

    expect(await repo.listNotes()).toEqual([]);
  });
});

describe("folders", () => {
  it("creates and renames a folder", async () => {
    const repo = createRepository();
    const folder = await repo.createFolder("Work");

    const renamed = await repo.renameFolder(folder.id, "Work Projects");

    expect(renamed.name).toBe("Work Projects");
    expect(await repo.listFolders()).toEqual([renamed]);
  });

  it("throws when renaming a folder that doesn't exist", async () => {
    const repo = createRepository();
    await expect(repo.renameFolder("missing-id", "x")).rejects.toThrow();
  });

  it("deleting a folder unfiles its notes instead of deleting them", async () => {
    const repo = createRepository();
    const folder = await repo.createFolder("Work");
    const inFolder = await repo.createNote({
      title: "Report",
      body: "",
      folderId: folder.id,
    });
    const elsewhere = await repo.createNote({ title: "Other", body: "" });

    await repo.deleteFolder(folder.id);

    expect(await repo.listFolders()).toEqual([]);
    const notes = await repo.listNotes();
    expect(notes.find((n) => n.id === inFolder.id)?.folderId).toBeNull();
    expect(notes.find((n) => n.id === elsewhere.id)?.folderId).toBeNull();
  });
});

describe("tags", () => {
  it("creates and renames a tag", async () => {
    const repo = createRepository();
    const tag = await repo.createTag("urgent");

    const renamed = await repo.renameTag(tag.id, "important");

    expect(renamed.name).toBe("important");
    expect(await repo.listTags()).toEqual([renamed]);
  });

  it("throws when renaming a tag that doesn't exist", async () => {
    const repo = createRepository();
    await expect(repo.renameTag("missing-id", "x")).rejects.toThrow();
  });

  it("deleting a tag detaches it from notes instead of deleting them", async () => {
    const repo = createRepository();
    const tag = await repo.createTag("urgent");
    const other = await repo.createTag("later");
    const note = await repo.createNote({
      title: "Taxes",
      body: "",
      tagIds: [tag.id, other.id],
    });

    await repo.deleteTag(tag.id);

    expect(await repo.listTags()).toEqual([other]);
    const reloadedNote = await repo.getNote(note.id);
    expect(reloadedNote?.tagIds).toEqual([other.id]);
  });
});

describe("settings", () => {
  it("defaults to system theme", async () => {
    const repo = createRepository();
    expect(await repo.getSettings()).toEqual({ theme: "system" });
  });

  it("saves and reloads a settings change", async () => {
    const repo = createRepository();
    await repo.updateSettings({ theme: "dark" });

    const reloaded = createRepository();
    expect(await reloaded.getSettings()).toEqual({ theme: "dark" });
  });
});
