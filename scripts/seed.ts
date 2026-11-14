/**
 * Seed: placeholder settings, catalogue, posts, gallery frames, fixed pages and the first owner.
 *
 * Idempotent and non-destructive: every write is an upsert with $setOnInsert, so a record that
 * already exists (matched by slug / key / email) is never changed. Run it as often as you like.
 * It creates no bookings and no reviews: those must only ever be real.
 *
 *   pnpm seed
 *
 * The owner account comes from SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD; without both it is skipped.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Brand, Device, GalleryItem, Page, Post, PostCategory, Service, ServiceCategory, Settings, User } from "../src/models";

const FRAME = "/placeholders/frame.svg";
let created = 0;
let kept = 0;

/** Insert when missing; leave existing documents exactly as they are. Returns the document id. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensure(model: mongoose.Model<any>, filter: Record<string, unknown>, doc: Record<string, unknown>) {
  const res = await model.updateOne(filter, { $setOnInsert: doc }, { upsert: true });
  if (res.upsertedCount) created++;
  else kept++;
  const found = await model.findOne(filter).select("_id").lean<{ _id: mongoose.Types.ObjectId }>();
  return found!._id;
}

const days = [0, 1, 2, 3, 4, 5, 6];

async function seedSettings() {
  await ensure(Settings, { _id: "site" }, {
    shopName: "911 Doorstep Phone Repair",
    tagline: "Doorstep and emergency device repair in Florida",
    timezone: process.env.SHOP_TIMEZONE || "America/New_York",
    currency: process.env.SHOP_CURRENCY || "USD",
    contacts: {
      phones: ["(954) 955-7572"],
      whatsapp: "https://wa.me/message/6MOOTRK5QAJOD1",
      email: "911phonerepair.online@gmail.com",
      address: "4045 NW 16th St, Lauderhill, FL 33313",
      city: "Lauderhill & South Florida",
    },
    hours: [
      { day: 0, open: "06:00", close: "23:45", closed: false },
      { day: 1, open: "06:00", close: "23:45", closed: false },
      { day: 2, open: "07:00", close: "23:45", closed: false },
      { day: 3, open: "06:00", close: "23:45", closed: false },
      { day: 4, open: "06:00", close: "23:45", closed: false },
      { day: 5, open: "06:00", close: "23:45", closed: false },
      { day: 6, open: "06:00", close: "23:45", closed: false },
    ],
    serviceAreas: [
      { name: "Margate, Florida (Center Hub)", slug: "margate", note: "Center Hub · 15–25 min dispatch" },
      { name: "Pompano Beach", slug: "pompano-beach", note: "20–30 min dispatch" },
      { name: "Coconut Creek", slug: "coconut-creek", note: "15–25 min dispatch" },
      { name: "Coral Springs", slug: "coral-springs", note: "15–25 min dispatch" },
      { name: "North Lauderdale", slug: "north-lauderdale", note: "15–25 min dispatch" },
      { name: "Tamarac", slug: "tamarac", note: "20–30 min dispatch" },
      { name: "Parkland", slug: "parkland", note: "20–30 min dispatch" },
      { name: "Lighthouse Point", slug: "lighthouse-point", note: "20–35 min dispatch" },
      { name: "Deerfield Beach", slug: "deerfield-beach", note: "20–35 min dispatch" },
      { name: "Fort Lauderdale", slug: "fort-lauderdale", note: "25–40 min dispatch" },
      { name: "Sunrise", slug: "sunrise", note: "20–35 min dispatch" },
      { name: "Boca Raton", slug: "boca-raton", note: "25–40 min dispatch" },
      { name: "Fort Lauderdale (North)", slug: "fort-lauderdale-north", note: "20–35 min dispatch" },
      { name: "Hollywood", slug: "hollywood", note: "30–45 min dispatch" },
      { name: "Davie", slug: "davie", note: "25–40 min dispatch" },
      { name: "Plantation", slug: "plantation", note: "20–35 min dispatch" },
      { name: "West Palm Beach", slug: "west-palm-beach", note: "Doorstep mobile dispatch" },
      { name: "Miami", slug: "miami", note: "Doorstep mobile dispatch" },
    ],
    bookingSlots: { windows: ["09:00-12:00", "12:00-15:00", "15:00-18:00", "18:00-21:00"], leadTimeHours: 2, maxPerSlot: 4, daysAhead: 14, closedDays: [] },
    emergency: { enabled: true, fee: 35, schedule: days.map((day) => ({ day, enabled: true, open: "08:00", close: "23:00", responseMinutes: 30 })) },
    alertEmails: process.env.ALERT_EMAIL ? [process.env.ALERT_EMAIL] : [],
    notifications: { customerConfirmation: true, statusUpdates: true },
    faqs: [
      { question: "How much will my repair cost?", answer: "Each repair shows its price, or a starting price, before you book. If we need to check the device first, the check is free and we agree the price with you before any work starts." },
      { question: "Do repairs come with a warranty?", answer: "Yes. Every repair has a written warranty. The length is shown on each repair's page." },
      { question: "Do I need to be there during the repair?", answer: "Yes. The technician repairs your device in front of you, and you test it before paying." },
      { question: "How do I pay?", answer: "You pay the technician after the repair is finished and you have tested the device." },
      { question: "What if you can't fix it?", answer: "Then you pay nothing for the repair. We tell you what we found and what your options are." },
    ],
  });
}

async function seedOwner() {
  const email = (process.env.SEED_ADMIN_EMAIL || process.env.OWNER_EMAIL || "").toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD || process.env.OWNER_PASSWORD || "";
  if (!email || !password) return console.log("– Owner skipped: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one.");
  if (password.length < 10) return console.log("– Owner skipped: SEED_ADMIN_PASSWORD must be at least 10 characters.");
  await ensure(User, { email }, { name: "Owner", passwordHash: await bcrypt.hash(password, 12), role: "owner" });
  console.log(`✓ Owner ${email} (an existing account with this email is left unchanged)`);
}

const categories = [
  { name: "Screen and glass", slug: "screen-and-glass", icon: "smartphone" },
  { name: "Battery and charging", slug: "battery-and-charging", icon: "battery-charging" },
  { name: "Camera and sound", slug: "camera-and-sound", icon: "camera" },
  { name: "Laptop and PC", slug: "laptop-and-pc", icon: "laptop" },
  { name: "Software and data", slug: "software-and-data", icon: "hard-drive" },
  { name: "Other repairs", slug: "other-repairs", icon: "wrench" },
];

type SeedService = {
  title: string; slug: string; cat: string; icon: string; shortDesc: string; verbPhrase: string;
  priceType: "fixed" | "from" | "hidden"; price?: number; duration: string; warrantyDays: number; partsNote: string; emergency?: boolean;
  faq?: [string, string];
};

const services: SeedService[] = [
  { title: "Screen replacement", slug: "screen-replacement", cat: "screen-and-glass", icon: "smartphone", shortDesc: "Cracked, black or unresponsive screen replaced at your door.", verbPhrase: "replace cracked and unresponsive screens", priceType: "from", price: 2500, duration: "30–45 minutes", warrantyDays: 90, partsNote: "Original or high-grade compatible, your choice", emergency: true, faq: ["Will I lose my data?", "No. A screen replacement doesn't touch your storage. We still suggest a backup if the phone turns on."] },
  { title: "Back glass repair", slug: "back-glass-repair", cat: "screen-and-glass", icon: "square-stack", shortDesc: "Shattered back glass removed and replaced.", verbPhrase: "replace broken back glass", priceType: "from", price: 1800, duration: "45–60 minutes", warrantyDays: 90, partsNote: "High-grade compatible glass" },
  { title: "Battery replacement", slug: "battery-replacement", cat: "battery-and-charging", icon: "battery-charging", shortDesc: "A new battery when yours drains fast, swells or shuts down.", verbPhrase: "replace worn-out batteries", priceType: "from", price: 1500, duration: "20–30 minutes", warrantyDays: 180, partsNote: "New cells, never refurbished", emergency: true, faq: ["How do I know I need a new battery?", "If the phone drops from 30% to off, gets hot while charging, or the back is lifting, the battery needs replacing."] },
  { title: "Charging port repair", slug: "charging-port-repair", cat: "battery-and-charging", icon: "plug", shortDesc: "Loose cable, slow charging or no charging at all.", verbPhrase: "clean or replace faulty charging ports", priceType: "from", price: 1200, duration: "30–45 minutes", warrantyDays: 90, partsNote: "Compatible port assembly", emergency: true },
  { title: "Camera repair", slug: "camera-repair", cat: "camera-and-sound", icon: "camera", shortDesc: "Blurry, shaking or black camera fixed, front or rear.", verbPhrase: "replace faulty cameras and lenses", priceType: "from", price: 2000, duration: "30–45 minutes", warrantyDays: 90, partsNote: "Original camera modules where available" },
  { title: "Speaker and microphone repair", slug: "speaker-microphone-repair", cat: "camera-and-sound", icon: "volume-2", shortDesc: "Callers can't hear you, or sound is quiet or crackling.", verbPhrase: "fix speakers and microphones", priceType: "from", price: 1000, duration: "30 minutes", warrantyDays: 90, partsNote: "Compatible parts" },
  { title: "Water damage treatment", slug: "water-damage-treatment", cat: "other-repairs", icon: "droplets", shortDesc: "Device opened, dried and cleaned after a spill or a drop in water.", verbPhrase: "open, clean and dry water-damaged devices", priceType: "hidden", duration: "1–2 hours", warrantyDays: 30, partsNote: "Parts quoted after the check", emergency: true, faq: ["What should I do right now?", "Switch the device off, don't charge it, and don't put it in rice. Book an emergency repair so we can open it quickly."] },
  { title: "Laptop screen replacement", slug: "laptop-screen-replacement", cat: "laptop-and-pc", icon: "laptop", shortDesc: "Cracked, flickering or lined laptop display replaced.", verbPhrase: "replace broken laptop screens", priceType: "from", price: 6500, duration: "45–60 minutes", warrantyDays: 90, partsNote: "Panel matched to your model" },
  { title: "Laptop keyboard replacement", slug: "laptop-keyboard-replacement", cat: "laptop-and-pc", icon: "keyboard", shortDesc: "Dead or sticking keys, or a keyboard damaged by a spill.", verbPhrase: "replace faulty laptop keyboards", priceType: "from", price: 3000, duration: "45–90 minutes", warrantyDays: 90, partsNote: "Compatible keyboard for your model" },
  { title: "Laptop cleaning and overheating fix", slug: "laptop-cleaning-overheating", cat: "laptop-and-pc", icon: "fan", shortDesc: "Fans cleaned and thermal paste renewed when a laptop runs hot or loud.", verbPhrase: "clean fans and renew thermal paste", priceType: "fixed", price: 1500, duration: "45 minutes", warrantyDays: 30, partsNote: "New thermal paste included" },
  { title: "Software and setup", slug: "software-and-setup", cat: "software-and-data", icon: "settings", shortDesc: "System reinstall, updates, virus removal and new-device setup.", verbPhrase: "reinstall systems, remove viruses and set up new devices", priceType: "fixed", price: 1000, duration: "1 hour", warrantyDays: 14, partsNote: "No parts needed" },
  { title: "Data recovery", slug: "data-recovery", cat: "software-and-data", icon: "hard-drive", shortDesc: "Photos and files recovered from a dead phone, laptop or drive.", verbPhrase: "recover photos and files from failed devices", priceType: "hidden", duration: "1–3 days", warrantyDays: 0, partsNote: "You only pay if we recover your files" },
];

const brands = [
  { name: "Apple iPhone", slug: "iphone", deviceType: "phone" },
  { name: "Samsung Galaxy", slug: "samsung-galaxy", deviceType: "phone" },
  { name: "Dell", slug: "dell", deviceType: "laptop" },
  { name: "Apple iPad", slug: "ipad", deviceType: "tablet" },
  { name: "Sony PlayStation", slug: "playstation", deviceType: "console" },
  { name: "Apple Watch", slug: "apple-watch", deviceType: "smartwatch" },
];

/** [brand slug, model, slug, release year, { service slug: price }] */
const models: [string, string, string, number, Record<string, number>][] = [
  ["iphone", "iPhone 15 Pro", "iphone-15-pro", 2023, { "screen-replacement": 28000, "battery-replacement": 6500, "back-glass-repair": 9000, "charging-port-repair": 5500, "camera-repair": 12000 }],
  ["iphone", "iPhone 15", "iphone-15", 2023, { "screen-replacement": 22000, "battery-replacement": 6000, "back-glass-repair": 8000, "charging-port-repair": 5000 }],
  ["iphone", "iPhone 14", "iphone-14", 2022, { "screen-replacement": 16000, "battery-replacement": 5000, "back-glass-repair": 7000, "charging-port-repair": 4500 }],
  ["iphone", "iPhone 13", "iphone-13", 2021, { "screen-replacement": 12000, "battery-replacement": 4500, "back-glass-repair": 6000, "charging-port-repair": 4000 }],
  ["iphone", "iPhone 12", "iphone-12", 2020, { "screen-replacement": 9500, "battery-replacement": 4000, "back-glass-repair": 5000 }],
  ["iphone", "iPhone 11", "iphone-11", 2019, { "screen-replacement": 6000, "battery-replacement": 3500, "charging-port-repair": 3000 }],
  ["samsung-galaxy", "Galaxy S24 Ultra", "galaxy-s24-ultra", 2024, { "screen-replacement": 32000, "battery-replacement": 5500, "back-glass-repair": 6000, "camera-repair": 11000 }],
  ["samsung-galaxy", "Galaxy S24", "galaxy-s24", 2024, { "screen-replacement": 21000, "battery-replacement": 5000, "back-glass-repair": 5000 }],
  ["samsung-galaxy", "Galaxy S23", "galaxy-s23", 2023, { "screen-replacement": 18000, "battery-replacement": 4500, "charging-port-repair": 3500 }],
  ["samsung-galaxy", "Galaxy A54", "galaxy-a54", 2023, { "screen-replacement": 9000, "battery-replacement": 3000, "charging-port-repair": 2500 }],
  ["samsung-galaxy", "Galaxy A15", "galaxy-a15", 2023, { "screen-replacement": 5500, "battery-replacement": 2500, "charging-port-repair": 2000 }],
  ["dell", "XPS 13", "xps-13", 2023, { "laptop-screen-replacement": 22000, "laptop-keyboard-replacement": 7500, "battery-replacement": 8500 }],
  ["dell", "Inspiron 15", "inspiron-15", 2023, { "laptop-screen-replacement": 9500, "laptop-keyboard-replacement": 4000, "battery-replacement": 5500 }],
  ["dell", "Latitude 5440", "latitude-5440", 2023, { "laptop-screen-replacement": 12000, "laptop-keyboard-replacement": 4500, "battery-replacement": 6500 }],
  ["ipad", "iPad Pro 11-inch", "ipad-pro-11", 2022, { "screen-replacement": 26000, "battery-replacement": 9000, "charging-port-repair": 6000 }],
  ["ipad", "iPad Air (5th generation)", "ipad-air-5", 2022, { "screen-replacement": 18000, "battery-replacement": 8000 }],
  ["ipad", "iPad (10th generation)", "ipad-10", 2022, { "screen-replacement": 12000, "battery-replacement": 7000 }],
  ["playstation", "PlayStation 5", "playstation-5", 2020, {}],
  ["playstation", "PlayStation 4 Pro", "playstation-4-pro", 2016, {}],
  ["apple-watch", "Apple Watch Series 9", "apple-watch-series-9", 2023, { "screen-replacement": 14000, "battery-replacement": 5500 }],
];

