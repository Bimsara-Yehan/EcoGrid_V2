import { API_BASE } from "./env";

type PickupAction = {
  id: string;
  stopId: string;
  action: "collected" | "missed" | "skipped";
  timestamp: number;
  photoDataUrl?: string; // later: upload to Firebase Storage, store URL
};

const KEY = "eg_pickup_queue_v1";
const DONE = "eg_pickup_done_v1";

const read = (): PickupAction[] => JSON.parse(localStorage.getItem(KEY) || "[]");
const write = (q: PickupAction[]) => localStorage.setItem(KEY, JSON.stringify(q));

const readDone = (): PickupAction[] => JSON.parse(localStorage.getItem(DONE) || "[]");
const writeDone = (d: PickupAction[]) => localStorage.setItem(DONE, JSON.stringify(d));

export function enqueuePickup(data: Omit<PickupAction, "id" | "timestamp">) {
  const q = read();
  q.push({ ...data, id: String(Date.now() + Math.random()), timestamp: Date.now() });
  write(q);
}

export async function flushPickups() {
  const q = read();
  const remaining: PickupAction[] = [];
  const done = readDone();

  for (const item of q) {
    try {
      const body = {
        stopId: item.stopId,
        action: item.action,
        timestamp: item.timestamp,
        // if you upload photo to storage first, send photoUrl instead
      };
      const res = await fetch(`${API_BASE}/api/pickups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      done.push(item); // for Daily Report UI if backend not ready yet
    } catch {
      remaining.push(item);
    }
  }
  write(remaining);
  writeDone(done);
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => flushPickups());
}
