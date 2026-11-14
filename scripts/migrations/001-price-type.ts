import { run } from "./_run";

/**
 * Price types are now fixed / from / hidden.
 *  - services.priceType "quote"  -> "hidden"
 *  - services.priceType "range"  -> "from" (priceMin is kept as the "from" figure; priceMax is left in place, unused)
 *  - devices.repairs[] without priceType -> "fixed", or "hidden" when showPrice is false
 * Nothing is dropped or renamed. Idempotent. The app reads the old values correctly without this migration.
 */
run({
  name: "001-price-type",
  async plan(db) {
    const services = db.collection("services");
    const devices = db.collection("devices");
    return [
      `services quote -> hidden: ${await services.countDocuments({ priceType: "quote" })}`,
      `services range -> from:   ${await services.countDocuments({ priceType: "range" })}`,
      `devices with repair rows missing priceType: ${await devices.countDocuments({ repairs: { $elemMatch: { priceType: { $exists: false } } } })}`,
    ];
  },
  async apply(db) {
    const services = db.collection("services");
    const devices = db.collection("devices");
    const a = await services.updateMany({ priceType: "quote" }, { $set: { priceType: "hidden" } });
    const b = await services.updateMany({ priceType: "range" }, { $set: { priceType: "from" } });
    const c = await devices.updateMany(
      { repairs: { $elemMatch: { priceType: { $exists: false }, showPrice: false } } },
      { $set: { "repairs.$[r].priceType": "hidden" } },
      { arrayFilters: [{ "r.priceType": { $exists: false }, "r.showPrice": false }] },
    );
    const d = await devices.updateMany(
      { repairs: { $elemMatch: { priceType: { $exists: false } } } },
      { $set: { "repairs.$[r].priceType": "fixed" } },
      { arrayFilters: [{ "r.priceType": { $exists: false } }] },
    );
    return [
      `services quote -> hidden: ${a.modifiedCount}`,
      `services range -> from:   ${b.modifiedCount}`,
      `device repair rows set to hidden: ${c.modifiedCount} device(s)`,
      `device repair rows set to fixed:  ${d.modifiedCount} device(s)`,
    ];
  },
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
