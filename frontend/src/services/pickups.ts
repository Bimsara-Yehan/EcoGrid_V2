// frontend/src/services/pickups.ts
import { API_BASE } from "../lib/env";

export type CreatePickupBody = {
  stopId: string;
  action: "collected" | "missed" | "skipped";
  photoUrl?: string;         // data URL (optional)
  reason?: string;           // for missed/skipped (optional)
  lat?: number;
  lng?: number;
};

export async function createPickup(body: CreatePickupBody) {
  const r = await fetch(`${API_BASE}/api/pickups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
