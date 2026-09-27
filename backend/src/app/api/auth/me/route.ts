import { NextResponse } from "next/server";
import { handleOptions, withCors } from "@/lib/cors";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return withCors(NextResponse.json({ error: "Not authenticated" }, { status: 401 }));
  }

  return withCors(NextResponse.json({ user }));
}

export async function OPTIONS() {
  return handleOptions();
}
