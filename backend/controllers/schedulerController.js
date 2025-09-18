// backend/controllers/schedulerController.js
import DriverStop from "../models/DriverStop.js";
import Pickup from "../models/Pickup.js";
import PlanPublish from "../models/PlanPublish.js";
import mongoose from "mongoose";

// Simple validators (MVP)
function isDateYYYYMMDD(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

const ALLOWED_KINDS = new Set(["household", "bin", "incident"]);

export async function publishPlan(req, res) {
  try {
    const { planId, planVersion, date, drivers, note, dryRun } = req.body || {};

    // Basic body validation
    if (!planId || typeof planId !== "string") {
      return res.status(400).json({ error: "planId (string) is required" });
    }
    if (!Number.isInteger(planVersion) || planVersion < 1) {
      return res.status(400).json({ error: "planVersion (integer >=1) is required" });
    }
    if (!isDateYYYYMMDD(date)) {
      return res.status(400).json({ error: "date must be YYYY-MM-DD" });
    }
    if (!Array.isArray(drivers) || drivers.length === 0) {
      return res.status(400).json({ error: "drivers (non-empty array) is required" });
    }

    // Validate drivers array
    const seen = new Set();
    for (const d of drivers) {
      if (!d || typeof d !== "object") {
        return res.status(400).json({ error: "each drivers[] item must be an object" });
      }
      const { driverUid, stops } = d;
      if (!driverUid || typeof driverUid !== "string") {
        return res.status(400).json({ error: "driverUid (string) is required for each driver" });
      }
      if (seen.has(driverUid)) {
        return res.status(400).json({ error: `duplicate driverUid '${driverUid}'` });
      }
      seen.add(driverUid);
      if (!Array.isArray(stops) || stops.length === 0) {
        return res.status(400).json({ error: `stops (non-empty array) required for driver '${driverUid}'` });
      }
      for (const s of stops) {
        if (!s || typeof s !== "object") {
          return res.status(400).json({ error: `invalid stop for driver '${driverUid}'` });
        }
        const { kind, title, coords } = s;
        if (!ALLOWED_KINDS.has(kind)) {
          return res.status(400).json({ error: `invalid kind '${kind}' for driver '${driverUid}'` });
        }
        if (!Array.isArray(coords) || coords.length !== 2 ||
            typeof coords[0] !== "number" || typeof coords[1] !== "number") {
          return res.status(400).json({ error: `coords [lat,lng] required for driver '${driverUid}'` });
        }
        // title is optional in schema, but helpful
        if (title != null && typeof title !== "string") {
          return res.status(400).json({ error: `title must be string if provided (driver '${driverUid}')` });
        }
      }
    }

    // Idempotency check
    const existing = await PlanPublish.findOne({ planId, planVersion }).lean();
    if (existing && !dryRun) {
      return res.status(200).json({ ok: true, date: existing.date, planId, planVersion, message: "Already published (idempotent)" });
    }

    // Replace semantics with transaction (fallback to non-transaction if not supported)
    const session = await mongoose.startSession();
    let summaries = [];
    async function replaceWithSession(sess) {
      const localSummaries = [];
      // Generate a routeId upfront to satisfy stops validator without relying on PlanPublish validation
      const routeId = new mongoose.Types.ObjectId();
      for (const d of drivers) {
        const { driverUid, stops } = d;
        const priorStops = await DriverStop.find({ driverUid, date }, null, sess ? { session: sess } : {}).lean();
        const priorIds = priorStops.map(s => s._id);
        const pickups = priorIds.length
          ? await Pickup.find({ stopId: { $in: priorIds } }, { stopId: 1 }, sess ? { session: sess } : {}).lean()
          : [];
        const started = new Set(pickups.map(p => String(p.stopId)));

        const removableIds = priorStops
          .filter(s => !started.has(String(s._id)))
          .map(s => s._id);
        const removedRes = removableIds.length
          ? await DriverStop.deleteMany({ _id: { $in: removableIds } }, sess ? { session: sess } : {})
          : { deletedCount: 0 };

        // Map UI kind to collection validator type
        function mapType(kind) {
          if (kind === "bin") return "public_bin";
          if (kind === "incident") return "public_litter_spot";
          return "household";
        }

        // We'll create a PlanPublish doc per request (outside loop) for routeId
        // But we also include planId/version on each stop

        const docs = stops.map((s, i) => {
          const lat = Array.isArray(s.coords) ? s.coords[0] : undefined;
          const lng = Array.isArray(s.coords) ? s.coords[1] : undefined;
          return {
            // Driver app fields (simple, validator-free)
            date,
            driverUid,
            kind: s.kind,
            title: s.title,
            subtitle: s.subtitle,
            coords: s.coords,
            fill: s.fill,
            seq: i + 1,
            status: "assigned",
            // Planning metadata
            planId,
            planVersion
          };
        });
        if (!dryRun) await DriverStop.insertMany(docs, sess ? { session: sess } : {});
        const keptCount = priorStops.length - removableIds.length;
        localSummaries.push({ driverUid, created: docs.length, kept: keptCount, removed: removedRes.deletedCount || 0 });
      }
      // Best-effort plan record (optional). Ignore validator issues on this auxiliary collection.
      // Skip PlanPublish persistence entirely in Option 1; not needed for driver flow
      return localSummaries;
    }

    try {
      await session.withTransaction(async () => {
        summaries = await replaceWithSession(session);
      });
    } catch (txErr) {
      // Fallback if transactions unsupported (e.g., standalone MongoDB)
      const msg = (txErr && txErr.message) || "";
      if (msg.includes("Transaction numbers are only allowed") || msg.includes("not supported")) {
        summaries = await replaceWithSession(null);
      } else {
        throw txErr;
      }
    } finally {
      session.endSession();
    }

    return res.status(200).json({ ok: true, date, planId, planVersion, dryRun: !!dryRun, drivers: summaries });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to publish plan" });
  }
}


