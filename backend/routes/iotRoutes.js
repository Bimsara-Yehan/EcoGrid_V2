import express from "express";
import crypto from "crypto";
import PublicBin from "../models/PublicBin.js";
import BinReading from "../models/BinReading.js";
import { addSseClient, removeSseClient, broadcast } from "../utils/sse.js";
import IotAudit from "../models/IotAudit.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRoles } from "../middleware/auth.js";

const router = express.Router();
// Sensor posts are tiny; keep this endpoint strict
router.use(express.json({ limit: "4kb" }));

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}
function clamp(n, lo, hi) {
  n = Number(n);
  if (Number.isNaN(n)) return NaN;
  return Math.max(lo, Math.min(hi, n));
}

// very small in-memory per-device rate limiter (good enough for demo)
const lastPostByDevice = new Map(); // deviceId -> ms
const MIN_MS_BETWEEN_POSTS = 20_000; // 20s; tune later

router.post("/bin-reading", async (req, res) => {
  try {
    // --- auth headers ---
    const deviceId = req.header("X-Device-Id");
    const deviceToken = req.header("X-Device-Token");
    if (!deviceId || !deviceToken) {
      return res.status(401).json({ ok: false, error: "missing device headers" });
    }

    // --- rate limit per device (soft block) ---
    const nowMs = Date.now();
    const last = lastPostByDevice.get(deviceId) || 0;
    const since = nowMs - last;
    if (since < MIN_MS_BETWEEN_POSTS) {
      const retrySec = Math.max(1, Math.ceil((MIN_MS_BETWEEN_POSTS - since) / 1000));
      try { res.set("Retry-After", String(retrySec)); } catch {}
      return res.status(429).json({ ok: false, error: "rate_limited" });
    }

    // --- device lookup + token check ---
    const bin = await PublicBin.findOne({ deviceId }).select("+deviceTokenHash binId status disabled");
    if (!bin) return res.status(401).json({ ok: false, error: "unknown device" });
    if (bin.disabled) return res.status(403).json({ ok: false, error: "device_disabled" });
    if (bin.deviceTokenHash !== sha256(deviceToken)) {
      return res.status(401).json({ ok: false, error: "bad token" });
    }

    // --- body validation + normalization ---
    const { binId, ts, fillPct: rawFill, battery, temp, geo } = req.body || {};
    if (!binId || !ts) {
      return res.status(400).json({ ok: false, error: "binId and ts required" });
    }
    if (bin.binId !== binId) {
      return res.status(400).json({ ok: false, error: "binId mismatch for device" });
    }

    const when = new Date(ts);
    if (isNaN(when)) return res.status(400).json({ ok: false, error: "bad ts" });

    // reject readings >5 min in the future (device clock wrong)
    const fiveMinAhead = Date.now() + 5 * 60_000;
    if (when.getTime() > fiveMinAhead) {
      return res.status(400).json({ ok: false, error: "future ts" });
    }

    // fill normalization: accept string/number; clamp to [0,100]
    const fillPct = clamp(rawFill, 0, 100);
    if (Number.isNaN(fillPct)) {
      return res.status(400).json({ ok: false, error: "fillPct must be number" });
    }

    // ignore stale readings (older than current status.ts)
    if (bin.status?.ts && when <= new Date(bin.status.ts)) {
      return res.json({ ok: true, ignored: "stale" });
    }

    // --- idempotent insert (unique index on {binId, ts}) ---
    // sanitize geo if provided
    let cleanGeo = undefined;
    try {
      const coords = Array.isArray(geo?.coordinates) ? geo.coordinates : null;
      if (coords && coords.length >= 2) {
        const lng = Number(coords[0]);
        const lat = Number(coords[1]);
        if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
          cleanGeo = { type: "Point", coordinates: [lng, lat] };
        }
      }
    } catch {}

    // clamp plausibility for aux sensors
    const battNum = Number(battery);
    const tempNum = Number(temp);
    const cleanBattery = Number.isFinite(battNum) ? Math.max(2.5, Math.min(4.5, battNum)) : undefined;
    const cleanTemp    = Number.isFinite(tempNum) ? Math.max(-20, Math.min(80, tempNum)) : undefined;

    try {
      await BinReading.create({ binId, ts: when, fillPct, battery: cleanBattery, temp: cleanTemp, geo: cleanGeo });
    } catch (e) {
      if (e?.code !== 11000) throw e; // duplicate -> safe retry
    }

    // --- hysteresis ---
    const HIGH = 75;
    const LOW_CLEAR = 30;
    const prevConsecHigh = bin.status?.consecHigh || 0;
    const consecHigh = fillPct >= HIGH ? prevConsecHigh + 1 : 0;
    const needsPickup = fillPct < LOW_CLEAR ? false : consecHigh >= 2;

    const upd = await PublicBin.updateOne(
      { binId, $or: [ { "status.ts": { $lt: when } }, { "status.ts": { $exists: false } } ] },
      {
        $set: {
          "status.fillPct": fillPct,
          "status.ts": when,
          "status.needsPickup": needsPickup,
          "status.consecHigh": consecHigh,
        },
      }
    );
    const updated = Boolean(upd?.modifiedCount);
    if (updated) {
      broadcast("bin_status", { binId, fillPct, needsPickup, ts: when.toISOString() });
    }

    // mark the rate-limit timestamp only on success
    lastPostByDevice.set(deviceId, nowMs);

    return res.json({ ok: true, needsPickup, consecHigh, fillPct, ts: when.toISOString(), updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/iot/public-bins?candidateOnly=0|1
router.get("/public-bins", async (req, res) => {
  try {
    const candidateOnly = String(req.query.candidateOnly || "0") === "1";
    const query = candidateOnly ? { "status.needsPickup": true } : {};
    const docs = await PublicBin.find(query).limit(2000).lean();
    const out = docs.map(d => ({
      id: String(d._id),
      binId: d.binId,
      coords: Array.isArray(d?.geo?.coordinates) && d.geo.coordinates.length >= 2
        ? [d.geo.coordinates[1], d.geo.coordinates[0]] // [lat, lng] for maps
        : undefined,
      fillLevel: d?.status?.fillPct ?? 0,
      measuredAt: d?.status?.ts ?? null,
      needsPickup: !!d?.status?.needsPickup
    })).filter(x => x.coords);
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to read public bins" });
  }
});

// GET /api/iot/events — Server-Sent Events for live bin updates
router.get("/events", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  res.flushHeaders?.();
  const client = addSseClient(res);
  req.on("close", () => removeSseClient(client));
});

// POST /api/iot/device/disable { deviceId, reason? }
router.post("/device/disable", requireAuth, requireRoles("scheduler"), async (req, res) => {
  try {
    const { deviceId, reason } = req.body || {};
    if (!deviceId) return res.status(400).json({ ok: false, error: "deviceId required" });
    const upd = await PublicBin.updateOne({ deviceId }, { $set: { disabled: true } });
    await IotAudit.create({ actorUid: req.user?.uid, action: "device_disable", target: { deviceId }, meta: { reason } });
    return res.json({ ok: true, updated: Boolean(upd?.modifiedCount) });
  } catch (e) {
    console.error(e); return res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/iot/device/enable { deviceId }
router.post("/device/enable", requireAuth, requireRoles("scheduler"), async (req, res) => {
  try {
    const { deviceId } = req.body || {};
    if (!deviceId) return res.status(400).json({ ok: false, error: "deviceId required" });
    const upd = await PublicBin.updateOne({ deviceId }, { $unset: { disabled: 1 } });
    await IotAudit.create({ actorUid: req.user?.uid, action: "device_enable", target: { deviceId } });
    return res.json({ ok: true, updated: Boolean(upd?.modifiedCount) });
  } catch (e) {
    console.error(e); return res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /api/iot/device/rotate-token { deviceId, newToken }
router.post("/device/rotate-token", requireAuth, requireRoles("scheduler"), async (req, res) => {
  try {
    const { deviceId, newToken } = req.body || {};
    if (!deviceId || !newToken) return res.status(400).json({ ok: false, error: "deviceId and newToken required" });
    const newHash = sha256(newToken);
    const upd = await PublicBin.updateOne({ deviceId }, { $set: { deviceTokenHash: newHash } });
    await IotAudit.create({ actorUid: req.user?.uid, action: "token_rotate", target: { deviceId } });
    return res.json({ ok: true, updated: Boolean(upd?.modifiedCount) });
  } catch (e) {
    console.error(e); return res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
