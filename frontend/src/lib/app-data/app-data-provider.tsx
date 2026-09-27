"use client";

import * as React from "react";
import { ApiRepository } from "@/lib/repository/api-repository";
import type {
  Folder,
  Note,
  NoteInput,
  Repository,
  Settings,
  Tag,
  Theme,
} from "@/lib/repository/types";

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    return;
  }
  if (theme === "light") {
    root.classList.remove("dark");
    return;
  }
  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  root.classList.toggle("dark", prefersDark);
}

interface AppData {
  loading: boolean;
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  settings: Settings;
  createNote: (input: NoteInput) => Promise<Note>;
  updateNote: (id: string, input: Partial<NoteInput>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  createFolder: (name: string) => Promise<Folder>;
  renameFolder: (id: string, name: string) => Promise<Folder>;
  deleteFolder: (id: string) => Promise<void>;
  createTag: (name: string) => Promise<Tag>;
  renameTag: (id: string, name: string) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  updateSettings: (input: Partial<Settings>) => Promise<Settings>;
}

const AppDataContext = React.createContext<AppData | null>(null);

function createRepository(): Repository {
  return new ApiRepository();
}

function AppDataProvider({
  children,
  repository: repositoryOverride,
}: {
  children: React.ReactNode;
  repository?: Repository;
}) {
  const [repository] = React.useState<Repository>(
    () => repositoryOverride ?? createRepository()
  );

  const [loading, setLoading] = React.useState(true);
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [folders, setFolders] = React.useState<Folder[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [settings, setSettings] = React.useState<Settings>({
    theme: "system",
  });

  React.useEffect(() => {
    Promise.all([
      repository.listNotes(),
      repository.listFolders(),
      repository.listTags(),
      repository.getSettings(),
    ]).then(([loadedNotes, loadedFolders, loadedTags, loadedSettings]) => {
      setNotes(loadedNotes);
      setFolders(loadedFolders);
      setTags(loadedTags);
      setSettings(loadedSettings);
      setLoading(false);
    });
  }, [repository]);

  React.useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  // Every action below is stable for the lifetime of the provider (deps
  // are just `repository`, which never changes) — components can safely
  // depend on them (e.g. in an autosave effect) without the identity churn
  // that would come from depending on `notes`/`folders`/etc.
  const createNote = React.useCallback(
    async (input: NoteInput) => {
      const note = await repository.createNote(input);
      setNotes((prev) => [...prev, note]);
      return note;
    },
    [repository]
  );

  const updateNote = React.useCallback(
    async (id: string, input: Partial<NoteInput>) => {
      const note = await repository.updateNote(id, input);
      setNotes((prev) => prev.map((n) => (n.id === id ? note : n)));
      return note;
    },
    [repository]
  );

  const deleteNote = React.useCallback(
    async (id: string) => {
      await repository.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [repository]
  );

  const createFolder = React.useCallback(
    async (name: string) => {
      const folder = await repository.createFolder(name);
      setFolders((prev) => [...prev, folder]);
      return folder;
    },
    [repository]
  );

  const renameFolder = React.useCallback(
    async (id: string, name: string) => {
      const folder = await repository.renameFolder(id, name);
      setFolders((prev) => prev.map((f) => (f.id === id ? folder : f)));
      return folder;
    },
    [repository]
  );

  const deleteFolder = React.useCallback(
    async (id: string) => {
      await repository.deleteFolder(id);
      setFolders((prev) => prev.filter((f) => f.id !== id));
      setNotes((prev) =>
        prev.map((n) => (n.folderId === id ? { ...n, folderId: null } : n))
      );
    },
    [repository]
  );

  const createTag = React.useCallback(
    async (name: string) => {
      const tag = await repository.createTag(name);
      setTags((prev) => [...prev, tag]);
      return tag;
    },
    [repository]
  );

  const renameTag = React.useCallback(
    async (id: string, name: string) => {
      const tag = await repository.renameTag(id, name);
      setTags((prev) => prev.map((t) => (t.id === id ? tag : t)));
      return tag;
    },
    [repository]
  );

  const deleteTag = React.useCallback(
    async (id: string) => {
      await repository.deleteTag(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
      setNotes((prev) =>
        prev.map((n) =>
          n.tagIds.includes(id)
            ? { ...n, tagIds: n.tagIds.filter((tagId) => tagId !== id) }
            : n
        )
      );
    },
    [repository]
  );

  const updateSettings = React.useCallback(
    async (input: Partial<Settings>) => {
      const updated = await repository.updateSettings(input);
      setSettings(updated);
      return updated;
    },
    [repository]
  );

  const value = React.useMemo<AppData>(
    () => ({
      loading,
      notes,
      folders,
      tags,
      settings,
      createNote,
      updateNote,
      deleteNote,
      createFolder,
      renameFolder,
      deleteFolder,
      createTag,
      renameTag,
      deleteTag,
      updateSettings,
    }),
    [
      loading,
      notes,
      folders,
      tags,
      settings,
      createNote,
      updateNote,
      deleteNote,
      createFolder,
      renameFolder,
      deleteFolder,
      createTag,
      renameTag,
      deleteTag,
      updateSettings,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

function useAppData(): AppData {
  const context = React.useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
}

export { AppDataProvider, useAppData };
