// Simple localStorage-backed queue (MVP). Consider moving to IndexedDB/Workbox later.
// Pros: very small. Cons: localStorage is synchronous and limited.  :contentReference[oaicite:8]{index=8}

export type QueuedRequest = {
  id: string;                // uuid or timestamp
  url: string;
  method: "POST" | "PUT";
  body: any;                 // will be stringified
  headers?: Record<string, string>;
};

const KEY = "eg_queue_v1";

function readQueue(): QueuedRequest[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function writeQueue(q: QueuedRequest[]) { localStorage.setItem(KEY, JSON.stringify(q)); }

export function enqueue(req: QueuedRequest) {
  const q = readQueue();
  q.push(req);
  writeQueue(q);
}

export async function flushQueue() {
  const q = readQueue();
  const remaining: QueuedRequest[] = [];
  for (const item of q) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: { "Content-Type": "application/json", ...(item.headers || {}) },
        body: JSON.stringify(item.body)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      remaining.push(item); // keep it for next time
    }
  }
  writeQueue(remaining);
}

// auto-flush when the browser goes online again
if (typeof window !== "undefined") {
  window.addEventListener("online", () => flushQueue()); // retry when back online  :contentReference[oaicite:9]{index=9}
}