const postCategories = [
  { name: "Care tips", slug: "care-tips" },
  { name: "Repair guides", slug: "repair-guides" },
];

const posts = [
  {
    title: "Phone fell in water? Do these five things first",
    slug: "phone-fell-in-water-first-steps",
    cat: "care-tips",
    excerpt: "The first ten minutes decide whether a wet phone survives. Here is what to do, and what to skip.",
    html: "<p>A phone that has been in water can often be saved, but only if you act in the right order.</p><h2>1. Switch it off</h2><p>Hold the power button and turn it off straight away. Electricity moving through wet parts is what causes the damage.</p><h2>2. Don't charge it</h2><p>Plugging in a wet phone can short the charging circuit. Leave the cable out until it has been opened and dried.</p><h2>3. Remove the case and SIM tray</h2><p>This lets trapped water out and air in.</p><h2>4. Skip the rice</h2><p>Rice doesn't pull water out from under the shields on the board, and the dust can clog the ports. Keep the phone upright in a dry, airy place instead.</p><h2>5. Get it opened the same day</h2><p>Corrosion starts within hours. A technician can open the phone, clean the board and dry it properly. <a href=\"/emergency\">Book an emergency repair</a> if it can't wait.</p>",
  },
  {
    title: "Is it the battery or the charger? How to tell",
    slug: "battery-or-charger-how-to-tell",
    cat: "repair-guides",
    excerpt: "Slow charging has three usual causes. Two of them you can check at home in a minute.",
    html: "<p>When a phone charges slowly or not at all, the cause is nearly always the cable, the port or the battery.</p><h2>Check the cable and adapter</h2><p>Try a different cable and adapter that you know work on another device. If charging returns to normal, you're done.</p><h2>Look inside the port</h2><p>Shine a light into the charging port. Pocket lint packs down at the bottom and stops the cable seating. If the cable feels loose or doesn't click in, the port needs cleaning or replacing. See <a href=\"/services/charging-port-repair\">charging port repair</a>.</p><h2>Watch the battery</h2><p>If the phone charges but drains in a few hours, shuts down above 20%, or the screen is lifting, the battery is worn. See <a href=\"/services/battery-replacement\">battery replacement</a>.</p>",
  },
  {
    title: "Original or compatible screen: which should you choose?",
    slug: "original-or-compatible-screen",
    cat: "repair-guides",
    excerpt: "Both will fix a cracked screen. The difference is in colour, brightness, touch feel and price.",
    html: "<p>When you book a <a href=\"/services/screen-replacement\">screen replacement</a>, we usually offer two kinds of part.</p><h2>Original screens</h2><p>Made by or for the phone's manufacturer. Colour, brightness and touch response match what the phone had when new. They cost more.</p><h2>High-grade compatible screens</h2><p>Made by other factories to fit your model. Good ones are close to the original in daily use, but can be slightly less bright or use a little more battery. They cost noticeably less.</p><h2>How to decide</h2><p>If you plan to keep the phone for years, or it's a recent flagship, the original is worth it. For an older phone, a compatible screen is a sensible saving. Either way the price is agreed before we start and the repair is covered by a written warranty.</p>",
  },
];

