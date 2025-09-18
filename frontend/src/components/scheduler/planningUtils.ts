import type { CustomerCandidate, Depot } from "../../services/scheduler";

export type PlannedStop = { id: string; name: string; coords: [number, number] };
export type Plan = Record<string, PlannedStop[]>; // driverId -> ordered stops

function toRad(d: number) { return (d * Math.PI) / 180; }
function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function nearestNeighborOrder(start: [number, number], points: PlannedStop[]): PlannedStop[] {
  const remaining = [...points];
  const ordered: PlannedStop[] = [];
  let current = start;
  while (remaining.length) {
    let best = 0; let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(current, remaining[i].coords);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    const next = remaining.splice(best, 1)[0];
    ordered.push(next);
    current = next.coords;
  }
  return ordered;
}

export function suggestPlan(
  drivers: { id: string; maxStops?: number }[],
  depots: Depot[],
  driverConfig: Record<string, { depotId?: string; windowStart?: string; windowEnd?: string; maxStops?: number }>,
  customers: CustomerCandidate[],
  depotById: Record<string, Depot>,
): Plan {
  const buckets = new Map<string, PlannedStop[]>();
  drivers.forEach(d => buckets.set(d.id, []));

  const maxByDriver = (id: string) => driverConfig[id]?.maxStops ?? drivers.find(x => x.id === id)?.maxStops ?? 40;
  const depotOf = (id: string) => driverConfig[id]?.depotId ? depotById[driverConfig[id]!.depotId!] : undefined;

  for (const c of customers) {
    let bestDriver: string | null = null; let bestDist = Number.POSITIVE_INFINITY;
    for (const d of drivers) {
      const dep = depotOf(d.id) || depots[0];
      if (!dep) continue;
      const assigned = buckets.get(d.id) ?? [];
      if (assigned.length >= maxByDriver(d.id)) continue;
      const dist = haversineKm(dep.coords, c.coords);
      if (dist < bestDist) { bestDist = dist; bestDriver = d.id; }
    }
    if (bestDriver) {
      const arr = buckets.get(bestDriver)!;
      arr.push({ id: c.id, name: c.name, coords: c.coords });
      buckets.set(bestDriver, arr);
    }
  }

  const nextPlan: Plan = {};
  for (const d of drivers) {
    const dep = depotOf(d.id) || depots[0];
    const raw = buckets.get(d.id) ?? [];
    nextPlan[d.id] = dep ? nearestNeighborOrder(dep.coords, raw) : raw;
  }
  return nextPlan;
}

export function estimateMetrics(stops: PlannedStop[], depot?: [number, number]) {
  const avgSpeedKmh = 25;
  let distance = 0;
  let prev = depot;
  for (const s of stops) {
    if (prev) distance += haversineKm(prev, s.coords);
    prev = s.coords;
  }
  const travelHours = distance / avgSpeedKmh;
  const serviceMinutes = stops.length * 3;
  const minutes = Math.round(travelHours * 60 + serviceMinutes);
  return { stops: stops.length, distanceKm: distance.toFixed(1), durationMin: minutes };
}




