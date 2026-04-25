import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Extend NextAuth types to include custom fields
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { role: string; id: string };
  }
  interface User {
    role: string;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        
        if (!user) return null;
        
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        
        if (!valid) return null;
        
        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id; // persist DB id into JWT
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role ?? "";
        session.user.id = token.sub ?? ""; // token.sub is the user id in NextAuth v5
      }
      return session;
    },
  },
  pages: { 
    signIn: "/login",
  },
});
