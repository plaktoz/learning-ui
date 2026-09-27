import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleOptions, withCors } from "@/lib/cors";
import { requireUser } from "@/lib/auth/require-user";
import { serializeNote } from "@/lib/notes";

export async function GET() {
  const { user, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    include: { tags: true },
    orderBy: { createdAt: "asc" },
  });

  return withCors(NextResponse.json({ notes: notes.map(serializeNote) }));
}

export async function POST(request: NextRequest) {
  const { user, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title : null;
  const noteBody = typeof body?.body === "string" ? body.body : null;
  if (title === null || noteBody === null) {
    return withCors(NextResponse.json({ error: "title and body are required" }, { status: 400 }));
  }

  const folderId = typeof body?.folderId === "string" ? body.folderId : null;
  const tagIds: string[] = Array.isArray(body?.tagIds)
    ? body.tagIds.filter((id: unknown): id is string => typeof id === "string")
    : [];

  const note = await prisma.note.create({
    data: {
      title,
      body: noteBody,
      folderId,
      userId: user.id,
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
    include: { tags: true },
  });

  return withCors(NextResponse.json({ note: serializeNote(note) }, { status: 201 }));
}

export async function OPTIONS() {
  return handleOptions();
}
