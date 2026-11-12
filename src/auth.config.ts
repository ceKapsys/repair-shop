import type { NextAuthConfig } from "next-auth";

/** Edge-safe config (no DB imports) shared by middleware and the full auth setup. */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin/login")) return true;
      if (pathname.startsWith("/admin")) return Boolean(auth?.user);
      return true;
    },
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role ?? "editor";
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "owner" | "editor") ?? "editor";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
