import React, { useState } from "react";
import Layout from "../components/Layout";
import { enqueue, flushQueue } from "../lib/offlineQueue";
import { createDropoff } from "../services/dropoffs";
import { getToken } from "../services/auth";

export default function DropOffLogPage() {
  const [facility, setFacility] = useState("");
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [time, setTime] = useState(() => new Date().toISOString().slice(0, 16)); // yyyy-mm-ddThh:mm
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string>("");
  const [errors, setErrors] = useState<{ facility?: string; weightKg?: string; time?: string }>({});

  function validate(): boolean {
    const errs: { facility?: string; weightKg?: string; time?: string } = {};
    if (!facility.trim()) errs.facility = "Facility is required";
    const w = typeof weightKg === "number" ? weightKg : Number(weightKg);
    if (!Number.isFinite(w) || w <= 0) errs.weightKg = "Enter a valid weight (> 0)";
    if (!time) errs.time = "Time is required";
    try {
      const dt = new Date(time);
      if (isNaN(dt.getTime())) errs.time = "Enter a valid date/time";
      else if (dt.getTime() > Date.now() + 60_000) errs.time = "Time cannot be in the future";
    } catch {}
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit() {
    setStatus("");
    if (!validate()) return;
    const payload = { facility: facility.trim(), weightKg: Number(weightKg), time: new Date(time).toISOString(), notes: note.trim() || undefined };

    // Try online first via service (adds base URL + Authorization)
    if (navigator.onLine) {
      try {
        await createDropoff(payload);
        setStatus("Submitted ✔");
        return;
      } catch (e) {
        // fall back to offline queue
      }
    }

    // Enqueue for later with absolute URL and auth header
    try {
      const token = getToken();
      const url = `${window.location.origin}/api/dropoffs`;
      enqueue({ id: String(Date.now()), url, method: "POST", body: payload, headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      setStatus("Saved offline. Will send when online.");
    } catch {
      setStatus("Failed to save offline");
    }
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
                   aria-invalid={Boolean(errors.facility)}
                   className="rounded-xl border px-3 py-3" placeholder="Central Recycling Center" />
            {errors.facility && <span className="text-xs" style={{ color: "#b91c1c" }}>{errors.facility}</span>}
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Weight (kg)</span>
            <input type="number" min={0} step="0.1" value={weightKg}
                   onChange={e => setWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
                   className="rounded-xl border px-3 py-3" placeholder="e.g., 450.0" />
            {errors.weightKg && <span className="text-xs" style={{ color: "#b91c1c" }}>{errors.weightKg}</span>}
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Time</span>
            <input type="datetime-local" value={time} onChange={e => setTime(e.target.value)}
                   aria-invalid={Boolean(errors.time)}
                   className="rounded-xl border px-3 py-3" />
            {errors.time && <span className="text-xs" style={{ color: "#b91c1c" }}>{errors.time}</span>}
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
