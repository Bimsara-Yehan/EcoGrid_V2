import mongoose from "mongoose";

function point(lng, lat){ return { type: "Point", coordinates: [lng, lat] }; }

export async function seedSchedulerData() {
  if (process.env.SEED_ON_BOOT !== "1") return;
  const db = mongoose.connection;

  // Depots
  try {
    const depots = db.collection("depots");
    const count = await depots.estimatedDocumentCount();
    if (count === 0) {
      await depots.insertMany([
        { name: "Depot - Kandy City", geo: point(80.6337, 7.2906) },
        { name: "Depot - Peradeniya", geo: point(80.5925, 7.2715) },
        { name: "Depot - Katugastota", geo: point(80.6237, 7.3408) },
        { name: "Depot - Digana", geo: point(80.7500, 7.3000) },
      ]);
      console.log("🌱 Seeded depots");
    }
  } catch {}

  // Recycling stations
  try {
    const recy = db.collection("recyclingstations");
    const count = await recy.estimatedDocumentCount();
    if (count === 0) {
      await recy.insertMany([
        { name: "Recycling South", geo: point(80.6200, 7.2500) },
        { name: "Recycling West", geo: point(80.5900, 7.2800) },
      ]);
      console.log("🌱 Seeded recyclingstations");
    }
  } catch {}

  // Landfills
  try {
    const land = db.collection("landfills");
    const count = await land.estimatedDocumentCount();
    if (count === 0) {
      await land.insertOne({ name: "Central Landfill", geo: point(80.6650, 7.3050) });
      console.log("🌱 Seeded landfills");
    }
  } catch {}

  // Public bins (placeholder for IoT)
  try {
    const bins = db.collection("publicbins");
    const count = await bins.estimatedDocumentCount();
    if (count === 0) {
      await bins.insertMany([
        { name: "Bin - Market", geo: point(80.6320, 7.2935), fillLevel: 82, measuredAt: new Date(), meta: { seed: true } },
        { name: "Bin - Park", geo: point(80.6005, 7.2805), fillLevel: 64, measuredAt: new Date(), meta: { seed: true } },
        { name: "Bin - School", geo: point(80.6300, 7.3350), fillLevel: 38, measuredAt: new Date(), meta: { seed: true } },
        { name: "Bin - Bus Stand", geo: point(80.7400, 7.3000), fillLevel: 77, measuredAt: new Date(), meta: { seed: true } },
      ]);
      console.log("🌱 Seeded publicbins");
    }
  } catch {}
}












