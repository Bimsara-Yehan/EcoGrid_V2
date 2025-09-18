import { API_BASE } from "../lib/env";

export async function createDropoff(payload: {
  facility: string;
  weightKg: number;
  time: string; // ISO
  notes?: string;
}) {
  const res = await fetch(`${API_BASE}/api/dropoffs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
