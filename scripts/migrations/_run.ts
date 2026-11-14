import { config } from "dotenv";
import mongoose from "mongoose";

config({ path: ".env.local" });
config();

export type Migration = {
  name: string;
  /** Report what would change. Must not write. */
  plan: (db: mongoose.mongo.Db) => Promise<string[]>;
  /** Apply the change. Must be safe to run twice. */
  apply: (db: mongoose.mongo.Db) => Promise<string[]>;
};

/**
 * Runs a migration. Dry run by default: pass `--apply` to write.
 *   pnpm tsx scripts/migrations/001-price-type.ts           # dry run
 *   pnpm tsx scripts/migrations/001-price-type.ts --apply   # write
 */
export async function run(m: Migration) {
  const apply = process.argv.includes("--apply");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  const db = mongoose.connection.db!;
  try {
    console.log(`[${m.name}] ${apply ? "APPLY" : "DRY RUN (pass --apply to write)"} on database "${db.databaseName}"`);
    for (const line of await (apply ? m.apply(db) : m.plan(db))) console.log(`  ${line}`);
    console.log(`[${m.name}] done`);
  } finally {
    await mongoose.disconnect();
  }
}
