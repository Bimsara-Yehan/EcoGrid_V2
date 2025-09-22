// backend/seed/seedStops.js
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db.js";
import Stop from "../models/Stop.js";

// Optional CLI arg: date in YYYY-MM-DD (e.g. npm run seed:stops -- 2025-08-19)
const argDate = process.argv[2] ?? null;

async function run() {
  await connectDB();

  const date = argDate || new Date().toISOString().slice(0, 10);
  const driverUid = process.env.DEV_UID || "demo-driver-uid";

  // Clear then insert fresh demo stops for this driver+date
  await Stop.deleteMany({ date, driverUid });

  await Stop.insertMany([
    {
      date,
      driverUid,
      kind: "household",
      title: "15, Temple Rd, Kandy",
      subtitle: "8:30–9:30 AM",
      coords: [7.293, 80.634],
    },
    {
      date,
      driverUid,
      kind: "bin",
      title: "Bin #A12 (Near Park)",
      subtitle: "75% full",
      coords: [7.301, 80.641],
      fill: 82,
    },
    {
      date,
      driverUid,
      kind: "household",
      title: "42, Lake View",
      subtitle: "9:30–10:15 AM",
      coords: [7.285, 80.626],
    },
  ]);

  console.log(`✅ Seeded stops for ${date} driver: ${driverUid}`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
