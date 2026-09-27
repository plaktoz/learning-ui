# CONTEXT.md

Shared vocabulary for the note-taking app project. A glossary, not a spec —
definitions only, no implementation detail.

---

## Project Vocabulary

**Note**:
A single piece of captured text with a title and body. Belongs to at most
one Folder and any number of Tags.
_Avoid_: Document, entry, page — this app is for short capture, not documents.

**Folder**:
A single-level container for Notes, used for filing. A Note has at most one
Folder (or none). Folders do not nest.
_Avoid_: Notebook, directory, category.

**Tag**:
A label attached to a Note for cross-cutting organization, independent of
Folder. A Note can have any number of Tags; a Tag can apply to any number
of Notes.
_Avoid_: Label, category.

**Settings**:
The single record of a user's app-wide preferences (currently just theme).
Not per-Note or per-Folder.
_Avoid_: Preferences, config.

**Repository**:
The persistence seam — one interface with swappable implementations
(localStorage in Phases 1-2, Postgres/Prisma in Phase 3). Callers never
talk to storage directly.
_Avoid_: Store, DAO, service — Repository is the term used consistently
across the codebase and lesson content.
