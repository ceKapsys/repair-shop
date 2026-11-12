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

  await Settings.updateOne(
    { _id: "site" },
    {
      $setOnInsert: {
        shopName: siteDefaults.name,
        hero: siteDefaults.hero,
        branding: { primaryColor: siteDefaults.primaryColor },
        contacts: { ...siteDefaults.contacts },
        bookingSlots: { windows: ["09:00-12:00", "12:00-15:00", "15:00-18:00", "18:00-21:00"], leadTimeHours: 2, maxPerSlot: 3 },
        emergency: {
          enabled: true,
          fee: 0,
          schedule: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, enabled: true, open: "08:00", close: "22:00", responseMinutes: 15 })),
        },
        seoDefaults: siteDefaults.seo,
      },
    },
    { upsert: true },
  );
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
