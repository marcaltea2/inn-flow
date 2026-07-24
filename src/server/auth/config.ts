import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { Role } from "@prisma/client";
import "next-auth/jwt";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      firstName: string;
      lastName: string;
      isTempPassword: boolean;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   role: Role;
  // }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    firstName: string;
    lastName: string;
    isTempPassword: boolean;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
        };
      },
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.passwordHash) return null;
        // if (user.role !== Role.GUEST && !user.emailVerified)  return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        return valid ? user : null;
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // Runs only when signing in (or when the JWT is updated)
      if (user) {
        token.role = (user as { role: Role }).role;
      }

      return token;
    },

    async session({ session, token }) {
      const user = await db.user.findUnique({
        where: { id: token.sub! },
        include: {
          staff: true,
          guest: true,
        },
      });

      if (!user) return session;

      const profile = user.staff ?? user.guest;

      session.user = {
        ...session.user,
        id: user.id,
        role: user.role,
        isTempPassword: user?.isTempPassword ?? false,
        firstName: profile?.firstName ?? "",
        lastName: profile?.lastName ?? "",
      };

      return session;
    },
  },
  events: {
    async signIn({ user, profile, isNewUser }) {
      if (!isNewUser || !user.email) return;

      const existingGuest = await db.guest.findUnique({
        where: { userId: user.id },
      });
      if (existingGuest) return;

      const googleProfile = profile as GoogleProfile | undefined;

      await db.guest.create({
        data: {
          userId: user.id,
          email: user.email,
          firstName: googleProfile?.given_name ?? "Guest",
          lastName: googleProfile?.family_name ?? "—",
        },
      });

      await db.user.update({
        where: { id: user.id },
        data: { role: Role.GUEST },
      });
    },
  },
  pages: { signIn: "/login" },
} satisfies NextAuthConfig;
