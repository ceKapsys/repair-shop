/**
 * Creates the settings document and the owner account.
 *   OWNER_EMAIL=you@example.com OWNER_PASSWORD='...' pnpm seed
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Settings } from "../src/models/Settings";
import { User } from "../src/models/User";
import { siteDefaults } from "../src/lib/site";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);

  // Only the shop name is stored; every other setting falls back to defaults in src/lib/settings.ts
  // until the owner saves Settings in the admin panel.
  await Settings.updateOne({ _id: "site" }, { $setOnInsert: { shopName: siteDefaults.name } }, { upsert: true });
  console.log("✓ settings");

  const email = process.env.OWNER_EMAIL;
  const password = process.env.OWNER_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error("OWNER_PASSWORD must be at least 12 characters");
    const passwordHash = await bcrypt.hash(password, 12);
    await User.updateOne(
      { email: email.toLowerCase() },
      { $set: { passwordHash, role: "owner" }, $setOnInsert: { name: "Owner" } },
      { upsert: true },
    );
    console.log(`✓ owner ${email}`);
  } else {
    console.log("• OWNER_EMAIL / OWNER_PASSWORD not set — skipped owner account");
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
