import { API_BASE } from "../lib/env";
import type { Stop } from "../components/StopCard";

export async function fetchStops(date: string): Promise<Stop[]> {
  const res = await fetch(`${API_BASE}/api/stops?date=${date}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.json();
  return (raw as any[]).map(s => ({
    id: s._id,            // map Mongo _id -> UI id
    kind: s.kind,
    title: s.title,
    subtitle: s.subtitle,
    coords: s.coords,
    fill: s.fill,
    status: s.status || "assigned"
  })) as Stop[];
}
