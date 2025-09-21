// backend/controllers/pickupsController.js
import Pickup from "../models/Pickup.js";
import DriverStop from "../models/DriverStop.js";
import PublicBin from "../models/PublicBin.js";
import { broadcast } from "../utils/sse.js";
import mongoose from "mongoose";

export async function createPickup(req, res) {
  try {
    const uid = req.user?.uid || process.env.DEV_UID || "demo-driver-uid";
    const { stopId, action, photoUrl, reason, lat, lng } = req.body;

    if (!stopId || !action) {
      return res.status(400).json({ error: "stopId and action are required" });
    }

    // Find the stop in driver_stops (Option 1 flow)
    const stop = await DriverStop.findById(stopId);
    if (!stop) return res.status(404).json({ error: "Stop not found" });
    // Ensure the stop belongs to the current driver
    if (String(stop.driverUid) !== String(uid)) {
      return res.status(403).json({ error: "Forbidden: stop does not belong to this driver" });
    }

    const doc = await Pickup.create({
      date: stop.date,           // align with stop's date
      driverUid: uid,
      stopId,
      action,
      photoUrl,
      reason,
      location: (lat && lng) ? { lat, lng } : undefined,
    });

    // Update driver stop status to reflect action
    const status = action; // collected | missed | skipped
    await DriverStop.updateOne({ _id: stopId }, { $set: { status } });

    // If this was a bin stop and action is collected, clear bin status
    if (stop.kind === "bin" && action === "collected") {
      console.log("[pickup] bin collected:", { stopId: String(stop._id), metaBinId: stop?.meta?.binId });
      try {
        // Prefer explicit binId from meta
        const metaBinId = stop?.meta?.binId;
        if (metaBinId) {
          // First try by human binId (e.g., "PublicBin-001")
          const res1 = await PublicBin.updateOne(
            { binId: metaBinId },
            { $set: { "status.fillPct": 0, "status.needsPickup": false, "status.consecHigh": 0, "status.ts": new Date() } }
          );
          if (res1?.modifiedCount) {
            console.log("[pickup] cleared bin by binId", metaBinId);
            broadcast("bin_status", { binId: metaBinId, fillPct: 0, needsPickup: false, ts: new Date().toISOString() });
          }
          if (!res1?.modifiedCount) {
            // Fallback: treat metaBinId as Mongo _id string
            if (mongoose.isValidObjectId(metaBinId)) {
              const res2 = await PublicBin.updateOne(
                { _id: new mongoose.Types.ObjectId(metaBinId) },
                { $set: { "status.fillPct": 0, "status.needsPickup": false, "status.consecHigh": 0, "status.ts": new Date() } }
              );
              if (res2?.modifiedCount) {
                console.log("[pickup] cleared bin by _id", metaBinId);
                broadcast("bin_status", { binId: metaBinId, fillPct: 0, needsPickup: false, ts: new Date().toISOString() });
              } else {
                console.warn("[pickup] bin not found by metaBinId", metaBinId);
              }
            }
          }
        } else if (Array.isArray(stop.coords) && stop.coords.length >= 2) {
          // Fallback: nearest bin within ~50m
          const [lat, lng] = stop.coords;
          const nearest = await PublicBin.findOne({
            geo: {
              $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: 50
              }
            }
          }).select({ binId: 1 });
          if (nearest?.binId) {
            const res3 = await PublicBin.updateOne(
              { binId: nearest.binId },
              { $set: { "status.fillPct": 0, "status.needsPickup": false, "status.consecHigh": 0, "status.ts": new Date() } }
            );
            console.log("[pickup] cleared bin by geo near", nearest.binId, "modified=", res3?.modifiedCount);
            if (res3?.modifiedCount) {
              broadcast("bin_status", { binId: nearest.binId, fillPct: 0, needsPickup: false, ts: new Date().toISOString() });
            }
          }
        }
      } catch (e) {
        // Best-effort; do not fail the pickup
        console.warn("Failed to clear bin status after collection", e);
      }
    }

    res.status(201).json({ ok: true, pickup: doc });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create pickup" });
  }
}

export async function listPickups(req, res) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const uid = req.user?.uid || process.env.DEV_UID || "demo-driver-uid";
    
    const pickups = await Pickup.find({ date, driverUid: uid })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(pickups);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to list pickups" });
  }
} 