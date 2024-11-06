import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = "5342lipci";
  const hashedPassword = await hash(password, 10);

  const admin = await prisma.admin.create({
    data: {
      username: "lipci-admin",
      password: hashedPassword,
    },
  });

  console.log("Admin created:", admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
