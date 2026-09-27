import type {
  Folder,
  Note,
  NoteInput,
  Repository,
  Settings,
  Tag,
} from "./types";

const STORAGE_KEY = "note-app:data";

interface StoredState {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  settings: Settings;
}

function defaultState(): StoredState {
  return {
    notes: [],
    folders: [],
    tags: [],
    settings: { theme: "system" },
  };
}

function readState(): StoredState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  return { ...defaultState(), ...JSON.parse(raw) };
}

function writeState(state: StoredState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export class LocalStorageRepository implements Repository {
  async listNotes(): Promise<Note[]> {
    return readState().notes;
  }

  async getNote(id: string): Promise<Note | null> {
    return readState().notes.find((note) => note.id === id) ?? null;
  }

  async createNote(input: NoteInput): Promise<Note> {
    const state = readState();
    const now = new Date().toISOString();
    const note: Note = {
      id: crypto.randomUUID(),
      title: input.title,
      body: input.body,
      folderId: input.folderId ?? null,
      tagIds: input.tagIds ?? [],
      createdAt: now,
      updatedAt: now,
    };
    state.notes.push(note);
    writeState(state);
    return note;
  }

  async updateNote(id: string, input: Partial<NoteInput>): Promise<Note> {
    const state = readState();
    const note = state.notes.find((n) => n.id === id);
    if (!note) throw new Error(`Note not found: ${id}`);
    Object.assign(note, input, { updatedAt: new Date().toISOString() });
    writeState(state);
    return note;
  }

  async deleteNote(id: string): Promise<void> {
    const state = readState();
    state.notes = state.notes.filter((note) => note.id !== id);
    writeState(state);
  }

  async listFolders(): Promise<Folder[]> {
    return readState().folders;
  }

  async createFolder(name: string): Promise<Folder> {
    const state = readState();
    const folder: Folder = { id: crypto.randomUUID(), name };
    state.folders.push(folder);
    writeState(state);
    return folder;
  }

  async renameFolder(id: string, name: string): Promise<Folder> {
    const state = readState();
    const folder = state.folders.find((f) => f.id === id);
    if (!folder) throw new Error(`Folder not found: ${id}`);
    folder.name = name;
    writeState(state);
    return folder;
  }

  async deleteFolder(id: string): Promise<void> {
    const state = readState();
    state.folders = state.folders.filter((folder) => folder.id !== id);
    for (const note of state.notes) {
      if (note.folderId === id) note.folderId = null;
    }
    writeState(state);
  }

  async listTags(): Promise<Tag[]> {
    return readState().tags;
  }

  async createTag(name: string): Promise<Tag> {
    const state = readState();
    const tag: Tag = { id: crypto.randomUUID(), name };
    state.tags.push(tag);
    writeState(state);
    return tag;
  }

  async renameTag(id: string, name: string): Promise<Tag> {
    const state = readState();
    const tag = state.tags.find((t) => t.id === id);
    if (!tag) throw new Error(`Tag not found: ${id}`);
    tag.name = name;
    writeState(state);
    return tag;
  }

  async deleteTag(id: string): Promise<void> {
    const state = readState();
    state.tags = state.tags.filter((tag) => tag.id !== id);
    for (const note of state.notes) {
      note.tagIds = note.tagIds.filter((tagId) => tagId !== id);
    }
    writeState(state);
  }

  async getSettings(): Promise<Settings> {
    return readState().settings;
  }

  async updateSettings(input: Partial<Settings>): Promise<Settings> {
    const state = readState();
    state.settings = { ...state.settings, ...input };
    writeState(state);
    return state.settings;
  }
}
