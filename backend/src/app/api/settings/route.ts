import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleOptions, withCors } from "@/lib/cors";
import { requireUser } from "@/lib/auth/require-user";

export async function GET() {
  const { user, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const settings = await prisma.settings.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  return withCors(NextResponse.json({ settings: { theme: settings.theme } }));
}

export async function PATCH(request: NextRequest) {
  const { user, unauthorized } = await requireUser();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const theme = body?.theme;
  if (theme !== "light" && theme !== "dark" && theme !== "system") {
    return withCors(NextResponse.json({ error: "theme must be light, dark, or system" }, { status: 400 }));
  }

  const settings = await prisma.settings.upsert({
    where: { userId: user.id },
    update: { theme },
    create: { userId: user.id, theme },
  });

  return withCors(NextResponse.json({ settings: { theme: settings.theme } }));
}

export async function OPTIONS() {
  return handleOptions();
}
