import React, { useState } from "react";
import Layout from "../components/Layout";
import { enqueue, flushQueue } from "../lib/offlineQueue";

export default function DropOffLogPage() {
  const [facility, setFacility] = useState("");
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [time, setTime] = useState(() => new Date().toISOString().slice(0, 16)); // yyyy-mm-ddThh:mm
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string>("");

  async function submit() {
    const payload = { facility, weightKg: Number(weightKg), time, note };
    const req = {
      id: String(Date.now()),
      url: "/api/dropoffs",   // your backend route later
      method: "POST" as const,
      body: payload
    };

    // If online, try now; else enqueue
    if (navigator.onLine) { // online/offline is a boolean provided by the browser  :contentReference[oaicite:10]{index=10}
      try {
        const res = await fetch(req.url, {
          method: req.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setStatus("Submitted ✔");
        return;
      } catch {
        // fall through to enqueue
      }
    }

    // Enqueue for later and inform the driver
    enqueue(req);
    setStatus("Saved offline. Will send when online.");
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-4">
        <h1 className="text-lg font-semibold">Drop-Off Log</h1>
        <p className="text-sm text-slate-600">Record your disposal after completing the route.</p>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Facility</span>
            <input value={facility} onChange={e => setFacility(e.target.value)}
                   className="rounded-xl border px-3 py-3" placeholder="Central Recycling Center" />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Weight (kg)</span>
            <input type="number" min={0} step="0.1" value={weightKg}
                   onChange={e => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
                   className="rounded-xl border px-3 py-3" placeholder="e.g., 450.0" />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Time</span>
            <input type="datetime-local" value={time} onChange={e => setTime(e.target.value)}
                   className="rounded-xl border px-3 py-3" />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Notes (optional)</span>
            <textarea value={note} onChange={e => setNote(e.target.value)}
                      className="rounded-xl border px-3 py-3" rows={3}
                      placeholder="Receipt #123, compactor used, etc." />
          </label>

          <div className="flex gap-2">
            <button onClick={submit}
                    className="flex-1 rounded-xl px-4 py-4 text-white font-semibold"
                    style={{ backgroundColor: "var(--primary)", minHeight: 48 }}>
              Save
            </button>
            <button onClick={() => flushQueue()}
                    className="rounded-xl px-4 py-4 font-semibold bg-green-100"
                    style={{ minHeight: 48 }}>
              Retry Pending
            </button>
          </div>

          {status && <div className="text-sm">{status}</div>}
          {!navigator.onLine && (  // show offline hint
            <div className="text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
              You’re offline. Entries will send automatically when back online.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
