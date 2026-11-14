"use server";

import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/auth";
import { errorMessage, fail, zodErrors, type ActionResult } from "@/lib/action";
import { connectDb } from "@/lib/db";
import { userInput } from "@/lib/validation/admin";
import { User } from "@/models";

async function ownerCount() {
  return User.countDocuments({ role: "owner" });
}

/** Create or update a user (owner only). A password is required for new users and optional on edit (= reset). */
export async function saveUser(id: string | null, input: unknown): Promise<ActionResult> {
  try {
    const { user: me } = await requireRole("owner");
    const parsed = userInput.safeParse(input);
    if (!parsed.success) return fail("Please fix the highlighted fields", zodErrors(parsed.error));
    const { name, email, role, password } = parsed.data;
    await connectDb();

    if (!id) {
      if (!password) return fail("Please fix the highlighted fields", { password: "Set a starting password (at least 12 characters)" });
      const doc = await User.create({ name, email: email.toLowerCase(), role, passwordHash: await bcrypt.hash(password, 12) });
      revalidatePath("/admin/users");
      return { ok: true, id: String(doc._id), message: "User created" };
    }

    if (!isValidObjectId(id)) return fail("User not found");
    const doc = await User.findById(id);
    if (!doc) return fail("User not found");
    if (doc.role === "owner" && role !== "owner") {
      if (String(doc._id) === me.id) return fail("You can’t remove your own owner role");
      if ((await ownerCount()) <= 1) return fail("There must always be at least one owner");
    }
    doc.set({ name, email: email.toLowerCase(), role });
    if (password) {
      doc.passwordHash = await bcrypt.hash(password, 12);
      doc.failedLogins = 0;
      doc.lockedUntil = undefined;
    }
    await doc.save();
    revalidatePath("/admin/users");
    return { ok: true, id, message: password ? "User saved and password reset" : "User saved" };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const { user: me } = await requireRole("owner");
    if (!isValidObjectId(id)) return fail("User not found");
    if (id === me.id) return fail("You can’t delete your own account");
    await connectDb();
    const doc = await User.findById(id);
    if (!doc) return fail("Already deleted");
    if (doc.role === "owner" && (await ownerCount()) <= 1) return fail("There must always be at least one owner");
    await doc.deleteOne();
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

/** Owner can switch off 2FA for someone who lost their phone. */
export async function resetUser2fa(id: string): Promise<ActionResult> {
  try {
    await requireRole("owner");
    if (!isValidObjectId(z.string().parse(id))) return fail("User not found");
    await connectDb();
    await User.updateOne({ _id: id }, { $unset: { twoFactorSecret: 1 } });
    revalidatePath("/admin/users");
    return { ok: true, message: "Two-step sign-in turned off" };
  } catch (err) {
    return fail(errorMessage(err));
  }
}
