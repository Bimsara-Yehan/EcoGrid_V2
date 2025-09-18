import DriverStop from "../models/DriverStop.js";

export async function getStops(req, res) {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const uid = req.user.uid; // comes from auth middleware (dev bypass OK)
  const stops = await DriverStop.find({ driverUid: uid, date }).sort({ seq: 1, _id: 1 }).lean();
  res.json(stops);
}
