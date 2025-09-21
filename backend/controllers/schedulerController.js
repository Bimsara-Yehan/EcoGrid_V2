import DriverStop from "../models/DriverStop.js";

// POST /api/scheduler/publish
// Idempotent replace per driver+date: remove pending stops and insert new ordered set.
export async function publishPlan(req, res) {
  try {
    const { planId, planVersion, date, drivers = [], dryRun = false } = req.body || {};
    if (!planId || typeof planVersion !== "number" || !date || !Array.isArray(drivers)) {
      return res.status(400).json({ ok: false, error: "planId, planVersion, date, drivers are required" });
    }

    const results = [];

    if (dryRun) {
      for (const d of drivers) {
        const count = Array.isArray(d?.stops) ? d.stops.length : 0;
        results.push({ driverUid: d.driverUid, deleted: 0, inserted: count });
      }
      return res.json({ ok: true, dryRun: true, results });
    }

    for (const d of drivers) {
      const driverUid = String(d.driverUid);
      const stops = Array.isArray(d.stops) ? d.stops : [];

      // Replace semantics: delete only pending/assigned for that driver+date
      const del = await DriverStop.deleteMany({ driverUid, date, status: { $in: ["assigned"] } });

      if (stops.length === 0) {
        results.push({ driverUid, deleted: del.deletedCount || 0, inserted: 0 });
        continue;
      }

      const docs = stops.map((s, idx) => ({
        date,
        driverUid,
        kind: s.kind || "household",
        title: s.title || null,
        subtitle: s.subtitle || null,
        coords: s.coords,
        fill: typeof s.fill === "number" ? s.fill : undefined,
        seq: idx + 1,
        status: "assigned",
        planId,
        planVersion,
        meta: s.meta || undefined,
      }));

      const ins = await DriverStop.insertMany(docs, { ordered: true });
      results.push({ driverUid, deleted: del.deletedCount || 0, inserted: ins.length });
    }

    return res.json({ ok: true, results });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}


