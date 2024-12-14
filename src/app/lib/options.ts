import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        try {
          const user = await prisma.admin.findUnique({ where: { username } });

          if (!user || !(await verifyPassword(password, user.password))) {
            throw new Error("Неправилно потребителско име или парола!");
          }

          return user;
        } catch (error) {
          console.error("Грешка при оторизация:", error);
          throw new Error("Неправилно потребителско име или парола!");
        }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    maxAge: 60 * 30,
    updateAge: 60 * 10,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

async function verifyPassword(plainPassword: string, hashedPassword: string) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
