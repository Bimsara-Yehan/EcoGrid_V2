import DriverStop from "../models/DriverStop.js";
import PublicBin from "../models/PublicBin.js";
import mongoose from "mongoose";

export async function getStops(req, res) {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const uid = req.user.uid; // comes from auth middleware (dev bypass OK)
  const stops = await DriverStop.find({ driverUid: uid, date }).sort({ seq: 1, _id: 1 }).lean();

  // Enrich bin stops with latest status (fill and last updated) from PublicBin when meta.binId present
  try {
    const binIds = Array.from(new Set(
      stops
        .filter(s => s?.kind === "bin" && s?.meta?.binId)
        .map(s => String(s.meta.binId))
    ));
    let mapById = new Map();
    if (binIds.length) {
      const objIds = binIds.filter(mongoose.isValidObjectId).map(id => new mongoose.Types.ObjectId(id));
      const bins = await PublicBin.find({ _id: { $in: objIds } }).select({ status: 1 }).lean();
      mapById = new Map(bins.map(b => [String(b._id), { fill: b?.status?.fillPct ?? null, ts: b?.status?.ts ?? null }]));
    }
    const enriched = stops.map(s => {
      if (s?.kind === "bin" && s?.meta?.binId) {
        const info = mapById.get(String(s.meta.binId));
        if (info) {
          const out = { ...s };
          if (typeof out.fill !== "number" && typeof info.fill === "number") out.fill = info.fill;
          // If subtitle not present, add a brief last-updated line
          if (!out.subtitle && info.ts) {
            try {
              const t = new Date(info.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              out.subtitle = `Updated ${t}`;
            } catch {}
          }
          return out;
        }
      }
      return s;
    });
    return res.json(enriched);
  } catch {
    // On any enrichment error, fall back to raw stops
    return res.json(stops);
  }
}
