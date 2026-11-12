"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function loginAction(_prev: string | null, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return null;
  } catch (err) {
    if (err instanceof AuthError) return "Email or password is incorrect, or the account is locked.";
    throw err; // lets the redirect through
  }
}
