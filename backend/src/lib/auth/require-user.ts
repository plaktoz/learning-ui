import { NextResponse } from "next/server";
import { withCors } from "@/lib/cors";
import { getCurrentUser } from "@/lib/auth/session";
import type { SafeUser } from "@/lib/auth/safe-user";

type RequireUserResult =
  | { user: SafeUser; unauthorized: null }
  | { user: null; unauthorized: Response };

async function requireUser(): Promise<RequireUserResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      unauthorized: withCors(NextResponse.json({ error: "Not authenticated" }, { status: 401 })),
    };
  }

  return { user, unauthorized: null };
}

export { requireUser };
