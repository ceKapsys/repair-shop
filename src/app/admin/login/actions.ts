"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string; need2fa?: boolean } | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const callback = String(formData.get("callbackUrl") ?? "");
  const redirectTo = callback.startsWith("/admin") && !callback.startsWith("/admin/login") ? callback : "/admin";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      totp: formData.get("totp") ?? "",
      redirectTo,
    });
    return null;
  } catch (err) {
    if (err instanceof CredentialsSignin) {
      if (err.code === "2fa_required") return { need2fa: true };
      if (err.code === "2fa_invalid") return { need2fa: true, error: "That code didn’t work. Try the newest code." };
      if (err.code === "locked") return { error: "Too many attempts. Wait 15 minutes and try again." };
      return { error: "Email or password is incorrect." };
    }
    if (err instanceof AuthError) return { error: "Sign-in failed. Try again." };
    throw err; // lets the redirect through
  }
}
