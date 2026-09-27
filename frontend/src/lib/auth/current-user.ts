import { cookies } from "next/headers";

interface CurrentUser {
  id: string;
  email: string;
  createdAt: string;
}

// Server-to-server calls (this file only) use BACKEND_INTERNAL_URL, not
// NEXT_PUBLIC_BACKEND_URL: inside podman-compose the browser reaches the
// backend via its published host port, but this server-side fetch runs
// inside the frontend container and must use the Compose service name
// instead. They coincide for local `next dev` on the host.
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:4000";

async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.user as CurrentUser;
}

export type { CurrentUser };
export { getCurrentUser };
