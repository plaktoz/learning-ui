import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../backend/generated/prisma/client";

const email = process.env.SEED_USER_EMAIL;
const password = process.env.SEED_USER_PASSWORD;

if (!email || !password) {
  throw new Error("SEED_USER_EMAIL and SEED_USER_PASSWORD must be set (see db/.env)");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash(password!, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      settings: { create: { theme: "system" } },
      folders: { create: [{ name: "Personal" }, { name: "Work" }] },
      tags: { create: [{ name: "ideas" }, { name: "todo" }] },
    },
  });

  const folder = await prisma.folder.findFirst({ where: { userId: user.id, name: "Personal" } });
  const tag = await prisma.tag.findFirst({ where: { userId: user.id, name: "ideas" } });

  await prisma.note.upsert({
    where: { id: "seed-welcome-note" },
    update: {},
    create: {
      id: "seed-welcome-note",
      title: "Welcome to your notes",
      body: "This note was created by the seed script. Edit it, delete it, or add your own.",
      userId: user.id,
      folderId: folder?.id ?? null,
      tags: tag ? { create: [{ tagId: tag.id }] } : undefined,
    },
  });

  console.log(`Seeded user ${user.email} (id: ${user.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
