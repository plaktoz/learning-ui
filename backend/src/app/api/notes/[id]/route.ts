import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleOptions, withCors } from "@/lib/cors";
import { requireUser } from "@/lib/auth/require-user";
import { serializeNote } from "@/lib/notes";
import type { Prisma } from "../../../../../generated/prisma/client";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/notes/[id]">) {
  const { user, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const note = await prisma.note.findFirst({
    where: { id, userId: user.id },
    include: { tags: true },
  });

  if (!note) {
    return withCors(NextResponse.json({ error: "Note not found" }, { status: 404 }));
  }

  return withCors(NextResponse.json({ note: serializeNote(note) }));
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/notes/[id]">) {
  const { user, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const existing = await prisma.note.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return withCors(NextResponse.json({ error: "Note not found" }, { status: 404 }));
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return withCors(NextResponse.json({ error: "Invalid request body" }, { status: 400 }));
  }

  const data: Prisma.NoteUncheckedUpdateInput = {};
  if (Object.hasOwn(body, "title") && typeof body.title === "string") {
    data.title = body.title;
  }
  if (Object.hasOwn(body, "body") && typeof body.body === "string") {
    data.body = body.body;
  }
  if (Object.hasOwn(body, "folderId")) {
    data.folderId = typeof body.folderId === "string" ? body.folderId : null;
  }
  if (Object.hasOwn(body, "tagIds") && Array.isArray(body.tagIds)) {
    const tagIds: string[] = body.tagIds.filter((tagId: unknown): tagId is string => typeof tagId === "string");
    data.tags = { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) };
  }

  const note = await prisma.note.update({
    where: { id },
    data,
    include: { tags: true },
  });

  return withCors(NextResponse.json({ note: serializeNote(note) }));
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/notes/[id]">) {
  const { user, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const existing = await prisma.note.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return withCors(NextResponse.json({ error: "Note not found" }, { status: 404 }));
  }

  await prisma.note.delete({ where: { id } });
  return withCors(NextResponse.json({ ok: true }));
}

export async function OPTIONS() {
  return handleOptions();
}
