// frontend/src/pages/DailyReport.tsx
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { fetchDailyReport, downloadDailyReportPdf } from "../services/reports";

type Totals = { assigned: number; collected: number; missed: number; skipped: number };
type Activity = {
  id: string;
  action: "collected" | "missed" | "skipped";
  createdAt: string;            // ISO
  stopId: string;
  stopTitle: string;
  reason?: string | null;
};
type Dropoff = { time?: string; facility?: string; weightKg?: number; notes?: string };
type DropoffTotals = { count: number; weightKg: number };

export default function DailyReport() {
  const [date] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState<Totals>({ assigned: 0, collected: 0, missed: 0, skipped: 0 });
  const [activity, setActivity] = useState<Activity[]>([]);
  const [dropoffs, setDropoffs] = useState<Dropoff[]>([]);
  const [dropoffTotals, setDropoffTotals] = useState<DropoffTotals>({ count: 0, weightKg: 0 });

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const r = await fetchDailyReport(date);
      setTotals(r.totals);
      setActivity(r.activity);
      setDropoffs(r.dropoffs ?? []);
      setDropoffTotals(r.dropoffTotals ?? { count: 0, weightKg: 0 });
    } catch (e: any) {
      console.error(e);
      setError(`Failed to load report (HTTP?)`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [date]);

  const doneToday = useMemo(
    () => totals.collected + totals.missed + totals.skipped,
    [totals]
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold">Daily Report</h1>
            <p className="text-sm text-slate-600">Summary of today’s pickups ({date}).</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              className="rounded-xl px-3 py-2 bg-slate-100 hover:bg-slate-200"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => downloadDailyReportPdf(date)}
              className="rounded-xl px-3 py-2 text-white"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Download PDF
            </button>
          </div>
        </div>

        {loading && <div className="mt-3 text-sm text-slate-500">Loading…</div>}
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        <div className="mt-4 grid grid-cols-4 gap-3">
          <Stat label="Assigned" value={totals.assigned} />
          <Stat label="Collected" value={totals.collected} />
          <Stat label="Missed" value={totals.missed} />
          <Stat label="Skipped" value={totals.skipped} />
        </div>

        <div className="mt-2 text-sm text-slate-600">
          {doneToday} of {totals.assigned} stops have updates today.
        </div>

        <div className="mt-6">
          <h2 className="font-semibold mb-2">Activity</h2>
          <ul className="divide-y">
            {activity.map(a => (
              <li key={a.id} className="py-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase">{a.action}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-slate-700">{a.stopTitle}</div>
                {a.reason ? (
                  <div className="text-xs text-slate-500 mt-1">Reason: {a.reason}</div>
                ) : null}
              </li>
            ))}
            {!loading && activity.length === 0 && (
              <li className="py-6 text-slate-500">No activity recorded today.</li>
            )}
          </ul>
        </div>

        <div className="mt-8">
          <h2 className="font-semibold mb-2">Drop-offs</h2>
          <div className="text-sm text-slate-600 mb-2">
            Total: {dropoffTotals.count} • Weight: {dropoffTotals.weightKg.toFixed(2)} kg
          </div>
          <ul className="divide-y">
            {dropoffs.map((d, idx) => (
              <li key={idx} className="py-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{d.facility || "(Facility)"}</span>
                  <span className="text-xs text-slate-500">{d.time ? new Date(d.time).toLocaleString() : "-"}</span>
                </div>
                <div className="text-sm text-slate-700">Weight: {(d.weightKg ?? 0).toFixed(2)} kg</div>
                {d.notes ? <div className="text-xs text-slate-500 mt-1">Notes: {d.notes}</div> : null}
              </li>
            ))}
            {!loading && dropoffs.length === 0 && (
              <li className="py-6 text-slate-500">No drop-offs recorded today.</li>
            )}
          </ul>
        </div>
      </div>
    </Layout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-3 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  );
}
