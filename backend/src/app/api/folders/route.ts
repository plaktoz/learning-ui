import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleOptions, withCors } from "@/lib/cors";
import { requireUser } from "@/lib/auth/require-user";

export async function GET() {
  const { user, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const folders = await prisma.folder.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return withCors(NextResponse.json({ folders }));
}

export async function POST(request: NextRequest) {
  const { user, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : null;
  if (!name) {
    return withCors(NextResponse.json({ error: "name is required" }, { status: 400 }));
  }

  const folder = await prisma.folder.create({ data: { name, userId: user.id } });
  return withCors(NextResponse.json({ folder }, { status: 201 }));
}

export async function OPTIONS() {
  return handleOptions();
}
