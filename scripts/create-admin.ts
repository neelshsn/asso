import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const datasourceUrl =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

if (!datasourceUrl) {
  throw new Error("Set DATABASE_URL (and optionally DIRECT_DATABASE_URL).");
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: datasourceUrl },
  },
});
const SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS ?? 10);

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD before running pnpm admin:create",
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.ADMIN,
      passwordHash,
      firstName: "N'GO",
      lastName: "Admin",
    },
    create: {
      email,
      role: Role.ADMIN,
      passwordHash,
      firstName: "N'GO",
      lastName: "Admin",
      languages: [],
    },
  });

  console.info(`Admin ready: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
