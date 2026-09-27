import { cookies } from "next/headers";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { toSafeUser, type SafeUser } from "@/lib/auth/safe-user";

const SESSION_COOKIE_NAME = "session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function createSessionCookieValue(userId: string): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function verifySessionCookieValue(value: string): string | null {
  const [userId, expiresAtRaw, signature] = value.split(".");
  if (!userId || !expiresAtRaw || !signature) {
    return null;
  }

  const expectedSignature = sign(`${userId}.${expiresAtRaw}`);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length) {
    return null;
  }
  if (!crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return null;
  }

  return userId;
}

async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return null;
  }

  const userId = verifySessionCookieValue(sessionCookie.value);
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return null;
  }

  return toSafeUser(user);
}

export {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  createSessionCookieValue,
  verifySessionCookieValue,
  getCurrentUser,
};
