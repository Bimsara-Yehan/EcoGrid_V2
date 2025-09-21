export type LatLng = [number, number];

export type Depot = { id: string; name: string; coords: LatLng };
export type FacilityType = "composting" | "recycling" | "incineration" | "general";
export type Facility = { id: string; name: string; type: FacilityType; coords: LatLng };
export type CustomerCandidate = {
  id: string;
  name: string;
  serviceKind: "general" | "recycling" | "composting" | "incineration";
  coords: LatLng;
  priority?: number;
};
export type BinCandidate = { id: string; name: string; coords: LatLng; fillLevel: number; measuredAt?: string | null; needsPickup?: boolean };
export type Incident = { id: string; severity: "low" | "medium" | "high"; coords: LatLng; photoUrl?: string };
export type Driver = {
  id: string;
  name: string;
  color: string;
  defaultDepotId?: string;
  shiftWindow?: { start: string; end: string };
  maxStops?: number;
};

// Mock data providers so the UI can run without backend endpoints for these lists
import { API_BASE } from "../lib/env";
import { getToken } from "./auth";

function toLatLngFromApi(v: any): [number, number] | undefined {
  if (!v) return undefined;
  const lat = typeof v[0] === "number" ? v[0] : undefined;
  const lng = typeof v[1] === "number" ? v[1] : undefined;
  if (lat == null || lng == null) return undefined;
  return [lat, lng];
}

export async function fetchDepots(): Promise<Depot[]> {
  const token = getToken();
  const r = await fetch(`${API_BASE}/api/scheduler/depots`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const a = await r.json();
  return (a as any[]).map(d => ({ id: d.id, name: d.name, coords: toLatLngFromApi(d.coords)! })).filter(x => x.coords) as Depot[];
}

export async function fetchFacilities(): Promise<Facility[]> {
  const token = getToken();
  const r = await fetch(`${API_BASE}/api/scheduler/facilities`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const a = await r.json();
  return (a as any[]).map(f => ({ id: f.id, name: f.name, type: f.type, coords: toLatLngFromApi(f.coords)! })).filter(x => x.coords) as Facility[];
}

export async function fetchCustomersDue(): Promise<CustomerCandidate[]> {
  const token = getToken();
  const r = await fetch(`${API_BASE}/api/scheduler/customers`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const a = await r.json();
  return (a as any[]).map(c => ({ id: c.id, name: c.name, serviceKind: "general", coords: toLatLngFromApi(c.coords)! })).filter(x => x.coords) as CustomerCandidate[];
}

export async function fetchBins(): Promise<BinCandidate[]> {
  const token = getToken();
  const r = await fetch(`${API_BASE}/api/scheduler/bins?candidateOnly=0`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const a = await r.json();
  return (a as any[])
    .map(b => ({
      id: b.id,
      name: b.name,
      coords: toLatLngFromApi(b.coords)!,
      fillLevel: b.fillLevel ?? 0,
      measuredAt: b.measuredAt ?? null,
      needsPickup: !!b.needsPickup
    }))
    .filter(x => x.coords) as BinCandidate[];
}

export async function fetchIncidents(): Promise<Incident[]> {
  const token = getToken();
  const r = await fetch(`${API_BASE}/api/scheduler/incidents`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const a = await r.json();
  return (a as any[]).map(i => ({ id: i.id, severity: i.severity || "medium", coords: toLatLngFromApi(i.coords)!, photoUrl: i.photoUrl })).filter(x => x.coords) as Incident[];
}

export async function fetchDrivers(): Promise<Driver[]> {
  const token = getToken();
  const r = await fetch(`${API_BASE}/api/scheduler/drivers`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const a = await r.json();
  return (a as any[]).map((d: any) => ({ id: d.id, name: d.name, color: d.color || "#3B82F6", defaultDepotId: d.defaultDepotId, maxStops: 40 })) as Driver[];
}





