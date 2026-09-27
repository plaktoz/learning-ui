import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleOptions, withCors } from "@/lib/cors";
import { requireUser } from "@/lib/auth/require-user";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/folders/[id]">) {
  const { user, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const existing = await prisma.folder.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return withCors(NextResponse.json({ error: "Folder not found" }, { status: 404 }));
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : null;
  if (!name) {
    return withCors(NextResponse.json({ error: "name is required" }, { status: 400 }));
  }

  const folder = await prisma.folder.update({ where: { id }, data: { name } });
  return withCors(NextResponse.json({ folder }));
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/folders/[id]">) {
  const { user, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const { id } = await ctx.params;
  const existing = await prisma.folder.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return withCors(NextResponse.json({ error: "Folder not found" }, { status: 404 }));
  }

  await prisma.folder.delete({ where: { id } });
  return withCors(NextResponse.json({ ok: true }));
}

export async function OPTIONS() {
  return handleOptions();
}
