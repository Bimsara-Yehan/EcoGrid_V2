import { API_BASE } from "../lib/env";
import { getToken } from "./auth";

export type PublishStop = {
  kind: "household" | "bin" | "incident";
  title?: string;
  subtitle?: string;
  coords: [number, number];
  fill?: number;
};

export type PublishDriver = {
  driverUid: string;
  stops: PublishStop[];
};

export type PublishPayload = {
  planId: string;
  planVersion: number;
  date: string; // YYYY-MM-DD
  note?: string;
  drivers: PublishDriver[];
  dryRun?: boolean;
};

export async function publishPlan(payload: PublishPayload) {
  const token = getToken();
  const r = await fetch(`${API_BASE}/api/scheduler/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}












