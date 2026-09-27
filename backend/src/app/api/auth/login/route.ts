import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { handleOptions, withCors } from "@/lib/cors";
import { createSessionCookieValue, SESSION_COOKIE_NAME, SESSION_TTL_MS } from "@/lib/auth/session";
import { toSafeUser } from "@/lib/auth/safe-user";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : null;
  const password = typeof body?.password === "string" ? body.password : null;

  if (!email || !password) {
    return withCors(NextResponse.json({ error: "Email and password are required" }, { status: 400 }));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return withCors(NextResponse.json({ error: "Invalid email or password" }, { status: 401 }));
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return withCors(NextResponse.json({ error: "Invalid email or password" }, { status: 401 }));
  }

  const response = NextResponse.json({ user: toSafeUser(user) });
  response.cookies.set(SESSION_COOKIE_NAME, createSessionCookieValue(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });

  return withCors(response);
}

export async function OPTIONS() {
  return handleOptions();
}
