import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppDataProvider } from "@/lib/app-data/app-data-provider";
import { LocalStorageRepository } from "@/lib/repository/local-storage-repository";
import { NoteEditor } from "./note-editor";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe("NoteEditor autosave", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists what the user actually typed, not a stale snapshot from when the autosave timer was created", async () => {
    const repo = new LocalStorageRepository();
    const note = await repo.createNote({ title: "Original", body: "" });

    const user = userEvent.setup();
    render(
      <AppDataProvider repository={repo}>
        <NoteEditor noteId={note.id} />
      </AppDataProvider>
    );

    const titleInput = await screen.findByDisplayValue("Original");

    await user.clear(titleInput);
    await user.type(titleInput, "First edit");

    await waitFor(
      async () => {
        const saved = await repo.getNote(note.id);
        expect(saved?.title).toBe("First edit");
      },
      { timeout: 3000 }
    );

    await user.type(titleInput, " plus more");

    await waitFor(
      async () => {
        const saved = await repo.getNote(note.id);
        expect(saved?.title).toBe("First edit plus more");
      },
      { timeout: 3000 }
    );
  }, 15000);
});
