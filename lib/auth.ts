import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as never,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user?.password) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    ...(googleId && googleSecret
      ? [
          GoogleProvider({
            clientId: googleId,
            clientSecret: googleSecret,
            // Permite que una misma persona use Google y credenciales con el
            // mismo email sin el error "OAuthAccountNotLinked".
            allowDangerousEmailAccountLinking: true,
            // El timeout por defecto (3500ms) es muy bajo para conexiones lentas
            // y provoca "OAUTH_CALLBACK_ERROR: request timed out". Lo subimos.
            httpOptions: { timeout: 10000 },
          }),
        ]
      : []),
  ],
  events: {
    // Cuando el adapter crea un usuario nuevo (p. ej. primer login con Google),
    // le creamos su Perfil vacío para que arranque el flujo de diagnóstico.
    async createUser({ user }) {
      try {
        await prisma.perfil.create({ data: { userId: user.id } });
      } catch {
        // Si ya existe (carrera/credenciales), lo ignoramos.
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = (token.id as string) ?? token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
