export interface Note {
  id: string;
  title: string;
  body: string;
  folderId: string | null;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  title: string;
  body: string;
  folderId?: string | null;
  tagIds?: string[];
}

export interface Folder {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

export type Theme = "light" | "dark" | "system";

export interface Settings {
  theme: Theme;
}

export interface Repository {
  listNotes(): Promise<Note[]>;
  getNote(id: string): Promise<Note | null>;
  createNote(input: NoteInput): Promise<Note>;
  updateNote(id: string, input: Partial<NoteInput>): Promise<Note>;
  deleteNote(id: string): Promise<void>;

  listFolders(): Promise<Folder[]>;
  createFolder(name: string): Promise<Folder>;
  renameFolder(id: string, name: string): Promise<Folder>;
  deleteFolder(id: string): Promise<void>;

  listTags(): Promise<Tag[]>;
  createTag(name: string): Promise<Tag>;
  renameTag(id: string, name: string): Promise<Tag>;
  deleteTag(id: string): Promise<void>;

  getSettings(): Promise<Settings>;
  updateSettings(input: Partial<Settings>): Promise<Settings>;
}
