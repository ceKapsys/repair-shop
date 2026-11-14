import { run } from "./_run";

/**
 * The first seed wrote demo hero text into settings. The home hero now uses the locked copy unless the
 * owner overrides it, so the seeded demo values are cleared. A hero title the owner typed themselves
 * (anything not in the list below) is left alone. `contacts.whatsappMessage` is no longer read
 * (WhatsApp messages are page-aware now) and is left in place.
 */
const SEEDED_TITLES = ["Phone or laptop broken? We come to you."];

run({
  name: "002-legacy-demo-copy",
  async plan(db) {
    const s = await db.collection("settings").findOne({ _id: "site" as never });
    const title = s?.hero?.title as string | undefined;
    const seeded = Boolean(title && (SEEDED_TITLES.includes(title) || s?.hero?.subtitle));
    return [
      `hero.title is ${title ? `"${title}"` : "empty"}`,
      seeded ? "would clear hero.title and hero.subtitle (demo text from the first seed)" : "nothing to clear",
    ];
  },
  async apply(db) {
    const res = await db
      .collection("settings")
      .updateOne({ _id: "site" as never, "hero.subtitle": { $exists: true } }, { $unset: { "hero.title": "", "hero.subtitle": "" } });
    return [`settings updated: ${res.modifiedCount}`];
  },
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
