import Dropoff from "../models/Dropoff.js";

export async function createDropoff(req, res) {
  const { facility, weightKg, time, notes } = req.body;
  if (!facility || !weightKg || !time) return res.status(400).json({ message: "facility, weightKg, time required" });

  const date = new Date(time).toISOString().slice(0,10);
  const driverUid = req.user.uid;

  const doc = await Dropoff.create({ date, driverUid, facility, weightKg, time, notes });
  res.status(201).json(doc);
}
