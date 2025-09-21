import mongoose from "mongoose";

// Helper to map GeoJSON [lng,lat] to UI [lat,lng]
function toLatLng(geo) {
  const c = geo?.coordinates;
  if (!Array.isArray(c) || c.length < 2) return undefined;
  return [c[1], c[0]]; // [lat, lng]
}

export async function getDepots(req, res) {
  try {
    const col = mongoose.connection.collection("depots");
    const docs = await col.find({}).limit(1000).toArray();
    const out = docs.map(d => ({ id: String(d._id), name: d.name || "Depot", coords: toLatLng(d.geo) })).filter(x => x.coords);
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to read depots" });
  }
}

export async function getFacilities(req, res) {
  try {
    const compostCol = mongoose.connection.collection("compostingstations");
    const incinCol = mongoose.connection.collection("incinerators");
    const recyCol = mongoose.connection.collection("recyclingstations");
    const landCol = mongoose.connection.collection("landfills");

    const [compost, incin, recy, land] = await Promise.all([
      compostCol.find({}).limit(1000).toArray(),
      incinCol.find({}).limit(1000).toArray(),
      recyCol.find({}).limit(1000).toArray().catch(() => []),
      landCol.find({}).limit(1000).toArray().catch(() => []),
    ]);

    const map = (arr, type) => arr.map(d => ({ id: String(d._id), name: d.name || type, type, coords: toLatLng(d.geo) })).filter(x => x.coords);
    const out = [
      ...map(compost, "compost"),
      ...map(incin, "incinerator"),
      ...map(recy, "recycle"),
      ...map(land, "landfill"),
    ];
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to read facilities" });
  }
}

export async function getCustomers(req, res) {
  try {
    const col = mongoose.connection.collection("customers");
    const cur = col.find({}).project({ fullName: 1, addresses: 1 }).limit(2000);
    const out = [];
    for await (const d of cur) {
      const addr = Array.isArray(d.addresses) ? d.addresses.find(a => a?.geo?.coordinates) : null;
      const coords = addr ? toLatLng(addr.geo) : undefined;
      if (!coords) continue;
      out.push({ id: String(d._id), name: d.fullName || "Customer", coords });
    }
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to read customers" });
  }
}

export async function getBins(req, res) {
  try {
    const candidateOnly = String(req.query.candidateOnly || "0") === "1";
    const col = mongoose.connection.collection("publicbins");
    const docs = await col.find({}).limit(2000).toArray().catch(() => []);
    let out = docs
      .map(d => ({
        id: String(d._id),
        name: d.name || "Bin",
        coords: toLatLng(d.geo),
        fillLevel: d?.status?.fillPct ?? d.fillLevel ?? 0,
        measuredAt: d?.status?.ts ?? d.measuredAt ?? null,
        needsPickup: !!(d?.status?.needsPickup)
      }))
      .filter(x => x.coords);
    if (candidateOnly) out = out.filter(b => b.needsPickup === true);
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to read bins" });
  }
}

export async function getIncidents(req, res) {
  try {
    const col = mongoose.connection.collection("reports");
    const cursor = col.find({ type: { $in: ["illegal_dump", "incident"] } }).limit(1000);
    const out = [];
    for await (const d of cursor) {
      const geo = d?.payload?.geo;
      const coords = geo?.coordinates ? [geo.coordinates[1], geo.coordinates[0]] : undefined;
      if (!coords) continue;
      const severity = d?.payload?.severity || "medium";
      out.push({ id: String(d._id), severity, coords, photoUrl: d?.payload?.photoUrl || null });
    }
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to read incidents" });
  }
}

export async function getDrivers(req, res) {
  try {
    const col = mongoose.connection.collection("staffs");
    const docs = await col.find({ staffType: "driver" }).project({ userId: 1, name: 1, driver: 1 }).limit(2000).toArray();
    const palette = ["#EF4444", "#8B5CF6", "#10B981", "#3B82F6", "#F59E0B", "#14B8A6", "#EC4899", "#84CC16"];
    const out = docs.map((d, i) => ({
      id: String(d.userId || d._id),
      name: d.name || "Driver",
      color: palette[i % palette.length],
      defaultDepotId: d?.driver?.assignedDepotId ? String(d.driver.assignedDepotId) : undefined
    }));
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to read drivers" });
  }
}


