// backend/controllers/pickupsController.js
import Pickup from "../models/Pickup.js";
import DriverStop from "../models/DriverStop.js";

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