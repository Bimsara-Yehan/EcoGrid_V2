import { API_BASE } from "../lib/env";
import { getToken } from "./auth";

export async function createDropoff(payload: {
  facility: string;
  weightKg: number;
  time: string; // ISO
  notes?: string;
}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/dropoffs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
