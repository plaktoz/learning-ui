import type { User } from "../../../generated/prisma/client";

interface SafeUser {
  id: string;
  email: string;
  createdAt: Date;
}

function toSafeUser(user: User): SafeUser {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

export type { SafeUser };
export { toSafeUser };
