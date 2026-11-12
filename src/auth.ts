import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { connectDb } from "@/lib/db";
import { loginInput } from "@/lib/validation/auth";
import { User } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: "owner" | "editor" } & DefaultSession["user"];
  }
}

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, totp: {} },
      async authorize(raw) {
        const parsed = loginInput.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        await connectDb();
        const user = await User.findOne({ email: email.toLowerCase() }).select(
          "+passwordHash +twoFactorSecret",
        );
        if (!user) return null;
        if (user.lockedUntil && user.lockedUntil > new Date()) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          user.failedLogins = (user.failedLogins ?? 0) + 1;
          if (user.failedLogins >= MAX_FAILED) {
            user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
            user.failedLogins = 0;
          }
          await user.save();
          return null;
        }
        // TODO(week 2): verify TOTP when user.twoFactorSecret is set.

        user.failedLogins = 0;
        user.lockedUntil = undefined;
        user.lastLoginAt = new Date();
        await user.save();
        return { id: String(user._id), name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
});

/** Call at the top of every admin Server Action: role checks live on the server, not just the UI. */
export async function requireRole(role: "owner" | "editor" = "editor") {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (role === "owner" && session.user.role !== "owner") throw new Error("Forbidden");
  return session;
}
