import type {
  Folder,
  Note,
  NoteInput,
  Repository,
  Settings,
  Tag,
} from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Request to ${path} failed with ${response.status}`);
  }

  return response.json();
}

export class ApiRepository implements Repository {
  async listNotes(): Promise<Note[]> {
    const { notes } = await request<{ notes: Note[] }>("/api/notes");
    return notes;
  }

  async getNote(id: string): Promise<Note | null> {
    try {
      const { note } = await request<{ note: Note }>(`/api/notes/${id}`);
      return note;
    } catch {
      return null;
    }
  }

  async createNote(input: NoteInput): Promise<Note> {
    const { note } = await request<{ note: Note }>("/api/notes", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return note;
  }

  async updateNote(id: string, input: Partial<NoteInput>): Promise<Note> {
    const { note } = await request<{ note: Note }>(`/api/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return note;
  }

  async deleteNote(id: string): Promise<void> {
    await request<{ ok: true }>(`/api/notes/${id}`, { method: "DELETE" });
  }

  async listFolders(): Promise<Folder[]> {
    const { folders } = await request<{ folders: Folder[] }>("/api/folders");
    return folders;
  }

  async createFolder(name: string): Promise<Folder> {
    const { folder } = await request<{ folder: Folder }>("/api/folders", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    return folder;
  }

  async renameFolder(id: string, name: string): Promise<Folder> {
    const { folder } = await request<{ folder: Folder }>(`/api/folders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    return folder;
  }

  async deleteFolder(id: string): Promise<void> {
    await request<{ ok: true }>(`/api/folders/${id}`, { method: "DELETE" });
  }

  async listTags(): Promise<Tag[]> {
    const { tags } = await request<{ tags: Tag[] }>("/api/tags");
    return tags;
  }

  async createTag(name: string): Promise<Tag> {
    const { tag } = await request<{ tag: Tag }>("/api/tags", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    return tag;
  }

  async renameTag(id: string, name: string): Promise<Tag> {
    const { tag } = await request<{ tag: Tag }>(`/api/tags/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    return tag;
  }

  async deleteTag(id: string): Promise<void> {
    await request<{ ok: true }>(`/api/tags/${id}`, { method: "DELETE" });
  }

  async getSettings(): Promise<Settings> {
    const { settings } = await request<{ settings: Settings }>("/api/settings");
    return settings;
  }

  async updateSettings(input: Partial<Settings>): Promise<Settings> {
    const { settings } = await request<{ settings: Settings }>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return settings;
  }
}
