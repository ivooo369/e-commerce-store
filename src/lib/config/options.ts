import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import prisma from "@/lib/services/prisma";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
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

          return {
            id: user.id,
            email: user.username,
            name: user.username,
            image: null,
            isVerified: true,
            googleId: null,
          };
        } catch {
          throw new Error("Неправилно потребителско име или парола!");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const email = user.email;
          if (!email) return false;

          const existingCustomer = await prisma.customer.findUnique({
            where: { email },
          });

          if (existingCustomer) {
            await prisma.customer.update({
              where: { email },
              data: {
                googleId: account.providerAccountId,
                isVerified: true,
              },
            });
          } else {
            await prisma.customer.create({
              data: {
                email,
                firstName: user.name?.split(" ")[0] || null,
                lastName: user.name?.split(" ").slice(1).join(" ") || null,
                googleId: account.providerAccountId,
                isVerified: true,
              },
            });
          }

          return true;
        } catch {
          return false;
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (token?.email) {
        try {
          const customer = await prisma.customer.findUnique({
            where: { email: token.email as string },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isVerified: true,
              googleId: true,
            },
          });

          if (customer) {
            session.user = {
              id: customer.id,
              email: customer.email!,
              name: `${customer.firstName || ""} ${
                customer.lastName || ""
              }`.trim(),
              image: null,
              isVerified: customer.isVerified || false,
              googleId: customer.googleId,
            };
          }
        } catch {
          throw new Error("Възникна грешка при обработка на сесията!");
        }
      }

      return session;
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === "google") {
        token.email = user.email;
        token.name = user.name;
      }

      return token;
    },
  },
};

async function verifyPassword(plainPassword: string, hashedPassword: string) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
