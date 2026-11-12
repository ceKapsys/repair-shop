import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { connectDb } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { rateLimit } from "@/lib/ratelimit";
import { verifyTotp } from "@/lib/totp";
import { loginInput } from "@/lib/validation/auth";
import { User } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: "owner" | "editor" } & DefaultSession["user"];
  }
}

class TwoFactorRequired extends CredentialsSignin {
  code = "2fa_required";
}
class TwoFactorInvalid extends CredentialsSignin {
  code = "2fa_invalid";
}
class TooManyAttempts extends CredentialsSignin {
  code = "locked";
}

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, totp: {} },
      async authorize(raw, request) {
        const parsed = loginInput.safeParse({ ...raw, totp: raw?.totp || undefined });
        if (!parsed.success) return null;
        const { email, password, totp } = parsed.data;

        const ip = request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        if (!(await rateLimit("login", ip, 20, 15 * 60)).ok) throw new TooManyAttempts();

        await connectDb();
        const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash +twoFactorSecret");
        if (!user) {
          await bcrypt.compare(password, "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva"); // even timing
          return null;
        }
        if (user.lockedUntil && user.lockedUntil > new Date()) throw new TooManyAttempts();

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

        if (user.twoFactorSecret) {
          if (!totp) throw new TwoFactorRequired();
          if (!verifyTotp(decrypt(user.twoFactorSecret), totp)) {
            user.failedLogins = (user.failedLogins ?? 0) + 1;
            await user.save();
            throw new TwoFactorInvalid();
          }
        }

        user.failedLogins = 0;
        user.lockedUntil = undefined;
        user.lastLoginAt = new Date();
        await user.save();
        return { id: String(user._id), name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
});

/** Call at the top of every admin Server Action / route: role checks live on the server, not just the UI. */
export async function requireRole(role: "owner" | "editor" = "editor") {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (role === "owner" && session.user.role !== "owner") throw new Error("Only the owner can do this");
  return session;
}