const pages: Record<string, { title: string; intro?: string; html?: string }> = {
  about: {
    title: "About us",
    intro: "A local repair team that comes to you.",
    html: "<p>We repair phones, laptops, tablets, consoles, smartwatches and audio devices at your home or office. You book a time, a technician arrives with the parts, and the repair is done in front of you.</p><h2>How we work</h2><ul><li>The price is agreed before any work starts.</li><li>You watch the repair and test the device before you pay.</li><li>Every repair has a written warranty.</li></ul><p>Edit this page in admin › SEO › Pages to tell customers about your shop, your technicians and how long you have been repairing devices.</p>",
  },
  privacy: {
    title: "Privacy policy",
    html: "<p>This policy explains what we collect when you book a repair and how we use it. Replace this placeholder with your own policy before launch.</p><h2>What we collect</h2><p>When you book, we collect your name, phone number, address, optional email, the device and problem you describe, and any photos you add.</p><h2>How we use it</h2><p>We use these details only to arrange and carry out your repair, to contact you about the booking, and to keep a record of the work for warranty purposes. We do not sell your details or share them for advertising.</p><h2>How long we keep it</h2><p>Completed bookings are kept for warranty and accounting records. Cancelled bookings are deleted automatically after 12 months.</p><h2>Your device</h2><p>Repairs are done in front of you. We do not need your passcode for hardware repairs and we do not copy data from your device.</p><h2>Cookies and analytics</h2><p>The site uses analytics to count visits and see which pages are useful. It does not use advertising cookies.</p><h2>Contact</h2><p>To see, correct or delete your details, contact us using the details on the contact page.</p>",
  },
  terms: {
    title: "Terms of service",
    html: "<p>These terms apply when you book a repair with us. Replace this placeholder with your own terms before launch.</p><h2>Bookings</h2><p>A booking is a request for a visit. We call you to confirm the time. You can cancel or move a booking at no cost before the technician sets off.</p><h2>Prices</h2><p>Prices shown on the site are for the repair described. If the technician finds something different, the new price is agreed with you before any work starts. If you don't agree, you pay nothing for the repair.</p><h2>Emergency repairs</h2><p>Emergency visits carry the emergency fee shown when you book, in addition to the repair price.</p><h2>Warranty</h2><p>Each repair is covered by a written warranty for the period shown on the repair's page. The warranty covers the part fitted and our workmanship. It does not cover new physical or liquid damage.</p><h2>Your data</h2><p>We take care with your device, but we recommend backing up before any repair. We are not responsible for data lost because of a fault that was already present.</p><h2>Payment</h2><p>Payment is due to the technician when the repair is finished and you have tested the device.</p>",
  },
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  await mongoose.connect(uri);
  console.log(`Seeding "${mongoose.connection.db!.databaseName}" (existing records are never changed)\n`);

  await seedSettings();
  await seedOwner();

  const catId = new Map<string, mongoose.Types.ObjectId>();
  for (const [i, c] of categories.entries()) catId.set(c.slug, await ensure(ServiceCategory, { slug: c.slug }, { ...c, order: i }));

  const serviceId = new Map<string, mongoose.Types.ObjectId>();
  for (const [i, s] of services.entries()) {
    serviceId.set(s.slug, await ensure(Service, { slug: s.slug }, {
      title: s.title, slug: s.slug, categoryId: catId.get(s.cat), icon: s.icon, shortDesc: s.shortDesc, verbPhrase: s.verbPhrase,
      priceType: s.priceType, priceMin: s.price, showPrice: s.priceType !== "hidden", duration: s.duration, warrantyDays: s.warrantyDays,
      partsNote: s.partsNote, isEmergencyAvailable: Boolean(s.emergency), images: [], deviceIds: [],
      faqs: s.faq ? [{ question: s.faq[0], answer: s.faq[1] }] : [], order: i, isActive: true,
    }));
  }

  const brandId = new Map<string, mongoose.Types.ObjectId>();
  for (const [i, b] of brands.entries()) brandId.set(b.slug, await ensure(Brand, { slug: b.slug }, { ...b, order: i }));

  for (const [brand, model, slug, releaseYear, prices] of models) {
    const repairs = Object.entries(prices)
      .filter(([s]) => serviceId.has(s))
      .map(([s, price]) => ({ serviceId: serviceId.get(s), priceType: "fixed", price, showPrice: true }));
    await ensure(Device, { brandId: brandId.get(brand), slug }, { brandId: brandId.get(brand), model, slug, releaseYear, repairs, isActive: true });
  }

  const postCatId = new Map<string, mongoose.Types.ObjectId>();
  for (const c of postCategories) postCatId.set(c.slug, await ensure(PostCategory, { slug: c.slug }, c));
  for (const [i, p] of posts.entries()) {
    const words = p.html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    await ensure(Post, { slug: p.slug }, {
      title: p.title, slug: p.slug, excerpt: p.excerpt, body: { html: p.html }, categoryIds: [postCatId.get(p.cat)], tags: [],
      coverImage: { url: FRAME, alt: p.title, width: 1200, height: 900 },
      status: "published", publishAt: new Date(Date.now() - (i + 1) * 86_400_000), readingTime: Math.max(1, Math.round(words / 220)),
    });
  }

  const frames = ["Screen replacement", "Battery replacement", "Charging port repair", "Laptop screen replacement", "Back glass repair", "Camera repair"];
  for (const [i, name] of frames.entries()) {
    await ensure(GalleryItem, { caption: `${name} (placeholder)` }, {
      image: { url: FRAME, width: 1200, height: 900 }, caption: `${name} (placeholder)`,
      alt: `Placeholder for a photo of a ${name.toLowerCase()}`, tags: [name], isBeforeAfter: false, order: i,
    });
  }

  for (const [key, p] of Object.entries(pages)) await ensure(Page, { key }, { key, title: p.title, intro: p.intro, body: { html: p.html } });

  console.log(`\n✓ Done: ${created} created, ${kept} already there and left unchanged.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
