"use server";

import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/auth";
import { errorMessage, fail, zodErrors, type ActionResult } from "@/lib/action";
import { decrypt, encrypt } from "@/lib/crypto";
import { connectDb } from "@/lib/db";
import { loadSettings } from "@/lib/settings";
import { generateSecret, otpauthUri, verifyTotp } from "@/lib/totp";
import { passwordChangeInput } from "@/lib/validation/admin";
import { User } from "@/models";

export async function changePassword(input: unknown): Promise<ActionResult> {
  try {
    const { user } = await requireRole();
    const parsed = passwordChangeInput.safeParse(input);
    if (!parsed.success) return fail("Please fix the highlighted fields", zodErrors(parsed.error));
    await connectDb();
    const doc = await User.findById(user.id).select("+passwordHash");
    if (!doc || !(await bcrypt.compare(parsed.data.current, doc.passwordHash)))
      return fail("Please fix the highlighted fields", { current: "That isn’t your current password" });
    doc.passwordHash = await bcrypt.hash(parsed.data.next, 12);
    await doc.save();
    return { ok: true, message: "Password changed" };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

/**
 * Step 1 of 2FA enrolment: a fresh secret and its QR code. Nothing is stored until the user proves
 * their app works with confirmTwoFactor(), so an abandoned setup leaves the account unchanged.
 * The secret is sealed (encrypted) so the client can hand it back without being able to forge one.
 */
export async function startTwoFactor(): Promise<ActionResult<{ secret: string; qr: string; sealed: string }>> {
  try {
    const { user } = await requireRole();
    const s = await loadSettings();
    const secret = generateSecret();
    const qr = await QRCode.toDataURL(otpauthUri(secret, user.email, s.shopName), { margin: 1, width: 220 });
    return { ok: true, data: { secret, qr, sealed: encrypt(`${user.id}:${secret}`) } };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

export async function confirmTwoFactor(sealed: string, code: string): Promise<ActionResult> {
  try {
    const { user } = await requireRole();
    let secret = "";
    try {
      const [uid, s] = decrypt(String(sealed)).split(":");
      if (uid !== user.id) throw new Error();
      secret = s;
    } catch {
      return fail("Setup expired. Start again.");
    }
    if (!verifyTotp(secret, String(code).replace(/\s/g, ""))) return fail("That code didn’t match. Check your phone’s clock and try the newest code.");
    await connectDb();
    await User.updateOne({ _id: user.id }, { $set: { twoFactorSecret: encrypt(secret) } });
    revalidatePath("/admin/account");
    return { ok: true, message: "Two-step sign-in is on" };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

export async function disableTwoFactor(password: string): Promise<ActionResult> {
  try {
    const { user } = await requireRole();
    await connectDb();
    const doc = await User.findById(user.id).select("+passwordHash");
    if (!doc || !(await bcrypt.compare(String(password), doc.passwordHash))) return fail("Password is incorrect");
    await User.updateOne({ _id: user.id }, { $unset: { twoFactorSecret: 1 } });
    revalidatePath("/admin/account");
    return { ok: true, message: "Two-step sign-in is off" };
  } catch (err) {
    return fail(errorMessage(err));
  }
}
